const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate access token
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Generate random token for email verification/password reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash refresh token for storage
const hashToken = async (token) => {
  return await bcrypt.hash(token, 10);
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Compare token with hash
const compareToken = async (token, hash) => {
  return await bcrypt.compare(token, hash);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  hashToken,
  verifyRefreshToken,
  compareToken
};
