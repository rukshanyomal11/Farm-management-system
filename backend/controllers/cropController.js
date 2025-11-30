const { promisePool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all crops for a farm
const getAllCrops = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, search, sortBy = 'created_at', order = 'DESC' } = req.query;

    console.log('🔍 Fetching crops for user:', userId);
    console.log('Query params:', { status, search, sortBy, order });

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
        c.*,
        f.name as field_name,
        f.size as field_size
      FROM crops c
      LEFT JOIN fields f ON c.field_id = f.id
      WHERE c.farm_id = ?
    `;
    const params = [farmId];

    // Add filters
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (c.crop_name LIKE ? OR c.variety LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    const allowedSortFields = ['crop_name', 'planting_date', 'expected_harvest_date', 'status', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY c.${sortField} ${sortOrder}`;

    console.log('📊 Executing query with params:', params);
    const [crops] = await promisePool.query(query, params);
    console.log('✅ Found crops:', crops.length);

    // Get statistics
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'planted' THEN 1 ELSE 0 END) as planted,
        SUM(CASE WHEN status = 'growing' THEN 1 ELSE 0 END) as growing,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
        SUM(CASE WHEN status = 'harvested' THEN 1 ELSE 0 END) as harvested,
        SUM(area_planted) as total_area
      FROM crops
      WHERE farm_id = ?
    `, [farmId]);

    res.json({
      status: 'success',
      data: {
        crops,
        statistics: stats[0]
      }
    });

  } catch (error) {
    console.error('Get all crops error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch crops'
    });
  }
};

// Get single crop details
const getCropById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cropId } = req.params;

    console.log('Fetching crop:', cropId, 'for user:', userId);

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

    // Get crop details
    const [crops] = await promisePool.query(`
      SELECT 
        c.*,
        f.name as field_name,
        f.size as field_size,
        f.location as field_location
      FROM crops c
      LEFT JOIN fields f ON c.field_id = f.id
      WHERE c.id = ? AND c.farm_id = ?
    `, [cropId, farmId]);

    if (crops.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Crop not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        crop: crops[0]
      }
    });

  } catch (error) {
    console.error('Get crop by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch crop details'
    });
  }
};

// Create new crop
const createCrop = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const {
      cropName,
      variety,
      fieldId,
      areaPlanted,
      plantingDate,
      expectedHarvestDate,
      status,
      notes
    } = req.body;

    console.log('🌱 Creating crop for user:', userId);
    console.log('📝 Crop data:', { cropName, variety, fieldId, areaPlanted, plantingDate, expectedHarvestDate, status });

    // Validate required fields
    if (!cropName || cropName.trim().length === 0) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Crop name is required',
        field: 'cropName'
      });
    }

    if (!plantingDate) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Planting date is required',
        field: 'plantingDate'
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

    // If field is specified, verify it belongs to this farm
    if (fieldId && fieldId !== '' && fieldId !== 'none') {
      console.log('🔍 Verifying field:', fieldId);
      const [fields] = await connection.query(
        'SELECT id, name FROM fields WHERE id = ? AND farm_id = ?',
        [fieldId, farmId]
      );

      if (fields.length === 0) {
        await connection.rollback();
        console.log('❌ Invalid field ID:', fieldId);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid field ID. Field does not exist or does not belong to your farm.',
          field: 'fieldId'
        });
      }
      console.log('✅ Field verified:', fields[0].name);
    }

    // Prepare values
    const finalFieldId = (fieldId && fieldId !== '' && fieldId !== 'none') ? fieldId : null;
    const finalVariety = variety && variety.trim().length > 0 ? variety : null;
    const finalAreaPlanted = areaPlanted && areaPlanted > 0 ? areaPlanted : null;
    const finalExpectedHarvestDate = expectedHarvestDate || null;
    const finalStatus = status || 'planted';
    const finalNotes = notes && notes.trim().length > 0 ? notes : null;

    // Generate UUID for the crop
    const cropId = uuidv4();

    console.log('💾 Inserting crop into database...');
    console.log('Final values:', {
      cropId,
      farmId,
      finalFieldId,
      cropName,
      finalVariety,
      finalAreaPlanted,
      plantingDate,
      finalExpectedHarvestDate,
      finalStatus,
      finalNotes
    });

    // Insert crop
    const [result] = await connection.query(`
      INSERT INTO crops (
        id,
        farm_id,
        field_id,
        crop_name,
        variety,
        area_planted,
        planting_date,
        expected_harvest_date,
        status,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cropId,
      farmId,
      finalFieldId,
      cropName,
      finalVariety,
      finalAreaPlanted,
      plantingDate,
      finalExpectedHarvestDate,
      finalStatus,
      finalNotes
    ]);

    console.log('✅ Crop inserted with ID:', cropId);

    await connection.commit();
    console.log('✅ Transaction committed');

    res.status(201).json({
      status: 'success',
      message: 'Crop created successfully',
      data: {
        cropId: cropId,
        cropName,
        plantingDate,
        status: finalStatus
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Create crop error:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    
    // Handle specific database errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        status: 'error',
        message: 'Database table does not exist. Please run the migration script.'
      });
    }
    
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        status: 'error',
        message: 'Database schema error. Please check the table structure.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create crop. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// Update crop
