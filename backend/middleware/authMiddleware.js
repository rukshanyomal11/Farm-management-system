const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

// Verify JWT access token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log('🔑 Auth Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token extracted, length:', token.length);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, userId:', decoded.userId);

    // Check if user exists and is active
    const [users] = await promisePool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log('❌ User not found:', decoded.userId);
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = users[0];
    console.log('✅ User found:', user.email, 'Role:', user.role);

    if (!user.is_active) {
      console.log('❌ User account deactivated');
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// Check if user has required role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    // Flatten roles array in case it's passed as an array
    const allowedRoles = roles.flat();
    
    console.log('🔐 Checking role - User role:', req.user.role, 'Allowed roles:', allowedRoles);

    if (!allowedRoles.includes(req.user.role)) {
      console.log('❌ Insufficient permissions - User:', req.user.role, 'Required:', allowedRoles);
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    console.log('✅ Role check passed');
    next();
  };
};

// Alias for authenticateToken (for admin routes)
const authenticateToken = verifyToken;

// Alias for requireRole (for admin routes)
const requireRole = checkRole;

module.exports = { 
  verifyToken, 
  checkRole, 
  authenticateToken, 
  requireRole 
};
