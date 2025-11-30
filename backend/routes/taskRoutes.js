const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get my tasks (worker's assigned tasks)
router.get('/my-tasks', checkRole(['field_worker', 'farm_manager']), taskController.getMyTasks);

// Get all tasks (accessible by owner, manager, worker)
router.get('/', checkRole(['farm_owner', 'farm_manager', 'field_worker']), taskController.getAllTasks);

// Get single task
router.get('/:taskId', checkRole(['farm_owner', 'farm_manager', 'field_worker']), taskController.getTaskById);

// Create task (manager only)
router.post('/', checkRole(['farm_manager']), taskController.createTask);

// Update task (manager only)
router.put('/:taskId', checkRole(['farm_manager']), taskController.updateTask);

// Delete task (manager only)
router.delete('/:taskId', checkRole(['farm_manager']), taskController.deleteTask);

// Update task status (all roles can update status)
router.patch('/:taskId/status', checkRole(['farm_owner', 'farm_manager', 'field_worker']), taskController.updateTaskStatus);

module.exports = router;
