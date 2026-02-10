// src/services/audit.service.js
const db = require('../config/db');

/**
 * Log audit activity
 */
exports.logAudit = async ({
  tenantId,
  userId,          // ACTOR (who performed the action)
  action,
  entityType = null,
  entityId = null,
  ipAddress = null
}) => {
  if (!tenantId || !action) {
    throw new Error('Audit log requires tenantId and action');
  }

  await db.query(
    `
    INSERT INTO audit_logs (
      tenant_id,
      user_id,
      action,
      entity_type,
      entity_id,
      ip_address
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      tenantId,
      userId || null,
      action,
      entityType,
      entityId,
      ipAddress
    ]
  );
};
