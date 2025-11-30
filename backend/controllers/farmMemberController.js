const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Helper function to get farm ID for any user (owner or member)
const getUserFarmId = async (userId) => {
  // First check if user is farm member (for managers and workers)
  const [memberFarms] = await promisePool.execute(
    'SELECT farm_id FROM farm_members WHERE user_id = ? AND role IN ("manager", "worker") ORDER BY joined_at DESC LIMIT 1', 
    [userId]
  );
  
  if (memberFarms.length > 0) {
    return memberFarms[0].farm_id;
  }
  
  // Then check if user is farm owner
  const [ownedFarms] = await promisePool.execute(
    'SELECT id FROM farms WHERE owner_id = ?', 
    [userId]
  );
  
  if (ownedFarms.length > 0) {
    return ownedFarms[0].id;
  }
  
  return null;
};

// Add worker to farm (for farm owners)
const addWorkerToFarm = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, email, phoneNumber, password, role } = req.body;
    
    // Validate role
    if (!['field_worker', 'farm_manager'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be field_worker or farm_manager'
      });
    }
    
    // Get farm owner's farm
    const [farms] = await promisePool.query(
      'SELECT id FROM farms WHERE owner_id = ?',
      [userId]
    );
    
    if (farms.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm found'
      });
    }
    
    const farmId = farms[0].id;
    
    // Check if user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    let workerId;
    
    if (existingUsers.length > 0) {
      // User exists, just add to farm
      workerId = existingUsers[0].id;
      
      // Check if already a member
      const [existingMember] = await promisePool.query(
        'SELECT id FROM farm_members WHERE farm_id = ? AND user_id = ?',
        [farmId, workerId]
      );
      
      if (existingMember.length > 0) {
        return res.status(409).json({
          status: 'error',
          message: 'Worker already added to this farm'
        });
      }
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
      workerId = crypto.randomUUID();
      
      await promisePool.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone_number, role, email_verified, is_active)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
        [workerId, email, passwordHash, fullName, phoneNumber, role]
      );
    }
    
    // Add to farm_members
    const memberRole = role === 'farm_manager' ? 'manager' : 'worker';
    await promisePool.query(
      `INSERT INTO farm_members (id, farm_id, user_id, role)
       VALUES (?, ?, ?, ?)`,
      [crypto.randomUUID(), farmId, workerId, memberRole]
    );
    
    // Add to workers table with additional data
    await promisePool.query(
      `INSERT INTO workers (id, user_id, farm_id, worker_type, date_joined, status)
       VALUES (?, ?, ?, ?, CURDATE(), 'active')`,
      [crypto.randomUUID(), workerId, farmId, role]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Worker added to farm successfully',
      data: {
        id: workerId,
        fullName,
        email,
        role
      }
    });
    
  } catch (error) {
    console.error('Add worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add worker',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all farm workers
const getFarmWorkers = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get farm using helper function (works for both owners and managers)
    const farmId = await getUserFarmId(userId);
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm associated with this user'
      });
    }
    
    // Get all workers (including managers if user is owner)
    const [workers] = await promisePool.query(
      `SELECT u.id, u.full_name, u.email, u.phone_number, u.role, fm.role as member_role, fm.joined_at
       FROM users u
       INNER JOIN farm_members fm ON u.id = fm.user_id
       WHERE fm.farm_id = ? AND fm.role IN ('worker', 'manager')
       ORDER BY fm.joined_at DESC`,
      [farmId]
    );
    
    res.json({
      status: 'success',
      data: workers
    });
    
  } catch (error) {
    console.error('Get farm workers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch workers'
    });
  }
};

// Remove worker from farm
const removeWorkerFromFarm = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { workerId } = req.params;
    
    // Get farm
    const [farms] = await promisePool.query(
      'SELECT id FROM farms WHERE owner_id = ?',
      [userId]
    );
    
    if (farms.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm found'
      });
    }
    
    const farmId = farms[0].id;
    
    // Remove from farm_members
    await promisePool.query(
      'DELETE FROM farm_members WHERE farm_id = ? AND user_id = ? AND role != "owner"',
      [farmId, workerId]
    );
    
    res.json({
      status: 'success',
      message: 'Worker removed from farm'
    });
    
  } catch (error) {
    console.error('Remove worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove worker'
    });
  }
};

// Get staff coordination data (for managers)
const getStaffCoordination = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Get farm
    const farmId = await getUserFarmId(userId);
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm associated with this user'
      });
    }
    
    // Get all workers with their task statistics
    const [workers] = await promisePool.query(
      `SELECT 
        u.id,
        u.full_name as name,
        u.role,
        w.worker_type,
        w.status as worker_status,
        COUNT(DISTINCT t.id) as tasks_assigned,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
        COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as tasks_in_progress,
        COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as tasks_pending
       FROM users u
       INNER JOIN farm_members fm ON u.id = fm.user_id
       LEFT JOIN workers w ON u.id = w.user_id AND w.farm_id = ?
       LEFT JOIN tasks t ON t.assigned_to = u.id AND t.farm_id = ?
       WHERE fm.farm_id = ? AND u.role IN ('field_worker', 'farm_manager')
       GROUP BY u.id, u.full_name, u.role, w.worker_type, w.status
       ORDER BY u.full_name ASC`,
      [farmId, farmId, farmId]
    );
    
    // Calculate performance scores (based on task completion rate)
    const staffData = workers.map(worker => {
      const completionRate = worker.tasks_assigned > 0 
        ? Math.round((worker.tasks_completed / worker.tasks_assigned) * 100)
        : 0;
      
      return {
        id: worker.id,
        name: worker.name,
        role: worker.role === 'field_worker' ? 'Field Worker' : 'Farm Manager',
        workerType: worker.worker_type,
        status: worker.worker_status || 'active',
        tasksAssigned: worker.tasks_assigned,
        tasksCompleted: worker.tasks_completed,
        tasksInProgress: worker.tasks_in_progress,
        tasksPending: worker.tasks_pending,
        performance: completionRate,
        clockIn: null, // Can be extended with actual attendance tracking
        clockOut: null
      };
    });
    
    // Calculate statistics
    const stats = {
      totalStaff: staffData.length,
      activeStaff: staffData.filter(s => s.status === 'active').length,
      avgPerformance: staffData.length > 0 
        ? Math.round(staffData.reduce((sum, s) => sum + s.performance, 0) / staffData.length)
        : 0,
      totalTasksAssigned: staffData.reduce((sum, s) => sum + s.tasksAssigned, 0),
      totalTasksCompleted: staffData.reduce((sum, s) => sum + s.tasksCompleted, 0)
    };
    
    res.json({
      status: 'success',
      data: {
        staff: staffData,
        statistics: stats,
        date: targetDate
      }
    });
    
  } catch (error) {
    console.error('Get staff coordination error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch staff coordination data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  addWorkerToFarm,
  getFarmWorkers,
  removeWorkerFromFarm,
  getStaffCoordination
};
