const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const taskController = require('../controllers/task.controller');

router.post('/projects/:projectId/tasks', auth, taskController.createTask);
router.get('/projects/:projectId/tasks', auth, taskController.listTasks);

router.get('/tasks/all', auth, taskController.listAllTasks);

router.patch('/tasks/:taskId/status', auth, taskController.updateTaskStatus);
router.put('/tasks/:taskId', auth, taskController.updateTask);
router.delete('/tasks/:taskId', auth, taskController.deleteTask);

module.exports = router;
