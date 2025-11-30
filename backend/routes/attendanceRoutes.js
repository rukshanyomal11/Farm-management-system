const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Mark/update attendance (workers can mark their own, managers can mark anyone's)
router.post('/', checkRole(['farm_owner', 'farm_manager', 'field_worker']), attendanceController.markAttendance);

// Bulk mark attendance (managers and owners only)
router.post('/bulk', checkRole(['farm_owner', 'farm_manager']), attendanceController.bulkMarkAttendance);

// Get all attendance records (managers and owners only)
router.get('/', checkRole(['farm_owner', 'farm_manager']), attendanceController.getAttendance);

// Get worker attendance summary (managers and owners)
router.get('/summary', checkRole(['farm_owner', 'farm_manager', 'field_worker']), attendanceController.getWorkerSummary);

// Get worker's own attendance (workers can view their own)
router.get('/my-attendance', checkRole(['field_worker', 'farm_manager']), attendanceController.getWorkerAttendance);

module.exports = router;
