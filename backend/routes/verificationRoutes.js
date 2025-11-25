const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Send verification code
router.post('/send-code',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      await verificationController.sendEmailVerificationCode(req, res);
    } catch (error) {
      console.error('Route error:', error);
      next(error);
    }
  }
);

// Verify code
router.post('/verify-code',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
  ],
  validate,
  verificationController.verifyEmailCode
);

module.exports = router;
