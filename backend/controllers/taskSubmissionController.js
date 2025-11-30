const { promisePool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Submit task completion with notes and photos
exports.submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const { notes } = req.body;
    
    // Handle uploaded file
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/task-submissions/${req.file.filename}`;
    }

    // Verify task belongs to user
    const [tasks] = await promisePool.execute(
      'SELECT * FROM tasks WHERE id = ? AND assigned_to = ?',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found or not assigned to you' 
      });
    }

    const submissionId = uuidv4();

    await promisePool.execute(
      `INSERT INTO task_submissions 
       (id, task_id, submitted_by, notes, photo_url, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [submissionId, taskId, userId, notes || null, photoUrl]
    );

    // Update task status to completed
    await promisePool.execute(
      'UPDATE tasks SET status = ? WHERE id = ?',
      ['completed', taskId]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Task submitted successfully',
      data: { submissionId }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit task' 
    });
  }
};

// Get submissions for a task
exports.getTaskSubmissions = async (req, res) => {
  try {
    const { taskId } = req.params;

    const [submissions] = await promisePool.execute(
      `SELECT ts.*, 
              u1.full_name as submitted_by_name,
              u2.full_name as reviewed_by_name
       FROM task_submissions ts
       LEFT JOIN users u1 ON ts.submitted_by = u1.id
       LEFT JOIN users u2 ON ts.reviewed_by = u2.id
       WHERE ts.task_id = ?
       ORDER BY ts.submitted_at DESC`,
      [taskId]
    );

    res.json({ 
      success: true, 
      data: submissions 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch submissions' 
    });
  }
};

// Get all submissions for manager review
exports.getAllSubmissions = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's farm
    const [memberFarms] = await promisePool.execute(
      'SELECT farm_id FROM farm_members WHERE user_id = ? LIMIT 1',
      [userId]
    );

    let farmId;
    if (memberFarms.length > 0) {
      farmId = memberFarms[0].farm_id;
    } else {
      const [ownedFarms] = await promisePool.execute(
        'SELECT id FROM farms WHERE owner_id = ? LIMIT 1',
        [userId]
      );
      if (ownedFarms.length > 0) {
        farmId = ownedFarms[0].id;
      }
    }

    if (!farmId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No farm associated with this user' 
      });
    }

    const [submissions] = await promisePool.execute(
      `SELECT ts.*, 
              t.title as task_title,
              t.due_date,
              u1.full_name as submitted_by_name,
              u2.full_name as reviewed_by_name
       FROM task_submissions ts
       INNER JOIN tasks t ON ts.task_id = t.id
       LEFT JOIN users u1 ON ts.submitted_by = u1.id
       LEFT JOIN users u2 ON ts.reviewed_by = u2.id
       WHERE t.farm_id = ?
       ORDER BY ts.submitted_at DESC`,
      [farmId]
    );

    res.json({ 
      success: true, 
      data: submissions 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch submissions' 
    });
  }
};

// Review submission (approve/reject)
exports.reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.userId;
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    // Get submission details to find the task
    const [submissions] = await promisePool.execute(
      'SELECT task_id FROM task_submissions WHERE id = ?',
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    const taskId = submissions[0].task_id;

    await promisePool.execute(
      `UPDATE task_submissions 
       SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_notes = ?
       WHERE id = ?`,
      [status, userId, reviewNotes || null, submissionId]
    );

    // If rejected, change task status back to in_progress so worker can resubmit
    if (status === 'rejected') {
      await promisePool.execute(
        'UPDATE tasks SET status = ? WHERE id = ?',
        ['in_progress', taskId]
      );
    }

    res.json({ 
      success: true, 
      message: `Submission ${status}` 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to review submission' 
    });
  }
};

module.exports = exports;
