const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/tenant.controller');

// Get tenant details
router.get('/:tenantId',auth,controller.getTenantDetails);

// Update tenant
router.put('/:tenantId',auth,controller.updateTenant);

// List all tenants (super admin only)
router.get('/',auth,role('super_admin'),controller.listTenants);

module.exports = router;
