const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllUsers,
  updateUserStatus,
  getUserDetails,
  deleteUser,
  getAllFarms,
  getDashboardStats
} = require('../controllers/adminAuthController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected admin routes
router.get('/profile', authenticateToken, requireRole(['super_admin']), getAdminProfile);
router.get('/dashboard/stats', authenticateToken, requireRole(['super_admin']), getDashboardStats);

// User management
router.get('/users', authenticateToken, requireRole(['super_admin']), getAllUsers);
router.get('/users/:userId', authenticateToken, requireRole(['super_admin']), getUserDetails);
router.patch('/users/:userId/status', authenticateToken, requireRole(['super_admin']), updateUserStatus);
router.delete('/users/:userId', authenticateToken, requireRole(['super_admin']), deleteUser);

// Farm management
router.get('/farms', authenticateToken, requireRole(['super_admin']), getAllFarms);

module.exports = router;
