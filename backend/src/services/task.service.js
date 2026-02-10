const db = require('../config/db');
const auditService = require('./audit.service');

/**
 * =====================================
 * API 16 — Create Task
 * =====================================
 */
exports.createTask = async ({
  projectId,
  title,
  description = null,
  assignedTo = null,
  priority = 'medium',
  dueDate = null,
  requester
}) => {
  // 1️⃣ Verify project exists & tenant isolation
  const projectRes = await db.query(
    `SELECT id, tenant_id FROM projects WHERE id = $1`,
    [projectId]
  );

  if (!projectRes.rowCount) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  const project = projectRes.rows[0];

  if (project.tenant_id !== requester.tenantId) {
    const err = new Error("Project doesn't belong to user's tenant");
    err.statusCode = 403;
    throw err;
  }

  // 2️⃣ If assignedTo provided → must belong to same tenant
  if (assignedTo) {
    const userRes = await db.query(
      `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
      [assignedTo, requester.tenantId]
    );

    if (!userRes.rowCount) {
      const err = new Error("assignedTo user doesn't belong to same tenant");
      err.statusCode = 400;
      throw err;
    }
  }

  // 3️⃣ Create task
  const result = await db.query(
    `
    INSERT INTO tasks (
      project_id,
      tenant_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date
    )
    VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
    RETURNING
      id,
      project_id,
      tenant_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      created_at
    `,
    [
      projectId,
      requester.tenantId,
      title,
      description,
      priority,
      assignedTo,
      dueDate
    ]
  );

  const task = result.rows[0];

  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'TASK_CREATED',
    entityType: 'task',
    entityId: task.id
  });

  return task;
};

/**
 * =====================================
 * API 17 — List Project Tasks
 * =====================================
 */
exports.listTasks = async ({
  projectId,
  status,
  assignedTo,
  priority,
  search,
  page = 1,
  limit = 50,
  requester
}) => {
  // Verify project tenant
  const projectRes = await db.query(
    `SELECT tenant_id FROM projects WHERE id = $1`,
    [projectId]
  );

  if (!projectRes.rowCount) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  if (projectRes.rows[0].tenant_id !== requester.tenantId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  const offset = (page - 1) * limit;
  const params = [projectId];
  let where = 'WHERE t.project_id = $1';

  if (status) {
    params.push(status);
    where += ` AND t.status = $${params.length}`;
  }

  if (assignedTo) {
    params.push(assignedTo);
    where += ` AND t.assigned_to = $${params.length}`;
  }

  if (priority) {
    params.push(priority);
    where += ` AND t.priority = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    where += ` AND t.title ILIKE $${params.length}`;
  }

  const tasksQuery = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      json_build_object(
        'id', u.id,
        'fullName', u.full_name,
        'email', u.email
      ) AS assignedTo
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    ${where}
    ORDER BY
      CASE t.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        ELSE 3
      END,
      t.due_date ASC NULLS LAST
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM tasks t ${where}
  `;

  const [tasksRes, countRes] = await Promise.all([
    db.query(tasksQuery, params),
    db.query(countQuery, params)
  ]);

  const total = parseInt(countRes.rows[0].count, 10);

  return {
    tasks: tasksRes.rows,
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
 * API 18 — Update Task Status
 * =====================================
 */
exports.updateTaskStatus = async ({ taskId, status, requester }) => {
  const taskRes = await db.query(
    `SELECT tenant_id FROM tasks WHERE id = $1`,
    [taskId]
  );

  if (!taskRes.rowCount) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  if (taskRes.rows[0].tenant_id !== requester.tenantId) {
    const err = new Error("Task doesn't belong to user's tenant");
    err.statusCode = 403;
    throw err;
  }

  const result = await db.query(
    `
    UPDATE tasks
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, status, updated_at
    `,
    [status, taskId]
  );

  return result.rows[0];
};

/**
 * =====================================
 * API 19 — Update Task
 * =====================================
 */
exports.updateTask = async ({
  taskId,
  title,
  description,
  status,
  priority,
  assignedTo,
  dueDate,
  requester
}) => {
  const taskRes = await db.query(
    `SELECT tenant_id FROM tasks WHERE id = $1`,
    [taskId]
  );

  if (!taskRes.rowCount) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  if (taskRes.rows[0].tenant_id !== requester.tenantId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  if (assignedTo) {
    const userRes = await db.query(
      `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
      [assignedTo, requester.tenantId]
    );

    if (!userRes.rowCount) {
      const err = new Error("assignedTo user doesn't belong to same tenant");
      err.statusCode = 400;
      throw err;
    }
  }

  const updates = [];
  const params = [];
  let index = 1;

  if (title) updates.push(`title = $${index++}`), params.push(title);
  if (description !== undefined)
    updates.push(`description = $${index++}`), params.push(description);
  if (status) updates.push(`status = $${index++}`), params.push(status);
  if (priority) updates.push(`priority = $${index++}`), params.push(priority);
  if (assignedTo !== undefined)
    updates.push(`assigned_to = $${index++}`), params.push(assignedTo);
  if (dueDate !== undefined)
    updates.push(`due_date = $${index++}`), params.push(dueDate);

  if (!updates.length) {
    const err = new Error('No fields to update');
    err.statusCode = 400;
    throw err;
  }

  params.push(taskId);

  const result = await db.query(
    `
    UPDATE tasks
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING
      id,
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      updated_at
    `,
    params
  );

  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'TASK_UPDATED',
    entityType: 'task',
    entityId: taskId
  });

  return result.rows[0];
};

/**
 * =====================================
 * SUPER ADMIN — List All Tasks
 * GET /api/tasks/all
 * =====================================
 */
exports.listAllTasks = async () => {
  const result = await db.query(`
    SELECT
      t.id,
      t.title,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      t.tenant_id,
      json_build_object(
        'id', u.id,
        'fullName', u.full_name,
        'email', u.email
      ) AS assignedTo,
      json_build_object(
        'id', p.id,
        'name', p.name
      ) AS project
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    JOIN projects p ON p.id = t.project_id
    ORDER BY t.created_at DESC
  `);

  return result.rows;
};

// task.service.js

/**
 * =====================================
 * API 20 — Delete Task
 * DELETE /api/tasks/:taskId
 * =====================================
 */
exports.deleteTask = async ({ taskId, requester }) => {
  const taskRes = await db.query(
    `SELECT id, tenant_id FROM tasks WHERE id = $1`,
    [taskId]
  );

  if (!taskRes.rowCount) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const task = taskRes.rows[0];

  if (task.tenant_id !== requester.tenantId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  await db.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);

  /** ✅ Audit log */
  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'TASK_DELETED',
    entityType: 'task',
    entityId: taskId
  });
};
