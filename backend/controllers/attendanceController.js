const { promisePool } = require('../config/database');
const crypto = require('crypto');

// Helper function to get farm ID
const getUserFarmId = async (userId) => {
  const [memberFarms] = await promisePool.execute(
    'SELECT farm_id FROM farm_members WHERE user_id = ? AND role IN ("manager", "worker") ORDER BY joined_at DESC LIMIT 1', 
    [userId]
  );
  
  if (memberFarms.length > 0) {
    return memberFarms[0].farm_id;
  }
  
  const [ownedFarms] = await promisePool.execute(
    'SELECT id FROM farms WHERE owner_id = ?', 
    [userId]
  );
  
  if (ownedFarms.length > 0) {
    return ownedFarms[0].id;
  }
  
  return null;
};

// Mark attendance for a worker
exports.markAttendance = async (req, res) => {
  try {
    const recordedBy = req.user.userId;
    const { userId, date, status, clockIn, clockOut, notes } = req.body;
    
    // If userId is not provided, use the logged-in user's ID (for self clock-in/out)
    const targetUserId = userId || recordedBy;
    
    // Get farm
    const farmId = await getUserFarmId(recordedBy);
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm associated with this user'
      });
    }
    
    // Check if attendance already exists
    const [existing] = await promisePool.query(
      'SELECT id, clock_in, clock_out, status FROM attendance WHERE user_id = ? AND farm_id = ? AND attendance_date = ?',
      [targetUserId, farmId, date]
    );
    
    if (existing.length > 0) {
      // Update existing attendance - preserve existing values if not provided
      const existingRecord = existing[0];
      
      // Only update clock_in if explicitly provided (not null/undefined)
      const updatedClockIn = clockIn !== undefined && clockIn !== null ? clockIn : existingRecord.clock_in;
      
      // Only update clock_out if explicitly provided (not null/undefined)
      const updatedClockOut = clockOut !== undefined && clockOut !== null ? clockOut : existingRecord.clock_out;
      
      // Update status if provided, otherwise keep existing
      const updatedStatus = status || existingRecord.status;
      
      // Update notes if provided
      const updatedNotes = notes !== undefined ? notes : null;
      
      await promisePool.query(
        `UPDATE attendance 
         SET status = ?, clock_in = ?, clock_out = ?, notes = ?, recorded_by = ?
         WHERE id = ?`,
        [updatedStatus, updatedClockIn, updatedClockOut, updatedNotes, recordedBy, existingRecord.id]
      );
      
      return res.json({
        status: 'success',
        message: 'Attendance updated successfully'
      });
    }
    
    // Create new attendance record
    const attendanceId = crypto.randomUUID();
    await promisePool.query(
      `INSERT INTO attendance (id, user_id, farm_id, attendance_date, status, clock_in, clock_out, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [attendanceId, targetUserId, farmId, date, status, clockIn, clockOut, notes, recordedBy]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Attendance marked successfully',
      data: { id: attendanceId }
    });
    
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark attendance',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get attendance records
exports.getAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, workerId } = req.query;
    
    // Get farm
    const farmId = await getUserFarmId(userId);
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm associated with this user'
      });
    }
    
    let query = `
      SELECT 
        a.id,
        a.user_id,
        a.attendance_date,
        a.status,
        a.clock_in,
        a.clock_out,
        a.notes,
        u.full_name as worker_name,
        u.role as worker_role,
        recorder.full_name as recorded_by_name
      FROM attendance a
      INNER JOIN users u ON a.user_id = u.id
      LEFT JOIN users recorder ON a.recorded_by = recorder.id
      WHERE a.farm_id = ?
    `;
    
    const params = [farmId];
    
    if (startDate) {
      query += ' AND a.attendance_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND a.attendance_date <= ?';
      params.push(endDate);
    }
    
    if (workerId) {
      query += ' AND a.user_id = ?';
      params.push(workerId);
    }
    
    query += ' ORDER BY a.attendance_date DESC, u.full_name ASC';
    
    const [records] = await promisePool.query(query, params);
    
    // Calculate statistics
    const stats = {
      totalRecords: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      halfDay: records.filter(r => r.status === 'half_day').length,
      late: records.filter(r => r.status === 'late').length
    };
    
    res.json({
      status: 'success',
      data: {
        records,
        statistics: stats
      }
    });
    
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance records',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get attendance for a specific worker
exports.getWorkerAttendance = async (req, res) => {
  try {
    const workerId = req.user.userId;
    const { startDate, endDate } = req.query;
    
    // Get farm
    const farmId = await getUserFarmId(workerId);
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm associated with this user'
      });
    }
    
    let query = `
      SELECT 
        id,
        attendance_date,
        status,
        clock_in,
        clock_out,
        notes
      FROM attendance
      WHERE user_id = ? AND farm_id = ?
    `;
    
    const params = [workerId, farmId];
    
    if (startDate) {
      query += ' AND attendance_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND attendance_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY attendance_date DESC';
    
    const [records] = await promisePool.query(query, params);
    
    // Calculate statistics
    const stats = {
      totalDays: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      halfDay: records.filter(r => r.status === 'half_day').length,
      late: records.filter(r => r.status === 'late').length
    };
    
    res.json({
      status: 'success',
      data: {
        records,
        statistics: stats
      }
    });
    
  } catch (error) {
    console.error('Get worker attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance records',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Bulk mark attendance for multiple workers
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const recordedBy = req.user.userId;
    const { date, attendanceRecords } = req.body;
    
    const farmId = await getUserFarmId(recordedBy);
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm associated with this user'
      });
    }
    
    const successRecords = [];
    const failedRecords = [];
    
    for (const record of attendanceRecords) {
      try {
        const { userId, status, clockIn, clockOut, notes } = record;
        
        const [existing] = await promisePool.query(
          'SELECT id, clock_in, clock_out, status FROM attendance WHERE user_id = ? AND farm_id = ? AND attendance_date = ?',
          [userId, farmId, date]
        );
        
        if (existing.length > 0) {
          // Preserve existing clock times if not provided
          const existingRecord = existing[0];
          const updatedClockIn = clockIn !== undefined && clockIn !== null ? clockIn : existingRecord.clock_in;
          const updatedClockOut = clockOut !== undefined && clockOut !== null ? clockOut : existingRecord.clock_out;
          
          await promisePool.query(
            `UPDATE attendance 
             SET status = ?, clock_in = ?, clock_out = ?, notes = ?, recorded_by = ?
             WHERE id = ?`,
            [status, updatedClockIn, updatedClockOut, notes, recordedBy, existing[0].id]
          );
        } else {
          const attendanceId = crypto.randomUUID();
          await promisePool.query(
            `INSERT INTO attendance (id, user_id, farm_id, attendance_date, status, clock_in, clock_out, notes, recorded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [attendanceId, userId, farmId, date, status, clockIn, clockOut, notes, recordedBy]
          );
        }
        
        successRecords.push(userId);
      } catch (error) {
        console.error(`Failed to mark attendance for user ${record.userId}:`, error);
        failedRecords.push(record.userId);
      }
    }
    
    res.json({
      status: 'success',
      message: `Attendance marked for ${successRecords.length} workers`,
      data: {
        success: successRecords.length,
        failed: failedRecords.length,
        failedUsers: failedRecords
      }
    });
    
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark bulk attendance',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get attendance summary for a worker
exports.getWorkerSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { workerId, month, year } = req.query;
    
    const targetUserId = workerId || userId;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();
    
    const farmId = await getUserFarmId(userId);
    
    if (!farmId) {
      return res.status(404).json({
        status: 'error',
        message: 'No farm associated with this user'
      });
    }
    
    const [records] = await promisePool.query(
      `SELECT 
        attendance_date,
        status,
        clock_in,
        clock_out
       FROM attendance
       WHERE user_id = ? 
         AND farm_id = ? 
         AND MONTH(attendance_date) = ? 
         AND YEAR(attendance_date) = ?
       ORDER BY attendance_date ASC`,
      [targetUserId, farmId, targetMonth, targetYear]
    );
    
    const stats = {
      totalDays: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      halfDay: records.filter(r => r.status === 'half_day').length,
      late: records.filter(r => r.status === 'late').length,
      attendanceRate: records.length > 0 
        ? Math.round((records.filter(r => r.status === 'present' || r.status === 'late').length / records.length) * 100)
        : 0
    };
    
    res.json({
      status: 'success',
      data: {
        records,
        statistics: stats,
        month: targetMonth,
        year: targetYear
      }
    });
    
  } catch (error) {
    console.error('Get worker summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance summary',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
