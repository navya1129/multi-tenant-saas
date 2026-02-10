const userService = require('../services/user.service');

/*API 8 — Add User to Tenant*/
exports.addUser = async (req, res) => {
  const user = await userService.createUser({
    tenantId: req.params.tenantId,
    email: req.body.email,
    password: req.body.password,
    full_name: req.body.full_name,
    role: req.body.role,
    requester: req.user // ✅ FIX
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
};

/**
 * API 9 — List Tenant Users
 */
exports.listUsers = async (req, res) => {
  const result = await userService.listUsers({
    tenantId: req.params.tenantId,
    search: req.query.search,
    role: req.query.role,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50
  });

  res.json({
    success: true,
    data: {
      users: result.users,
      total: result.total
    }
  });
};

/**
 * API 10 — Update User
 */
exports.updateUser = async (req, res) => {
  const updatedUser = await userService.updateUser({
    requester: req.user, // ✅ FIX
    userId: req.params.userId,
    full_name: req.body.full_name,
    role: req.body.role,
    isActive: req.body.isActive
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
};

/**
 * API 11 — Delete User
 */
exports.deleteUser = async (req, res) => {
  await userService.deleteUser({
    requester: req.user, // ✅ FIX
    userId: req.params.userId
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};
