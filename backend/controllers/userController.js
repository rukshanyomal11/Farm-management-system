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

module.exports = {
  getProfile,
  updateProfile
};
