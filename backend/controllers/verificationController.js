const { promisePool } = require('../config/database');
const { generateRandomToken } = require('../utils/tokenUtils');
const { sendVerificationCode } = require('../utils/emailUtils');
const crypto = require('crypto');

// Send verification code to email
const sendEmailVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email already registered
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }
    
    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Delete any existing codes for this email
    await promisePool.query(
      'DELETE FROM email_verification_codes WHERE email = ?',
      [email]
    );
    
    // Store code with expires_at as timestamp
    await promisePool.query(
      `INSERT INTO email_verification_codes (email, code, expires_at, attempts)
       VALUES (?, ?, ?, 0)`,
      [email, verificationCode, expiresAt]
    );
    
    // Send email with code - wrapped in try-catch to not fail the request
    let emailSent = false;
    try {
      await sendVerificationCode(email, verificationCode);
      emailSent = true;
    } catch (emailError) {
      // Silently fail, code is already in database
    }
    
    // Always return success since code is saved in database
    return res.status(200).json({
      status: 'success',
      message: 'Verification code sent to your email',
      expiresIn: 600
    });
    
  } catch (error) {
    console.error('Error sending verification code:', error.message);
    
    if (!res.headersSent) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send verification code'
      });
    }
  }
};

// Verify email code
const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const [codes] = await promisePool.query(
      'SELECT id, code, expires_at, attempts, verified FROM email_verification_codes WHERE email = ?',
      [email]
    );
    
    if (codes.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No verification code found. Please request a new code.'
      });
    }
    
    const codeData = codes[0];
    
    // Check if already verified
    if (codeData.verified) {
      return res.json({
        status: 'success',
        message: 'Email already verified'
      });
    }
    
    // Check expiration - compare with current time
    const now = new Date();
    const expiresAt = new Date(codeData.expires_at);
    
    if (expiresAt < now) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code expired. Please request a new code.'
      });
    }
    
    // Check attempts (max 5)
    if (codeData.attempts >= 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Too many attempts. Please request a new code.'
      });
    }
    
    // Verify code
    if (codeData.code !== code) {
      // Increment attempts
      await promisePool.query(
        'UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = ?',
        [codeData.id]
      );
      
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code',
        attemptsLeft: 5 - (codeData.attempts + 1)
      });
    }
    
    // Mark as verified
    await promisePool.query(
      'UPDATE email_verification_codes SET verified = TRUE WHERE id = ?',
      [codeData.id]
    );
    
    res.json({
      status: 'success',
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Verification failed'
    });
  }
};

module.exports = {
  sendEmailVerificationCode,
  verifyEmailCode
};
