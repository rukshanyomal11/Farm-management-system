const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const taskSubmissionController = require('../controllers/taskSubmissionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/task-submissions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Worker submits task completion
router.post('/:taskId/submit', 
  verifyToken, 
  checkRole(['field_worker', 'farm_manager']),
  upload.single('photo'),
  taskSubmissionController.submitTask
);

// Get submissions for a specific task
router.get('/:taskId/submissions', 
  verifyToken, 
  checkRole(['farm_owner', 'farm_manager', 'field_worker']), 
  taskSubmissionController.getTaskSubmissions
);

// Get all submissions for manager review
router.get('/submissions/all', 
  verifyToken, 
  checkRole(['farm_owner', 'farm_manager']), 
  taskSubmissionController.getAllSubmissions
);

// Manager reviews submission
router.patch('/submissions/:submissionId/review', 
  verifyToken, 
  checkRole(['farm_owner', 'farm_manager']), 
  taskSubmissionController.reviewSubmission
);

module.exports = router;
