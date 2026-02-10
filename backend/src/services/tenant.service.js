const db = require('../config/db');
const auditService = require('./audit.service');

/**
 * GET TENANT DETAILS
 */
exports.getTenantDetails = async (tenantId, user) => {
  if (user.role !== 'super_admin' && user.tenantId !== tenantId) {
    throw new Error('Unauthorized access');
  }

  const tenantRes = await db.query(
    `SELECT id, name, subdomain, status, subscription_plan,
            max_users, max_projects, created_at
     FROM tenants WHERE id=$1`,
    [tenantId]
  );

  if (!tenantRes.rowCount) throw new Error('Tenant not found');

  const stats = await db.query(
    `
    SELECT
      (SELECT COUNT(*) FROM users WHERE tenant_id=$1) AS total_users,
      (SELECT COUNT(*) FROM projects WHERE tenant_id=$1) AS total_projects,
      (SELECT COUNT(*) FROM tasks WHERE tenant_id=$1) AS total_tasks
    `,
    [tenantId]
  );

  return {
    success: true,
    data: {
      ...tenantRes.rows[0],
      stats: stats.rows[0]
    }
  };
};

/**
 * UPDATE TENANT
 */
exports.updateTenant = async (tenantId, user, payload, ipAddress = null) => {
  if (user.role !== 'super_admin' && user.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  // Tenant admin can ONLY update name
  if (user.role === 'tenant_admin') {
    payload = { name: payload.name };
  }

  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in payload) {
    if (payload[key] !== undefined) {
      fields.push(`${key}=$${idx++}`);
      values.push(payload[key]);
    }
  }

  if (!fields.length) {
    throw new Error('No valid fields to update');
  }

  const res = await db.query(
    `
    UPDATE tenants
    SET ${fields.join(', ')}, updated_at=NOW()
    WHERE id=$${idx}
    RETURNING id, name, status, subscription_plan, updated_at
    `,
    [...values, tenantId]
  );

  const updatedTenant = res.rows[0];

  /* -------------------------------
     AUDIT LOG
  -------------------------------- */
  await auditService.logAudit({
    tenantId,
    userId: user.id,               // who performed the action
    action: 'TENANT_UPDATED',
    entityType: 'tenant',
    entityId: tenantId,
    ipAddress
  });

  return {
    success: true,
    message: 'Tenant updated successfully',
    data: updatedTenant
  };
};

/**
 * LIST ALL TENANTS (SUPER ADMIN)
 */
exports.listTenants = async ({ page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const tenants = await db.query(
    `
    SELECT t.id, t.name, t.subdomain, t.status, t.subscription_plan,
           COUNT(DISTINCT u.id) AS total_users,
           COUNT(DISTINCT p.id) AS total_projects
    FROM tenants t
    LEFT JOIN users u ON u.tenant_id=t.id
    LEFT JOIN projects p ON p.tenant_id=t.id
    GROUP BY t.id
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const count = await db.query(`SELECT COUNT(*) FROM tenants`);

  return {
    success: true,
    data: {
      tenants: tenants.rows,
      pagination: {
        currentPage: Number(page),
        totalTenants: Number(count.rows[0].count),
        limit: Number(limit)
      }
    }
  };
};
