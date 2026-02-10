const db = require('../config/db');
const auditService = require('./audit.service');

/**
 * =====================================
 * API 12 — Create Project
 * POST /api/projects
 * =====================================
 */
exports.createProject = async ({
  name,
  description = null,
  status = 'active',
  requester
}) => {
  if (!requester || !requester.tenantId || !requester.userId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const client = await db.connect();
  let createdProject;

  try {
    await client.query('BEGIN');

    /**
     * 🔒 Lock tenant row
     */
    const tenantRes = await client.query(
      `
      SELECT max_projects
      FROM tenants
      WHERE id = $1
      FOR UPDATE
      `,
      [requester.tenantId]
    );

    if (!tenantRes.rowCount) {
      const err = new Error('Tenant not found');
      err.statusCode = 404;
      throw err;
    }

    const maxProjects = tenantRes.rows[0].max_projects;

    /**
     * ✅ IMPORTANT FIX: CAST COUNT TO INTEGER
     */
    const countRes = await client.query(
      `
      SELECT COUNT(*)::INT AS count
      FROM projects
      WHERE tenant_id = $1
      `,
      [requester.tenantId]
    );

    const projectCount = countRes.rows[0].count;

    if (projectCount >= maxProjects) {
      const err = new Error('Project limit reached');
      err.statusCode = 403;
      throw err;
    }

    /**
     * Create project
     */
    const result = await client.query(
      `
      INSERT INTO projects (
        tenant_id,
        name,
        description,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        tenant_id,
        name,
        description,
        status,
        created_by,
        created_at
      `,
      [
        requester.tenantId,
        name,
        description,
        status,
        requester.userId
      ]
    );

    createdProject = result.rows[0];

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  /**
   * Audit AFTER commit
   */
  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'PROJECT_CREATED',
    entityType: 'project',
    entityId: createdProject.id
  });

  return createdProject;
};

/**
 * =====================================
 * API 13 — List Projects
 * GET /api/projects
 * =====================================
 */
exports.listProjects = async ({
  requester,
  status,
  search,
  page = 1,
  limit = 20
}) => {
  if (!requester || !requester.tenantId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const offset = (page - 1) * limit;
  const params = [requester.tenantId];
  let where = 'WHERE p.tenant_id = $1';

  if (status) {
    params.push(status);
    where += ` AND p.status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    where += ` AND p.name ILIKE $${params.length}`;
  }

  const projectsQuery = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.status,
      p.created_at,
      json_build_object(
        'id', u.id,
        'fullName', u.full_name
      ) AS createdBy,
      COUNT(t.id) AS taskCount,
      COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completedTaskCount
    FROM projects p
    JOIN users u ON u.id = p.created_by
    LEFT JOIN tasks t ON t.project_id = p.id
    ${where}
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM projects p ${where}
  `;

  const [projectsRes, countRes] = await Promise.all([
    db.query(projectsQuery, params),
    db.query(countQuery, params)
  ]);

  const total = parseInt(countRes.rows[0].count, 10);

  return {
    projects: projectsRes.rows,
    total,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit
    }
  };
};

/**
 * =====================================
 * API 14 — Update Project
 * =====================================
 */
exports.updateProject = async ({
  projectId,
  requester,
  name,
  description,
  status
}) => {
  if (!requester || !requester.tenantId || !requester.userId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const projectRes = await db.query(
    `SELECT tenant_id, created_by FROM projects WHERE id = $1`,
    [projectId]
  );

  if (!projectRes.rowCount) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  const project = projectRes.rows[0];

  if (project.tenant_id !== requester.tenantId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  if (
    requester.role !== 'tenant_admin' &&
    requester.userId !== project.created_by
  ) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  const updates = [];
  const params = [];
  let index = 1;
  const updatedFields = [];

  if (name) {
    updates.push(`name = $${index++}`);
    params.push(name);
    updatedFields.push('name');
  }

  if (description !== undefined) {
    updates.push(`description = $${index++}`);
    params.push(description);
    updatedFields.push('description');
  }

  if (status) {
    updates.push(`status = $${index++}`);
    params.push(status);
    updatedFields.push('status');
  }

  if (!updates.length) {
    const err = new Error('No fields to update');
    err.statusCode = 400;
    throw err;
  }

  params.push(projectId);

  const result = await db.query(
    `
    UPDATE projects
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING id, name, description, status, updated_at
    `,
    params
  );

  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'PROJECT_UPDATED',
    entityType: 'project',
    entityId: projectId,
    metadata: { updatedFields }
  });

  return result.rows[0];
};

/**
 * =====================================
 * API 15 — Delete Project
 * =====================================
 */
exports.deleteProject = async ({ projectId, requester }) => {
  if (!requester || !requester.tenantId || !requester.userId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const projectRes = await db.query(
    `SELECT tenant_id, created_by FROM projects WHERE id = $1`,
    [projectId]
  );

  if (!projectRes.rowCount) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  const project = projectRes.rows[0];

  if (project.tenant_id !== requester.tenantId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  if (
    requester.role !== 'tenant_admin' &&
    requester.userId !== project.created_by
  ) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  await db.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
  await db.query('DELETE FROM projects WHERE id = $1', [projectId]);

  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'PROJECT_DELETED',
    entityType: 'project',
    entityId: projectId
  });
};

/**
 * =====================================
 * SUPER ADMIN — List All Projects
 * GET /api/projects/all
 * =====================================
 */
exports.listAllProjects = async () => {
  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.status,
      p.created_at,
      p.tenant_id,
      json_build_object(
        'id', u.id,
        'fullName', u.full_name
      ) AS createdBy,
      COUNT(t.id) AS taskCount,
      COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completedTaskCount
    FROM projects p
    JOIN users u ON u.id = p.created_by
    LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
  `);

  return result.rows;
};
