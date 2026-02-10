const projectService = require('../services/project.service');

exports.createProject = async (req, res) => {
  const project = await projectService.createProject({
    ...req.body,
    requester: req.user
  });

  res.status(201).json({ success: true, data: project });
};

exports.listProjects = async (req, res) => {
  const result = await projectService.listProjects({
    ...req.query,
    requester: req.user
  });

  res.json({
    success: true,
    data: {
      projects: result.projects,
      total: result.total
    }
  });
};

exports.updateProject = async (req, res) => {
  const project = await projectService.updateProject({
    projectId: req.params.projectId,
    ...req.body,
    requester: req.user
  });

  res.json({ success: true, message: 'Project updated successfully', data: project });
};

exports.deleteProject = async (req, res) => {
  await projectService.deleteProject({
    projectId: req.params.projectId,
    requester: req.user
  });

  res.json({ success: true, message: 'Project deleted successfully' });
};

exports.listAllProjects = async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const projects = await projectService.listAllProjects();

  res.json({
    success: true,
    data: projects
  });
};
