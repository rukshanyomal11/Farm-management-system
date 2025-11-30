const { promisePool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all livestock for a farm
const getAllLivestock = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, status, search, sortBy = 'created_at', order = 'DESC' } = req.query;

    console.log('🐄 Fetching livestock for user:', userId);
    console.log('Query params:', { type, status, search, sortBy, order });

    // Get user's farm
    const [farms] = await promisePool.query(
      'SELECT id, farm_name FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      console.log('❌ No farm found for user:', userId);
      return res.status(404).json({
        status: 'error',
        message: 'No farm found for this user'
      });
    }

    const farmId = farms[0].id;
    console.log('✅ Found farm:', farmId, farms[0].farm_name);

    // Build query
    let query = `
      SELECT 
        l.*
      FROM livestock l
      WHERE l.farm_id = ?
    `;
    const params = [farmId];

    // Add filters
    if (type) {
      query += ' AND l.type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (l.tag_number LIKE ? OR l.breed LIKE ? OR l.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add sorting
    const allowedSortFields = ['tag_number', 'type', 'birth_date', 'status', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY l.${sortField} ${sortOrder}`;

    console.log('📊 Executing query with params:', params);
    const [livestock] = await promisePool.query(query, params);
    console.log('✅ Found livestock:', livestock.length);

    // Get statistics
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'healthy' THEN 1 ELSE 0 END) as healthy,
        SUM(CASE WHEN status = 'sick' THEN 1 ELSE 0 END) as sick,
        SUM(CASE WHEN status = 'pregnant' THEN 1 ELSE 0 END) as pregnant,
        SUM(CASE WHEN type = 'cattle' THEN 1 ELSE 0 END) as cattle_count,
        SUM(CASE WHEN type = 'poultry' THEN 1 ELSE 0 END) as poultry_count,
        SUM(CASE WHEN type = 'sheep' THEN 1 ELSE 0 END) as sheep_count,
        SUM(CASE WHEN type = 'goat' THEN 1 ELSE 0 END) as goat_count
      FROM livestock
      WHERE farm_id = ?
    `, [farmId]);

    res.json({
      status: 'success',
      data: {
        livestock,
        statistics: stats[0]
      }
    });

  } catch (error) {
    console.error('Get all livestock error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch livestock'
    });
  }
};

// Get livestock by ID
const getLivestockById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { livestockId } = req.params;

    console.log('🔍 Fetching livestock:', livestockId, 'for user:', userId);

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

    // Get livestock details
    const [livestock] = await promisePool.query(`
      SELECT l.*
      FROM livestock l
      WHERE l.id = ? AND l.farm_id = ?
    `, [livestockId, farmId]);

    if (livestock.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Livestock not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        livestock: livestock[0]
      }
    });

  } catch (error) {
    console.error('Get livestock by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch livestock details'
    });
  }
};

