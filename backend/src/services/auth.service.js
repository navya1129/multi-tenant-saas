const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/password");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt");

/**
 * ===============================
 * REGISTER TENANT
 * POST /api/auth/register-tenant
 * ===============================
 */
exports.registerTenant = async ({
  tenantName,
  subdomain,
  adminEmail,
  adminPassword,
  adminFullName,
}) => {
  //  Validate required fields
  if (
    !tenantName ||
    !subdomain ||
    !adminEmail ||
    !adminPassword ||
    !adminFullName
  ) {
    throw new Error("All fields are required");
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check subdomain uniqueness
    const existingTenant = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (existingTenant.rowCount > 0) {
      throw new Error("Subdomain already exists");
    }

    // Create tenant
    const tenantResult = await client.query(
      `
      INSERT INTO tenants (
        name,
        subdomain,
        status,
        subscription_plan,
        max_users,
        max_projects
      )
      VALUES ($1, $2, 'active', 'free', 5, 3)
      RETURNING id
      `,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    // Hash admin password
    const passwordHash = await hashPassword(adminPassword);

    // Create tenant admin user
    const adminUserResult = await client.query(
      `
      INSERT INTO users (
        tenant_id,
        email,
        password_hash,
        full_name,
        role,
        is_active
      )
      VALUES ($1, $2, $3, $4, 'tenant_admin', true)
      RETURNING id, email, full_name, role
      `,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: adminUserResult.rows[0],
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("REGISTER TENANT ERROR:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * ===============================
 * LOGIN
 * POST /api/auth/login
 * ===============================
 */
exports.login = async ({ email, password, tenantSubdomain }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const userResult = await db.query(
    `
    SELECT id, email, password_hash, role, tenant_id, is_active
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (userResult.rowCount === 0) {
    throw new Error("Invalid credentials");
  }

  const user = userResult.rows[0];

  if (!user.is_active) {
    throw new Error("Account suspended");
  }

  const passwordValid = await comparePassword(password, user.password_hash);
  if (!passwordValid) {
    throw new Error("Invalid credentials");
  }

  // Super admin login (no tenant)
  if (user.role === "super_admin") {
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
        expiresIn: 86400,
      },
    };
  }

  // Tenant user login
  if (!tenantSubdomain) {
    throw new Error("Tenant subdomain required");
  }

  const tenantResult = await db.query(
    "SELECT id, status FROM tenants WHERE subdomain = $1",
    [tenantSubdomain]
  );

  if (tenantResult.rowCount === 0) {
    throw new Error("Tenant not found");
  }

  const tenant = tenantResult.rows[0];

  if (tenant.status !== "active") {
    throw new Error("Tenant inactive or suspended");
  }

  if (user.tenant_id !== tenant.id) {
    throw new Error("Unauthorized tenant access");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      },
      token,
      expiresIn: 86400,
    },
  };
};

/**
 * ===============================
 * GET CURRENT USER
 * GET /api/auth/me
 * ===============================
 */
exports.getCurrentUser = async ({ userId, tenantId, role }) => {
  let query;
  let params;

  if (role === 'super_admin') {
    query = `
      SELECT id, email, full_name, role, is_active
      FROM users
      WHERE id = $1
    `;
    params = [userId];
  } else {
    query = `
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.is_active,
        t.id AS tenant_id,
        t.name AS tenant_name,
        t.subdomain,
        t.subscription_plan,
        t.max_users,
        t.max_projects
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND t.id = $2
    `;
    params = [userId, tenantId];
  }

  const result = await db.query(query, params);

  if (result.rowCount === 0) {
    throw new Error('User not found');
  }

  return {
    success: true,
    data: result.rows[0]
  };
};

/**
 * ===============================
 * LOGOUT
 * POST /api/auth/logout
 * ===============================
 */
exports.logout = async () => {
  return {
    success: true,
    message: 'Logged out successfully'
  };
};
