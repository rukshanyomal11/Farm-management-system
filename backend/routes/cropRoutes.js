const express = require('express');
const router = express.Router();
const {
  getAllCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
  updateCropStatus
} = require('../controllers/cropController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All crop routes require authentication
router.use(verifyToken);

// Get all crops (for farm owner/manager)
router.get('/', checkRole('farm_owner', 'farm_manager'), getAllCrops);

// Get single crop details
router.get('/:cropId', checkRole('farm_owner', 'farm_manager', 'field_worker'), getCropById);

// Create new crop
router.post('/', checkRole('farm_owner', 'farm_manager'), createCrop);

// Update crop
router.put('/:cropId', checkRole('farm_owner', 'farm_manager'), updateCrop);

// Update crop status
router.patch('/:cropId/status', checkRole('farm_owner', 'farm_manager', 'field_worker'), updateCropStatus);

// Delete crop
router.delete('/:cropId', checkRole('farm_owner', 'farm_manager'), deleteCrop);

module.exports = router;
