const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(verifyToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/', userController.getFarmWorkers); // Get farm workers for task assignment
router.put('/:id', userController.updateUser); // Update user (staff management)

module.exports = router;
