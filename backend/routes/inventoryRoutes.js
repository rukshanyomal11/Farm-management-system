const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
} = require('../controllers/inventoryController');

// All routes require authentication
router.use(verifyToken);

// Get all inventory items
router.get('/', checkRole(['farm_owner', 'farm_manager']), getAllInventory);

// Get inventory item by ID
router.get('/:inventoryId', checkRole(['farm_owner', 'farm_manager']), getInventoryById);

// Create inventory item
router.post('/', checkRole(['farm_owner', 'farm_manager']), createInventory);

// Update inventory item
router.put('/:inventoryId', checkRole(['farm_owner', 'farm_manager']), updateInventory);

// Delete inventory item
router.delete('/:inventoryId', checkRole(['farm_owner', 'farm_manager']), deleteInventory);

module.exports = router;