// Create new livestock
const createLivestock = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const {
      tagNumber,
      name,
      type,
      breed,
      gender,
      birthDate,
      weight,
      status,
      purchaseDate,
      purchasePrice,
      notes
    } = req.body;

    console.log('🐄 Creating livestock for user:', userId);
    console.log('📝 Livestock data:', { tagNumber, name, type, breed, gender, birthDate, status });

    // Validate required fields
    if (!tagNumber || tagNumber.trim().length === 0) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Tag number is required',
        field: 'tagNumber'
      });
    }

    if (!type) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Livestock type is required',
        field: 'type'
      });
    }

    // Get user's farm
    console.log('🔍 Fetching farm for user:', userId);
    const [farms] = await connection.query(
      'SELECT id, farm_name FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      await connection.rollback();
      console.log('❌ No farm found for user:', userId);
      return res.status(404).json({
        status: 'error',
        message: 'No farm found. Please create a farm first.'
      });
    }

    const farmId = farms[0].id;
    console.log('✅ Found farm:', farmId, farms[0].farm_name);

    // Check if tag number already exists for this farm
    const [existingTag] = await connection.query(
      'SELECT id FROM livestock WHERE farm_id = ? AND tag_number = ?',
      [farmId, tagNumber]
    );

    if (existingTag.length > 0) {
      await connection.rollback();
      console.log('❌ Tag number already exists:', tagNumber);
      return res.status(409).json({
        status: 'error',
        message: 'Tag number already exists for this farm',
        field: 'tagNumber'
      });
    }

    // Generate UUID for livestock
    const livestockId = uuidv4();
    console.log('🆔 Generated livestock ID:', livestockId);

    // Prepare values
    const finalName = name && name.trim().length > 0 ? name : null;
    const finalBreed = breed && breed.trim().length > 0 ? breed : null;
    const finalWeight = weight && weight > 0 ? weight : null;
    const finalBirthDate = birthDate || null;
    const finalPurchaseDate = purchaseDate || null;
    const finalPurchasePrice = purchasePrice && purchasePrice > 0 ? purchasePrice : null;
    const finalNotes = notes && notes.trim().length > 0 ? notes : null;
    const finalStatus = status || 'healthy';

    console.log('📋 Prepared values:', {
      tagNumber: tagNumber.trim(),
      name: finalName,
      type,
      breed: finalBreed,
      gender,
      birthDate: finalBirthDate,
      weight: finalWeight,
      status: finalStatus
    });

    // Insert livestock
    console.log('💾 Inserting livestock into database...');
    const [result] = await connection.query(`
      INSERT INTO livestock (
        id, farm_id, tag_number, name, type, breed, gender,
        birth_date, weight, status, purchase_date, purchase_price, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      livestockId,
      farmId,
      tagNumber.trim(),
      finalName,
      type,
      finalBreed,
      gender,
      finalBirthDate,
      finalWeight,
      finalStatus,
      finalPurchaseDate,
      finalPurchasePrice,
      finalNotes
    ]);

    await connection.commit();
    console.log('✅ Livestock inserted with ID:', livestockId);
    console.log('✅ Transaction committed');

    res.status(201).json({
      status: 'success',
      message: 'Livestock created successfully',
      data: {
        livestockId,
        tagNumber: tagNumber.trim()
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Create livestock error:', error);

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        status: 'error',
        message: 'Livestock table does not exist. Please run database migration.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create livestock',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// Update livestock
const updateLivestock = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { livestockId } = req.params;
    const {
      tagNumber,
      name,
      type,
      breed,
      gender,
      birthDate,
      weight,
      status,
      purchaseDate,
      purchasePrice,
      notes
    } = req.body;

    console.log('📝 Updating livestock:', livestockId, 'for user:', userId);

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

    // Check if livestock exists and belongs to this farm
    const [existing] = await connection.query(
      'SELECT id FROM livestock WHERE id = ? AND farm_id = ?',
      [livestockId, farmId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Livestock not found or does not belong to your farm'
      });
    }

    // If tag number is being changed, check it doesn't already exist
    if (tagNumber) {
      const [existingTag] = await connection.query(
        'SELECT id FROM livestock WHERE farm_id = ? AND tag_number = ? AND id != ?',
        [farmId, tagNumber, livestockId]
      );

      if (existingTag.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          status: 'error',
          message: 'Tag number already exists for this farm',
          field: 'tagNumber'
        });
      }
    }

    // Update livestock
    const [result] = await connection.query(`
      UPDATE livestock SET
        tag_number = COALESCE(?, tag_number),
        name = ?,
        type = COALESCE(?, type),
        breed = ?,
        gender = COALESCE(?, gender),
        birth_date = COALESCE(?, birth_date),
        weight = ?,
        status = COALESCE(?, status),
        purchase_date = ?,
        purchase_price = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND farm_id = ?
    `, [
      tagNumber?.trim() || null,
      name?.trim() || null,
      type || null,
      breed?.trim() || null,
      gender || null,
      birthDate || null,
      weight || null,
      status || null,
      purchaseDate || null,
      purchasePrice || null,
      notes?.trim() || null,
      livestockId,
      farmId
    ]);

    await connection.commit();
    console.log('✅ Livestock updated:', livestockId);

    res.json({
      status: 'success',
      message: 'Livestock updated successfully',
      data: {
        livestockId
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Update livestock error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({
      status: 'error',
      message: 'Failed to update livestock',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// Delete livestock
const deleteLivestock = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { livestockId } = req.params;

    console.log('🗑️ Deleting livestock:', livestockId, 'for user:', userId);

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

    // Delete livestock (verify ownership)
    const [result] = await connection.query(
      'DELETE FROM livestock WHERE id = ? AND farm_id = ?',
      [livestockId, farmId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Livestock not found or does not belong to your farm'
      });
    }

    await connection.commit();
    console.log('✅ Livestock deleted:', livestockId);

    res.json({
      status: 'success',
      message: 'Livestock deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete livestock error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete livestock'
    });
  } finally {
    connection.release();
  }
};

// Update livestock status
const updateLivestockStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { livestockId } = req.params;
    const { status } = req.body;

    console.log('📝 Updating livestock status:', livestockId, 'to:', status);

    // Validate status
    const validStatuses = ['healthy', 'sick', 'pregnant', 'sold', 'deceased'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value',
        field: 'status'
      });
    }

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

    // Update status
    const [result] = await promisePool.query(
      'UPDATE livestock SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND farm_id = ?',
      [status, livestockId, farmId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Livestock not found or does not belong to your farm'
      });
    }

    console.log('✅ Status updated successfully');

    res.json({
      status: 'success',
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('Update livestock status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update livestock status'
    });
  }
};

module.exports = {
  getAllLivestock,
  getLivestockById,
  createLivestock,
  updateLivestock,
  deleteLivestock,
  updateLivestockStatus
};
