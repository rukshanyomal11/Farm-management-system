const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  generateRandomToken,
  hashToken,
  verifyRefreshToken 
} = require('../utils/tokenUtils');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendWelcomeEmail 
} = require('../utils/emailUtils');

// Register new user
const register = async (req, res) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { fullName, email, phone, password, farmName, farmType, farmSize, location } = req.body;
    
    // Check if email was verified with code
    const [verifiedCodes] = await connection.query(
      'SELECT verified, expires_at FROM email_verification_codes WHERE email = ? AND verified = TRUE',
      [email]
    );
    
    if (verifiedCodes.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        status: 'error',
        message: 'Email not verified. Please verify your email first.'
      });
    }
    
    // Check if verification code expired (valid for 30 minutes after verification)
    const codeData = verifiedCodes[0];
    const verificationExpiry = new Date(codeData.expires_at).getTime() + 20 * 60 * 1000; // +20 more minutes
    if (verificationExpiry < Date.now()) {
      await connection.rollback();
      return res.status(403).json({
        status: 'error',
        message: 'Email verification expired. Please verify again.'
      });
    }
    
    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
    
    // Create user (email already verified)
    const userId = require('crypto').randomUUID();
    await connection.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone_number, role, email_verified, is_active)
       VALUES (?, ?, ?, ?, ?, 'farm_owner', TRUE, TRUE)`,
      [userId, email, passwordHash, fullName, phone]
    );
    
    // Create farm
    const farmId = require('crypto').randomUUID();
    await connection.query(
      `INSERT INTO farms (id, owner_id, farm_name, farm_type, farm_size, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [farmId, userId, farmName, farmType, farmSize, location]
    );
    
    // Create farm member entry
    await connection.query(
      `INSERT INTO farm_members (id, farm_id, user_id, role)
       VALUES (?, ?, ?, 'owner')`,
      [require('crypto').randomUUID(), farmId, userId]
    );
    
    await connection.commit();
    
    // Send welcome email (don't wait for it)
    sendWelcomeEmail(email, fullName).catch(err => {
      console.error('Failed to send welcome email:', err);
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Registration successful! You can now login.',
      data: {
        userId,
        email,
        fullName
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Get user
    const [users] = await promisePool.query(
      `SELECT id, email, password_hash, full_name, role, email_verified, is_active, 
              failed_login_attempts, account_locked_until
       FROM users WHERE email = ?`,
      [email]
    );
    
    // Check if account locked
    if (users.length > 0 && users[0].account_locked_until) {
      const lockedUntil = new Date(users[0].account_locked_until);
      if (lockedUntil > new Date()) {
        return res.status(423).json({
          status: 'error',
          message: `Account is locked. Try again after ${lockedUntil.toLocaleString()}`
        });
      }
    }
    
    // Record login attempt
    await promisePool.query(
      'INSERT INTO login_attempts (email, ip_address, success, user_agent) VALUES (?, ?, ?, ?)',
      [email, ipAddress, false, userAgent]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = user.failed_login_attempts + 1;
      let lockUntil = null;
      
      if (failedAttempts >= parseInt(process.env.MAX_LOGIN_ATTEMPTS)) {
        lockUntil = new Date(Date.now() + parseInt(process.env.LOCK_TIME) * 60 * 1000);
      }
      
      await promisePool.query(
        'UPDATE users SET failed_login_attempts = ?, account_locked_until = ? WHERE id = ?',
        [failedAttempts, lockUntil, user.id]
      );
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        attemptsLeft: Math.max(0, parseInt(process.env.MAX_LOGIN_ATTEMPTS) - failedAttempts)
      });
    }
    
    // Check if email verified
    if (!user.email_verified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email before logging in'
      });
    }
    
    // Check if account active
    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated. Contact support.'
      });
    }
    
    // Reset failed attempts
    await promisePool.query(
      'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL, last_login_at = NOW() WHERE id = ?',
      [user.id]
    );
    
    // Update login attempt to success
    await promisePool.query(
      'UPDATE login_attempts SET success = TRUE WHERE email = ? ORDER BY attempted_at DESC LIMIT 1',
      [email]
    );
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);
    
    // Store refresh token
    const refreshTokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
    
    await promisePool.query(
      `INSERT INTO user_sessions (id, user_id, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [require('crypto').randomUUID(), user.id, refreshTokenHash, ipAddress, userAgent, expiresAt]
    );
    
    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
    });
    
    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const [tokens] = await promisePool.query(
      `SELECT vt.id, vt.user_id, vt.used, vt.expires_at, u.email, u.full_name
       FROM verification_tokens vt
       JOIN users u ON vt.user_id = u.id
       WHERE vt.token = ? AND vt.token_type = 'email_verification'`,
      [token]
    );
    
    if (tokens.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification token'
      });
    }
    
    const tokenData = tokens[0];
    
    if (tokenData.used) {
      return res.status(400).json({
        status: 'error',
        message: 'Token already used'
      });
    }
    
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    // Update user and token
    await promisePool.query('UPDATE users SET email_verified = TRUE WHERE id = ?', [tokenData.user_id]);
    await promisePool.query('UPDATE verification_tokens SET used = TRUE, used_at = NOW() WHERE id = ?', [tokenData.id]);
    
    // Send welcome email
    sendWelcomeEmail(tokenData.email, tokenData.full_name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });
    
    res.json({
      status: 'success',
      message: 'Email verified successfully! You can now login.'
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Email verification failed'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token not found'
      });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }
    
    // Get user
    const [users] = await promisePool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }
    
    const user = users[0];
    
    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    
    res.json({
      status: 'success',
      data: { accessToken }
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Token refresh failed'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      // Revoke refresh token
      await promisePool.query(
        'UPDATE user_sessions SET revoked = TRUE, revoked_at = NOW() WHERE user_id = ?',
        [req.user.userId]
      );
    }
    
    // Clear cookie
    res.clearCookie('refreshToken');
    
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const [users] = await promisePool.query(
      'SELECT id, email, full_name FROM users WHERE email = ?',
      [email]
    );
    
    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({
        status: 'success',
        message: 'If the email exists, you will receive a password reset link'
      });
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await promisePool.query(
      `INSERT INTO password_resets (id, user_id, token, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [require('crypto').randomUUID(), user.id, resetToken, req.ip, expiresAt]
    );
    
    // Send reset email
    sendPasswordResetEmail(user.email, user.full_name, resetToken).catch(err => {
      console.error('Failed to send password reset email:', err);
    });
    
    res.json({
      status: 'success',
      message: 'If the email exists, you will receive a password reset link'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Request failed'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const [resets] = await promisePool.query(
      'SELECT id, user_id, used, expires_at FROM password_resets WHERE token = ?',
      [token]
    );
    
    if (resets.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reset token'
      });
    }
    
    const reset = resets[0];
    
    if (reset.used) {
      return res.status(400).json({
        status: 'error',
        message: 'Token already used'
      });
    }
    
    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));
    
    // Update password and mark token as used
    await promisePool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, reset.user_id]);
    await promisePool.query('UPDATE password_resets SET used = TRUE WHERE id = ?', [reset.id]);
    
    // Revoke all sessions
    await promisePool.query('UPDATE user_sessions SET revoked = TRUE WHERE user_id = ?', [reset.user_id]);
    
    res.json({
      status: 'success',
      message: 'Password reset successful. Please login with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password reset failed'
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};
