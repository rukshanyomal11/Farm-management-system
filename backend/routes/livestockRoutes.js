const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getAllLivestock,
  getLivestockById,
  createLivestock,
  updateLivestock,
  deleteLivestock,
  updateLivestockStatus
} = require('../controllers/livestockController');

// All routes require authentication
router.use(verifyToken);

// Get all livestock for user's farm
router.get('/', checkRole(['farm_owner', 'farm_manager']), getAllLivestock);

// Get livestock by ID
router.get('/:livestockId', checkRole(['farm_owner', 'farm_manager', 'field_worker']), getLivestockById);

// Create new livestock
router.post('/', checkRole(['farm_owner', 'farm_manager']), createLivestock);

// Update livestock
router.put('/:livestockId', checkRole(['farm_owner', 'farm_manager']), updateLivestock);

// Update livestock status
router.patch('/:livestockId/status', checkRole(['farm_owner', 'farm_manager', 'field_worker']), updateLivestockStatus);

// Delete livestock
router.delete('/:livestockId', checkRole(['farm_owner', 'farm_manager']), deleteLivestock);

module.exports = router;
