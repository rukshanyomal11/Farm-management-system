const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getFarmerDashboard,
  getQuickStats
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(verifyToken);

// Get farmer dashboard overview
router.get('/farmer', checkRole(['farm_owner', 'farm_manager']), getFarmerDashboard);

// Get quick stats
router.get('/stats', checkRole(['farm_owner', 'farm_manager']), getQuickStats);

module.exports = router;
