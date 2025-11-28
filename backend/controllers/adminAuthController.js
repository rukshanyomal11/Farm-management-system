const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');
const { 
  generateAccessToken, 
  generateRefreshToken 
} = require('../utils/tokenUtils');

// Admin Secret Key (In production, store this in environment variables)
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'SUPER_ADMIN_SECRET_2024';

// Register new admin
const registerAdmin = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { fullName, email, password, secretKey } = req.body;
    
    // Validate input
    if (!fullName || !email || !password || !secretKey) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Verify admin secret key
    if (secretKey !== ADMIN_SECRET_KEY) {
      await connection.rollback();
      return res.status(403).json({
        status: 'error',
        message: 'Invalid admin secret key'
      });
    }

    // Check if admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE email = ? AND role = ?',
      [email, 'super_admin']
    );

    if (existingAdmin.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        status: 'error',
        message: 'Admin account with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const [result] = await connection.query(
      `INSERT INTO users 
       (email, password_hash, full_name, role, email_verified, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, fullName, 'super_admin', true, true]
    );

    const adminId = result.insertId;

    await connection.commit();

    res.status(201).json({
      status: 'success',
      message: 'Admin account created successfully',
      data: {
        adminId,
        email,
        fullName,
        role: 'super_admin'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Admin registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create admin account'
    });
  } finally {
    connection.release();
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Find admin user
    const [admins] = await promisePool.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'super_admin']
    );

    if (admins.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials or not an admin account'
      });
    }

    const admin = admins[0];

    // Check if account is active
    if (!admin.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin account is disabled'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(admin.id, admin.role);
    const refreshToken = generateRefreshToken(admin.id);

    // Update last login
    await promisePool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [admin.id]
    );

    // Return admin data and tokens
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.userId;

    const [admins] = await promisePool.query(
      `SELECT id, email, full_name, role, created_at, last_login_at 
       FROM users 
       WHERE id = ? AND role = ?`,
      [adminId, 'super_admin']
    );

    if (admins.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        admin: admins[0]
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin profile'
    });
  }
};

// Get all users (admin function)
const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    
    let query = `SELECT id, email, full_name, phone_number, role, email_verified, is_active, 
              created_at, last_login_at 
       FROM users 
       WHERE 1=1`;
    
    const params = [];
    
    // Search filter
    if (search) {
      query += ` AND (full_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Role filter
    if (role && role !== 'all') {
      query += ` AND role = ?`;
      params.push(role);
    }
    
    // Status filter
    if (status === 'active') {
      query += ` AND is_active = 1`;
    } else if (status === 'inactive') {
      query += ` AND is_active = 0`;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const [users] = await promisePool.query(query, params);

    // Get statistics
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN role = 'farm_owner' THEN 1 ELSE 0 END) as farm_owners,
        SUM(CASE WHEN role = 'farm_manager' THEN 1 ELSE 0 END) as farm_managers,
        SUM(CASE WHEN last_login_at IS NOT NULL THEN 1 ELSE 0 END) as logged_in_users
      FROM users
    `);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        total: users.length,
        statistics: stats[0]
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

// Update user status (admin function)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    await promisePool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, userId]
    );

    res.status(200).json({
      status: 'success',
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status'
    });
  }
};

// Get user details (admin function)
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await promisePool.query(
      `SELECT id, email, full_name, phone_number, role, email_verified, is_active, 
              created_at, updated_at, last_login_at, failed_login_attempts
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's farms
    const [farms] = await promisePool.query(
      `SELECT f.* FROM farms f
       INNER JOIN farm_members fm ON f.id = fm.farm_id
       WHERE fm.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: users[0],
        farms
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user details'
    });
  }
};

// Delete user (admin function)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting super admin
    const [users] = await promisePool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (users[0].role === 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot delete super admin'
      });
    }

    await promisePool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
};

// Get all farms (admin function)
const getAllFarms = async (req, res) => {
  try {
    const [farms] = await promisePool.query(
      `SELECT f.*, u.full_name as owner_name, u.email as owner_email
       FROM farms f
       LEFT JOIN users u ON f.owner_id = u.id
       ORDER BY f.created_at DESC`
    );

    // Get farm statistics
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        AVG(farm_size) as avg_size,
        farm_type,
        COUNT(*) as count
      FROM farms
      GROUP BY farm_type
    `);

    res.status(200).json({
      status: 'success',
      data: {
        farms,
        total: farms.length,
        typeStats: stats
      }
    });

  } catch (error) {
    console.error('Get all farms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch farms'
    });
  }
};

// Get dashboard statistics (admin function)
const getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const [userStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today,
        SUM(CASE WHEN DATE(last_login_at) = CURDATE() THEN 1 ELSE 0 END) as logged_in_today
      FROM users
    `);

    // Farm statistics
    const [farmStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_farms,
        SUM(farm_size) as total_farm_size,
        AVG(farm_size) as avg_farm_size
      FROM farms
    `);

    // Recent activity
    const [recentUsers] = await promisePool.query(`
      SELECT id, full_name, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Role distribution
    const [roleStats] = await promisePool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    res.status(200).json({
      status: 'success',
      data: {
        users: userStats[0],
        farms: farmStats[0],
        recentUsers,
        roleDistribution: roleStats
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllUsers,
  updateUserStatus,
  getUserDetails,
  deleteUser,
  getAllFarms,
  getDashboardStats
};
