const taskService = require('../services/task.service');

/*Create Task*/
exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask({
      projectId: req.params.projectId,
      ...req.body,
      requester: req.user
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/*List Project Tasks*/
exports.listTasks = async (req, res, next) => {
  try {
    const result = await taskService.listTasks({
      projectId: req.params.projectId,
      ...req.query,
      requester: req.user
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/*API 18 — Update Task Status*/
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus({
      taskId: req.params.taskId,
      status: req.body.status,
      requester: req.user
    });

    res.json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/*API 19 — Update Task*/
exports.updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask({
      taskId: req.params.taskId,
      ...req.body,
      requester: req.user
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

exports.listAllTasks = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const tasks = await taskService.listAllTasks();

    res.json({
      success: true,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// task.controller.js

exports.deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask({
      taskId: req.params.taskId,
      requester: req.user
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

