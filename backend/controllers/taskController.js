const { promisePool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Helper function to get farm ID for any user (owner or member)
// For single farm platform - returns the first farm found
const getUserFarmId = async (userId) => {
  // Check if user is farm member first (worker/manager)
  const [memberFarms] = await promisePool.execute(
    'SELECT farm_id FROM farm_members WHERE user_id = ? LIMIT 1', 
    [userId]
  );
  
  if (memberFarms.length > 0) {
    return memberFarms[0].farm_id;
  }
  
  // Check if user is farm owner
  const [ownedFarms] = await promisePool.execute(
    'SELECT id FROM farms WHERE owner_id = ? LIMIT 1', 
    [userId]
  );
  
  if (ownedFarms.length > 0) {
    return ownedFarms[0].id;
  }
  
  return null;
};

exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Get user's farm (whether owner or member)
    const farmId = await getUserFarmId(userId);
    
    if (!farmId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No farm associated with this user' 
      });
    }
    let query = 'SELECT t.*, u1.full_name as assigned_to_name, u2.full_name as created_by_name FROM tasks t LEFT JOIN users u1 ON t.assigned_to = u1.id LEFT JOIN users u2 ON t.created_by = u2.id WHERE t.farm_id = ?';
    const queryParams = [farmId];
    if (userRole === 'field_worker') { query += ' AND t.assigned_to = ?'; queryParams.push(userId); }
    query += ' ORDER BY t.created_at DESC';
    const [tasks] = await promisePool.execute(query, queryParams);
    const stats = { total: tasks.length, pending: tasks.filter(t => t.status === 'pending').length, in_progress: tasks.filter(t => t.status === 'in_progress').length, completed: tasks.filter(t => t.status === 'completed').length, cancelled: tasks.filter(t => t.status === 'cancelled').length, overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length };
    res.json({ success: true, data: { tasks, statistics: stats } });
  } catch (error) { console.error('Error:', error); res.status(500).json({ success: false, message: 'Failed to fetch tasks' }); }
};

// Get tasks assigned to current worker
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's farm
    const farmId = await getUserFarmId(userId);
    
    if (!farmId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No farm associated with this user' 
      });
    }

    // Get tasks assigned to this worker
    const [tasks] = await promisePool.execute(
      `SELECT t.*, 
              u1.full_name as assigned_to_name, 
              u2.full_name as created_by_name
       FROM tasks t 
       LEFT JOIN users u1 ON t.assigned_to = u1.id 
       LEFT JOIN users u2 ON t.created_by = u2.id
       WHERE t.farm_id = ? AND t.assigned_to = ?
       ORDER BY 
         CASE 
           WHEN t.status = 'pending' THEN 1
           WHEN t.status = 'in_progress' THEN 2
           WHEN t.status = 'completed' THEN 3
           ELSE 4
         END,
         t.due_date ASC`,
      [farmId, userId]
    );

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        t.due_date && 
        new Date(t.due_date) < new Date() && 
        t.status !== 'completed' && 
        t.status !== 'cancelled'
      ).length
    };

    console.log(`📋 Worker ${userId} has ${tasks.length} tasks:`, {
      pending: stats.pending,
      in_progress: stats.in_progress,
      completed: stats.completed
    });

    res.json({ 
      success: true, 
      data: { 
        tasks, 
        statistics: stats 
      } 
    });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tasks' 
    });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const farmId = await getUserFarmId(userId);
    if (!farmId) return res.status(404).json({ success: false, message: 'No farm' });
    const [tasks] = await promisePool.execute('SELECT t.*, u1.full_name as assigned_to_name FROM tasks t LEFT JOIN users u1 ON t.assigned_to = u1.id WHERE t.id = ? AND t.farm_id = ?', [taskId, farmId]);
    if (!tasks.length) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: tasks[0] });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch task' }); }
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, assignedTo, priority, dueDate, category, location, estimatedHours } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    const farmId = await getUserFarmId(userId);
    if (!farmId) return res.status(404).json({ success: false, message: 'No farm' });
    const taskId = uuidv4();
    await promisePool.execute('INSERT INTO tasks (id, farm_id, title, description, assigned_to, created_by, priority, due_date, category, location, estimated_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [taskId, farmId, title, description || null, assignedTo || null, userId, priority || 'medium', dueDate || null, category || null, location || null, estimatedHours || null]);
    res.status(201).json({ success: true, message: 'Task created', data: { id: taskId } });
  } catch (error) { console.error('Error:', error); res.status(500).json({ success: false, message: 'Failed to create task' }); }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const { title, description, assignedTo, priority, dueDate, category, location, estimatedHours } = req.body;
    const farmId = await getUserFarmId(userId);
    if (!farmId) return res.status(404).json({ success: false, message: 'No farm' });
    await promisePool.execute('UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), assigned_to = COALESCE(?, assigned_to), priority = COALESCE(?, priority), due_date = COALESCE(?, due_date), category = COALESCE(?, category), location = COALESCE(?, location), estimated_hours = COALESCE(?, estimated_hours), updated_at = NOW() WHERE id = ? AND farm_id = ?', [title, description, assignedTo, priority, dueDate, category, location, estimatedHours, taskId, farmId]);
    res.json({ success: true, message: 'Task updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to update task' }); }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const farmId = await getUserFarmId(userId);
    if (!farmId) return res.status(404).json({ success: false, message: 'No farm' });
    await promisePool.execute('DELETE FROM tasks WHERE id = ? AND farm_id = ?', [taskId, farmId]);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to delete task' }); }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    if (!status) return res.status(400).json({ success: false, message: 'Status required' });
    const farmId = await getUserFarmId(userId);
    if (!farmId) return res.status(404).json({ success: false, message: 'No farm' });
    await promisePool.execute('UPDATE tasks SET status = ?, completed_at = CASE WHEN ? = \"completed\" AND completed_at IS NULL THEN NOW() ELSE completed_at END, updated_at = NOW() WHERE id = ? AND farm_id = ?', [status, status, taskId, farmId]);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to update status' }); }
};
