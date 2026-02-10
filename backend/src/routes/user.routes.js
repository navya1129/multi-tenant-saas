const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/user.controller');

// API 8 — Add user to tenant
router.post(
  '/api/tenants/:tenantId/users',
  auth,
  role('tenant_admin'),
  controller.addUser
);

// API 9 — List tenant users
router.get(
  '/api/tenants/:tenantId/users',
  auth,
  controller.listUsers
);

// API 10 — Update user
router.put(
  '/api/users/:userId',
  auth,
  controller.updateUser
);

// API 11 — Delete user
router.delete(
  '/api/users/:userId',
  auth,
  role('tenant_admin'),
  controller.deleteUser
);

module.exports = router;
