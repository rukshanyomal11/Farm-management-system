const { promisePool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all inventory items for a farm
const getAllInventory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, search, sortBy = 'created_at', order = 'DESC' } = req.query;

    console.log('📦 Fetching inventory for user:', userId);

    // Get user's farm
    const [farms] = await promisePool.query(
      'SELECT id, farm_name FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm found for this user'
      });
    }

    const farmId = farms[0].id;

    // Build query
    let query = `
      SELECT *
      FROM inventory
      WHERE farm_id = ?
    `;
    const params = [farmId];

    // Add filters
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (item_name LIKE ? OR supplier_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    const allowedSortFields = ['item_name', 'category', 'quantity', 'total_value', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const [inventory] = await promisePool.query(query, params);

    // Get statistics
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity * unit_price) as total_value,
        SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_items,
        SUM(CASE WHEN category = 'feed' THEN 1 ELSE 0 END) as feed_items,
        SUM(CASE WHEN category = 'fertilizer' THEN 1 ELSE 0 END) as fertilizer_items,
        SUM(CASE WHEN category = 'medicine' THEN 1 ELSE 0 END) as medicine_items,
        SUM(CASE WHEN category = 'equipment' THEN 1 ELSE 0 END) as equipment_items
      FROM inventory
      WHERE farm_id = ?
    `, [farmId]);

    res.json({
      status: 'success',
      data: {
        inventory,
        statistics: stats[0]
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch inventory'
    });
  }
};

// Get inventory item by ID
const getInventoryById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { inventoryId } = req.params;

    // Get user's farm
    const [farms] = await promisePool.query(
      'SELECT id FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm found for this user'
      });
    }

    const farmId = farms[0].id;

    // Get inventory item
    const [items] = await promisePool.query(
      'SELECT * FROM inventory WHERE id = ? AND farm_id = ?',
      [inventoryId, farmId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        item: items[0]
      }
    });

  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch inventory item'
    });
  }
};

// Create inventory item
const createInventory = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const {
      itemName,
      category,
      quantity,
      unit,
      unitPrice,
      reorderLevel,
      supplierName,
      supplierContact,
      location,
      purchaseDate,
      expiryDate,
      notes
    } = req.body;

    console.log('📦 Creating inventory item for user:', userId);

    // Validate required fields
    if (!itemName || !category || !unit) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Item name, category, and unit are required'
      });
    }

    // Get user's farm
    const [farms] = await connection.query(
      'SELECT id FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'No farm found. Please create a farm first.'
      });
    }

    const farmId = farms[0].id;
    const inventoryId = uuidv4();

    // Insert inventory item
    await connection.query(`
      INSERT INTO inventory (
        id, farm_id, item_name, category, quantity, unit,
        unit_price, reorder_level, supplier_name, supplier_contact,
        location, purchase_date, expiry_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      inventoryId,
      farmId,
      itemName.trim(),
      category,
      quantity || 0,
      unit,
      unitPrice || null,
      reorderLevel || null,
      supplierName?.trim() || null,
      supplierContact?.trim() || null,
      location?.trim() || null,
      purchaseDate || null,
      expiryDate || null,
      notes?.trim() || null
    ]);

    await connection.commit();
    console.log('✅ Inventory item created:', inventoryId);

    res.status(201).json({
      status: 'success',
      message: 'Inventory item created successfully',
      data: {
        inventoryId
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Create inventory error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create inventory item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// Update inventory item
const updateInventory = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { inventoryId } = req.params;
    const {
      itemName,
      category,
      quantity,
      unit,
      unitPrice,
      reorderLevel,
      supplierName,
      supplierContact,
      location,
      purchaseDate,
      expiryDate,
      notes
    } = req.body;

    // Get user's farm
    const [farms] = await connection.query(
      'SELECT id FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'No farm found for this user'
      });
    }

    const farmId = farms[0].id;

    // Check if item exists
    const [existing] = await connection.query(
      'SELECT id FROM inventory WHERE id = ? AND farm_id = ?',
      [inventoryId, farmId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      });
    }

    // Update inventory
    await connection.query(`
      UPDATE inventory SET
        item_name = COALESCE(?, item_name),
        category = COALESCE(?, category),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        unit_price = ?,
        reorder_level = ?,
        supplier_name = ?,
        supplier_contact = ?,
        location = ?,
        purchase_date = ?,
        expiry_date = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND farm_id = ?
    `, [
      itemName?.trim() || null,
      category || null,
      quantity !== undefined ? quantity : null,
      unit || null,
      unitPrice || null,
      reorderLevel || null,
      supplierName?.trim() || null,
      supplierContact?.trim() || null,
      location?.trim() || null,
      purchaseDate || null,
      expiryDate || null,
      notes?.trim() || null,
      inventoryId,
      farmId
    ]);

    await connection.commit();
    console.log('✅ Inventory item updated:', inventoryId);

    res.json({
      status: 'success',
      message: 'Inventory item updated successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update inventory error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update inventory item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// Delete inventory item
const deleteInventory = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { inventoryId } = req.params;

    // Get user's farm
    const [farms] = await connection.query(
      'SELECT id FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'No farm found for this user'
      });
    }

    const farmId = farms[0].id;

    // Delete item
    const [result] = await connection.query(
      'DELETE FROM inventory WHERE id = ? AND farm_id = ?',
      [inventoryId, farmId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      });
    }

    await connection.commit();
    console.log('✅ Inventory item deleted:', inventoryId);

    res.json({
      status: 'success',
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete inventory error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete inventory item'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
};
