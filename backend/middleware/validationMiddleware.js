const { body, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Registration validation rules
const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be between 3 and 100 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .trim()
    .matches(/^[\d\s\-+()]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('farmName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Farm name must be between 3 and 100 characters'),
  
  body('farmType')
    .isIn(['Crop Farming', 'Livestock', 'Dairy Farm', 'Poultry Farm', 'Mixed Farming', 'Organic Farm', 'Other'])
    .withMessage('Invalid farm type'),
  
  body('farmSize')
    .isNumeric()
    .withMessage('Farm size must be a number'),
  
  body('location')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Location is required'),
  
  validate
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  validate
];

// Reset password validation
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
