const service = require('../services/tenant.service');

exports.getTenantDetails = async (req, res, next) => {
  try {
    const result = await service.getTenantDetails(
      req.params.tenantId,
      req.user
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateTenant = async (req, res, next) => {
  try {
    const result = await service.updateTenant(
      req.params.tenantId,
      req.user,
      req.body
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listTenants = async (req, res, next) => {
  try {
    const result = await service.listTenants(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
