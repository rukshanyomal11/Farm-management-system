const { promisePool } = require('../config/database');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      `SELECT u.id, u.email, u.full_name, u.phone_number, u.role, u.email_verified, 
              u.created_at, u.last_login_at,
              f.id as farm_id, f.farm_name, f.farm_type, f.farm_size, f.address
       FROM users u
       LEFT JOIN farms f ON u.id = f.owner_id
       WHERE u.id = ?`,
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'success',
      data: users[0]
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    
    await promisePool.query(
      'UPDATE users SET full_name = ?, phone_number = ? WHERE id = ?',
      [fullName, phoneNumber, req.user.userId]
    );
    
    res.json({
      status: 'success',
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

// Get farm workers/members for task assignment
const getFarmWorkers = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is farm owner
    let farmId = null;
    const [ownedFarms] = await promisePool.query(
      'SELECT id FROM farms WHERE owner_id = ?',
      [userId]
    );
    
    if (ownedFarms.length > 0) {
      farmId = ownedFarms[0].id;
    } else {
      // Check if user is farm member
      const [memberFarms] = await promisePool.query(
        'SELECT farm_id FROM farm_members WHERE user_id = ?',
        [userId]
      );
      
      if (memberFarms.length > 0) {
        farmId = memberFarms[0].farm_id;
      }
    }
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm found'
      });
    }
    
    // Get farm owner first
    const [owner] = await promisePool.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.phone_number, u.email_verified as is_verified
       FROM users u
       INNER JOIN farms f ON u.id = f.owner_id
       WHERE f.id = ?`,
      [farmId]
    );
    
    // Get all workers from workers table
    const [workers] = await promisePool.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.phone_number, u.email_verified as is_verified,
              w.worker_type, w.status, w.specialization, w.experience_years
       FROM workers w
       INNER JOIN users u ON w.user_id = u.id
       WHERE w.farm_id = ? AND w.status = 'active'
       ORDER BY u.full_name`,
      [farmId]
    );
    
    // Combine owner and workers
    const allWorkers = [...owner, ...workers];
    
    res.json({
      status: 'success',
      data: allWorkers
    });
    
  } catch (error) {
    console.error('Get farm workers error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch workers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user (for staff management)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, role } = req.body;
    
    // Check if requester is farm owner
    if (req.user.role !== 'farm_owner') {
      return res.status(403).json({
        status: 'error',
        message: 'Only farm owners can update staff'
      });
    }
    
    await promisePool.query(
      'UPDATE users SET full_name = ?, email = ?, phone_number = ?, role = ? WHERE id = ?',
      [fullName, email, phoneNumber, role, id]
    );
    
    res.json({
      status: 'success',
      message: 'User updated successfully'
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getFarmWorkers,
  updateUser
};