const updateCrop = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { cropId } = req.params;
    const {
      cropName,
      variety,
      fieldId,
      areaPlanted,
      plantingDate,
      expectedHarvestDate,
      actualHarvestDate,
      status,
      yieldAmount,
      notes
    } = req.body;

    console.log('Updating crop:', cropId, 'for user:', userId);

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

    // Verify crop belongs to this farm
    const [crops] = await connection.query(
      'SELECT id FROM crops WHERE id = ? AND farm_id = ?',
      [cropId, farmId]
    );

    if (crops.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Crop not found'
      });
    }

    // Update crop
    const [result] = await connection.query(`
      UPDATE crops SET
        crop_name = COALESCE(?, crop_name),
        variety = COALESCE(?, variety),
        field_id = COALESCE(?, field_id),
        area_planted = COALESCE(?, area_planted),
        planting_date = COALESCE(?, planting_date),
        expected_harvest_date = COALESCE(?, expected_harvest_date),
        actual_harvest_date = COALESCE(?, actual_harvest_date),
        status = COALESCE(?, status),
        yield_amount = COALESCE(?, yield_amount),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      cropName,
      variety,
      fieldId,
      areaPlanted,
      plantingDate,
      expectedHarvestDate,
      actualHarvestDate,
      status,
      yieldAmount,
      notes,
      cropId
    ]);

    await connection.commit();

    res.json({
      status: 'success',
      message: 'Crop updated successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update crop error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update crop'
    });
  } finally {
    connection.release();
  }
};

// Delete crop
const deleteCrop = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { cropId } = req.params;

    console.log('Deleting crop:', cropId, 'for user:', userId);

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

    // Verify crop belongs to this farm
    const [crops] = await connection.query(
      'SELECT id FROM crops WHERE id = ? AND farm_id = ?',
      [cropId, farmId]
    );

    if (crops.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Crop not found'
      });
    }

    // Delete crop
    await connection.query('DELETE FROM crops WHERE id = ?', [cropId]);

    await connection.commit();

    res.json({
      status: 'success',
      message: 'Crop deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete crop error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete crop'
    });
  } finally {
    connection.release();
  }
};

// Update crop status
const updateCropStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cropId } = req.params;
    const { status } = req.body;

    console.log('Updating crop status:', cropId, 'to:', status);

    // Validate status
    const validStatuses = ['planted', 'growing', 'ready', 'harvested', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
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

    // Update crop status
    const [result] = await promisePool.query(`
      UPDATE crops 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND farm_id = ?
    `, [status, cropId, farmId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Crop not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Crop status updated successfully'
    });

  } catch (error) {
    console.error('Update crop status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update crop status'
    });
  }
};

module.exports = {
  getAllCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
  updateCropStatus
};
