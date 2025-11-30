const { promisePool } = require('../config/database');

// Get farmer dashboard overview
const getFarmerDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('📊 Fetching dashboard data for user:', userId);

    // Get user's farm
    const [farms] = await promisePool.query(
      'SELECT id, farm_name, farm_type, farm_size FROM farms WHERE owner_id = ?',
      [userId]
    );

    if (farms.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm found for this user'
      });
    }

    const farmId = farms[0].id;

    // Get crops statistics
    const [cropStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_crops,
        SUM(CASE WHEN status = 'planted' THEN 1 ELSE 0 END) as planted,
        SUM(CASE WHEN status = 'growing' THEN 1 ELSE 0 END) as growing,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready_to_harvest,
        SUM(CASE WHEN status = 'harvested' THEN 1 ELSE 0 END) as harvested,
        COALESCE(SUM(area_planted), 0) as total_area
      FROM crops
      WHERE farm_id = ?
    `, [farmId]);

    // Get livestock statistics
    const [livestockStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_livestock,
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

    // Get inventory statistics
    const [inventoryStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity * unit_price) as total_value,
        SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_items,
        SUM(CASE WHEN category = 'feed' THEN 1 ELSE 0 END) as feed_items,
        SUM(CASE WHEN category = 'fertilizer' THEN 1 ELSE 0 END) as fertilizer_items,
        SUM(CASE WHEN category = 'seeds' THEN 1 ELSE 0 END) as seed_items
      FROM inventory
      WHERE farm_id = ?
    `, [farmId]);

    // Get recent crops (last 5)
    const [recentCrops] = await promisePool.query(`
      SELECT crop_name, variety, status, planting_date, area_planted
      FROM crops
      WHERE farm_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [farmId]);

    // Get recent livestock (last 5)
    const [recentLivestock] = await promisePool.query(`
      SELECT tag_number, type, breed, status, birth_date
      FROM livestock
      WHERE farm_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [farmId]);

    // Get low stock inventory items
    const [lowStockItems] = await promisePool.query(`
      SELECT item_name, category, quantity, unit, reorder_level
      FROM inventory
      WHERE farm_id = ? AND quantity <= reorder_level
      ORDER BY (quantity / reorder_level) ASC
      LIMIT 5
    `, [farmId]);

    // Get crops by status for chart
    const [cropsByStatus] = await promisePool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM crops
      WHERE farm_id = ?
      GROUP BY status
    `, [farmId]);

    // Get livestock by type for chart
    const [livestockByType] = await promisePool.query(`
      SELECT 
        type,
        COUNT(*) as count
      FROM livestock
      WHERE farm_id = ?
      GROUP BY type
    `, [farmId]);

    res.json({
      status: 'success',
      data: {
        farm: farms[0],
        statistics: {
          crops: cropStats[0],
          livestock: livestockStats[0],
          inventory: inventoryStats[0]
        },
        recent: {
          crops: recentCrops,
          livestock: recentLivestock,
          lowStockItems: lowStockItems
        },
        charts: {
          cropsByStatus: cropsByStatus,
          livestockByType: livestockByType
        }
      }
    });

  } catch (error) {
    console.error('Get farmer dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get quick stats (for widgets)
const getQuickStats = async (req, res) => {
  try {
    const userId = req.user.userId;

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

    // Get counts
    const [stats] = await promisePool.query(`
      SELECT 
        (SELECT COUNT(*) FROM crops WHERE farm_id = ?) as total_crops,
        (SELECT COUNT(*) FROM livestock WHERE farm_id = ?) as total_livestock,
        (SELECT COUNT(*) FROM inventory WHERE farm_id = ?) as total_inventory_items,
        (SELECT COUNT(*) FROM inventory WHERE farm_id = ? AND quantity <= reorder_level) as low_stock_items
    `, [farmId, farmId, farmId, farmId]);

    res.json({
      status: 'success',
      data: stats[0]
    });

  } catch (error) {
    console.error('Get quick stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quick stats'
    });
  }
};

module.exports = {
  getFarmerDashboard,
  getQuickStats
};
