const authService = require("../services/auth.service");

exports.registerTenant = async (req, res) => {
  try {
    const result = await authService.registerTenant(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

exports.me = async (req, res) => {
  try {
    const result = await authService.getCurrentUser(req.user);
    res.json(result);
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

exports.logout = async (_req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
