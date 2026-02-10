const router = require('express').Router();
const controller = require('../controllers/project.controller');
const auth = require('../middleware/auth.middleware');

router.post('/projects', auth, controller.createProject);
router.get('/projects', auth, controller.listProjects);

//  SUPER ADMIN — get all projects
router.get('/projects/all', auth, controller.listAllProjects);

router.put('/projects/:projectId', auth, controller.updateProject);
router.delete('/projects/:projectId', auth, controller.deleteProject);

module.exports = router;
