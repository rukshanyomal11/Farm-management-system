const express = require('express');
const router = express.Router();
const farmMemberController = require('../controllers/farmMemberController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get staff coordination data (for managers)
router.get('/coordination', checkRole(['farm_owner', 'farm_manager']), farmMemberController.getStaffCoordination);

// Add worker to farm (farm owner only)
router.post('/', checkRole(['farm_owner']), farmMemberController.addWorkerToFarm);

// Get all farm workers
router.get('/', checkRole(['farm_owner', 'farm_manager']), farmMemberController.getFarmWorkers);

// Remove worker from farm (farm owner only)
router.delete('/:workerId', checkRole(['farm_owner']), farmMemberController.removeWorkerFromFarm);

module.exports = router;
