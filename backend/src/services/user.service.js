// src/services/user.service.js
const db = require('../config/db');
const { hashPassword } = require('../utils/password');
const auditService = require('./audit.service');

/**
 * API 8 — Add User to Tenant
 */
exports.createUser = async ({
  tenantId,
  email,
  password,
  full_name,
  role = 'user',
  requester
}) => {
  if (!requester) {
    throw new Error('Requester context missing');
  }

  // Only tenant_admin can create users
  if (requester.role !== 'tenant_admin') {
    throw new Error('Not authorized');
  }

  // Prevent role escalation
  if (role === 'tenant_admin' && requester.role !== 'tenant_admin') {
    throw new Error('Not authorized to assign tenant_admin role');
  }

  // 1. Check tenant limits
  const countRes = await db.query(
    'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
    [tenantId]
  );

  const tenantRes = await db.query(
    'SELECT max_users FROM tenants WHERE id = $1',
    [tenantId]
  );

  if (!tenantRes.rowCount) {
    throw new Error('Tenant not found');
  }

  if (parseInt(countRes.rows[0].count) >= tenantRes.rows[0].max_users) {
    throw new Error('Subscription limit reached');
  }

  // 2. Check email uniqueness per tenant
  const exists = await db.query(
    'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
    [tenantId, email]
  );

  if (exists.rowCount) {
    throw new Error('Email already exists in this tenant');
  }

  // 3. Hash password
  const passwordHash = await hashPassword(password);

  // 4. Insert user
  const result = await db.query(
    `
    INSERT INTO users (
      tenant_id,
      email,
      password_hash,
      full_name,
      role
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      email,
      full_name,
      role,
      is_active,
      created_at
    `,
    [tenantId, email, passwordHash, full_name, role]
  );

  // 5. Audit log
  await auditService.logAudit({
    tenantId,
    userId: requester.userId,
    action: 'USER_CREATED',
    entityType: 'user',
    entityId: result.rows[0].id
  });

  return result.rows[0];
};

/**
 * API 9 — List Tenant Users
 */
exports.listUsers = async ({
  tenantId,
  search,
  role,
  page = 1,
  limit = 50
}) => {
  const offset = (page - 1) * limit;
  const params = [tenantId];
  let where = 'WHERE tenant_id = $1';

  if (search) {
    params.push(`%${search}%`);
    where += ` AND (email ILIKE $${params.length} OR full_name ILIKE $${params.length})`;
  }

  if (role) {
    params.push(role);
    where += ` AND role = $${params.length}`;
  }

  const usersQuery = `
    SELECT
      id,
      email,
      full_name,
      role,
      is_active,
      created_at
    FROM users
    ${where}
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM users ${where}
  `;

  const [usersRes, countRes] = await Promise.all([
    db.query(usersQuery, params),
    db.query(countQuery, params)
  ]);

  return {
    users: usersRes.rows,
    total: parseInt(countRes.rows[0].count)
  };
};

/**
 * API 10 — Update User
 */
exports.updateUser = async ({
  requester,
  userId,
  full_name,
  role,
  isActive
}) => {
  if (!requester) {
    throw new Error('Requester context missing');
  }

  const userRes = await db.query(
    'SELECT id, tenant_id FROM users WHERE id = $1',
    [userId]
  );

  if (!userRes.rowCount) {
    throw new Error('User not found');
  }

  const user = userRes.rows[0];

  // Tenant isolation
  if (user.tenant_id !== requester.tenantId) {
    throw new Error('Unauthorized tenant access');
  }

  const isSelf = requester.userId === userId;

  // Self can only update full_name
  if (isSelf && (role !== undefined || isActive !== undefined) && requester.role!="tenant_admin") {
    throw new Error('Not authorized to update role or active status');
  }

  const updates = [];
  const params = [];
  let index = 1;

  if (full_name) {
    updates.push(`full_name = $${index++}`);
    params.push(full_name);
  }

  // Only tenant_admin can update role or is_active
  if (requester.role === 'tenant_admin') {
    if (role) {
      updates.push(`role = $${index++}`);
      params.push(role);
    }
    if (typeof isActive === 'boolean') {
      updates.push(`is_active = $${index++}`);
      params.push(isActive);
    }
  }

  if (!updates.length) {
    throw new Error('No valid fields to update');
  }

  params.push(userId);

  const result = await db.query(
    `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING id, full_name, role, updated_at
    `,
    params
  );

  // Audit log
  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'USER_UPDATED',
    entityType: 'user',
    entityId: userId
  });

  return result.rows[0];
};

/**
 * API 11 — Delete User
 */
exports.deleteUser = async ({ requester, userId }) => {
  if (!requester) {
    throw new Error('Requester context missing');
  }

  if (requester.userId === userId) {
    throw new Error('Cannot delete self');
  }

  const userRes = await db.query(
    'SELECT tenant_id FROM users WHERE id = $1',
    [userId]
  );

  if (!userRes.rowCount) {
    throw new Error('User not found');
  }

  if (userRes.rows[0].tenant_id !== requester.tenantId) {
    throw new Error('Unauthorized tenant access');
  }

  // Unassign tasks
  await db.query(
    'UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1',
    [userId]
  );

  // Delete user
  await db.query('DELETE FROM users WHERE id = $1', [userId]);

  // Audit log
  await auditService.logAudit({
    tenantId: requester.tenantId,
    userId: requester.userId,
    action: 'USER_DELETED',
    entityType: 'user',
    entityId: userId
  });
};
