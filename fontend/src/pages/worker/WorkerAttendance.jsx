import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchWithAuth, checkTokenAndRedirect } from '../../utils/authHelpers';
import { 
  Clock,
  Calendar,
  Play,
  Square,
  TrendingUp,
  CheckCircle,
  FileText,
  XCircle
} from 'lucide-react';

const WorkerAttendance = () => {
  const navigate = useNavigate();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [workHours, setWorkHours] = useState('0h 0m');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState({
    totalDaysWorked: 22,
    totalHoursMonth: 176,
    avgHoursPerDay: 8,
    leaveDays: 2
  });

  useEffect(() => {
    if (checkTokenAndRedirect()) return;
    
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    // Check if already clocked in
    const clockedIn = localStorage.getItem('clockedIn');
    const clockTime = localStorage.getItem('clockInTime');
    if (clockedIn === 'true' && clockTime) {
      setIsClockedIn(true);
      setClockInTime(clockTime);
      updateWorkHours(clockTime);
    }
    
    fetchAttendanceHistory();
  }, [navigate]);

  const fetchAttendanceHistory = async () => {
    try {
      // Get last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetchWithAuth(
        `http://localhost:5000/api/attendance/my-attendance?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setAttendanceHistory(data.data.records);
          setStats({
            totalDaysWorked: data.data.statistics.present,
            totalHoursMonth: data.data.statistics.totalDays * 8,
            avgHoursPerDay: 8,
            leaveDays: data.data.statistics.absent
          });

          // Check if already clocked in today
          const today = new Date().toISOString().split('T')[0];
          const todayRecord = data.data.records.find(r => r.attendance_date.startsWith(today));
          if (todayRecord && todayRecord.clock_in && !todayRecord.clock_out) {
            // Clocked in but not clocked out
            setIsClockedIn(true);
            const clockInDate = new Date(`${today}T${todayRecord.clock_in}`);
            setClockInTime(clockInDate.toISOString());
            localStorage.setItem('clockedIn', 'true');
            localStorage.setItem('clockInTime', clockInDate.toISOString());
          } else if (todayRecord && todayRecord.clock_out) {
            // Already clocked out for today
            setIsClockedIn(false);
            setClockInTime(null);
            localStorage.removeItem('clockedIn');
            localStorage.removeItem('clockInTime');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to load attendance history');
      }
    }
  };

  const updateWorkHours = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setWorkHours(`${hours}h ${minutes}m`);
  };

  useEffect(() => {
    if (isClockedIn && clockInTime) {
      const interval = setInterval(() => {
        updateWorkHours(clockInTime);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isClockedIn, clockInTime]);

  const handleClockIn = async () => {
    try {
      if (checkTokenAndRedirect()) return;

      const now = new Date();
      const time = now.toTimeString().split(' ')[0]; // HH:MM:SS format
      const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Send clock-in to backend
      const response = await fetchWithAuth('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: date,
          status: 'present',
          clockIn: time,
          notes: 'Worker clocked in via app'
        })
      });

      if (response.ok) {
        const nowISO = now.toISOString();
        setIsClockedIn(true);
        setClockInTime(nowISO);
        localStorage.setItem('clockedIn', 'true');
        localStorage.setItem('clockInTime', nowISO);
        toast.success('Clocked in successfully!');
        fetchAttendanceHistory(); // Refresh history
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to clock in');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to clock in');
      }
    }
  };

  const handleClockOut = async () => {
    try {
      if (checkTokenAndRedirect()) return;

      const now = new Date();
      const time = now.toTimeString().split(' ')[0]; // HH:MM:SS format
      const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Send clock-out to backend
      const response = await fetchWithAuth('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: date,
          status: 'present',
          clockOut: time,
          notes: 'Worker clocked out via app'
        })
      });

      if (response.ok) {
        setIsClockedIn(false);
        setClockInTime(null);
        localStorage.removeItem('clockedIn');
        localStorage.removeItem('clockInTime');
        toast.success('Clocked out successfully! Have a great day!');
        fetchAttendanceHistory(); // Refresh history
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to clock out');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to clock out');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance</h1>

      {/* Clock In/Out Card */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
              <Clock className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {isClockedIn ? 'Currently Working' : 'Ready to Start?'}
              </h2>
              {isClockedIn ? (
                <div className="space-y-1">
                  <p className="text-orange-100">
                    Started at: {new Date(clockInTime).toLocaleTimeString()}
                  </p>
                  <p className="text-2xl font-semibold">
                    Time Elapsed: {workHours}
                  </p>
                </div>
              ) : (
                <p className="text-orange-100">Clock in to start your work day</p>
              )}
            </div>
          </div>
          
          <button
            onClick={isClockedIn ? handleClockOut : handleClockIn}
            className={`flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
              isClockedIn 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-6 h-6" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Clock In
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Days Worked</p>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalDaysWorked}</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Hours</p>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalHoursMonth}</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Hours/Day</p>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.avgHoursPerDay}</p>
          <p className="text-xs text-gray-500 mt-1">Average</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Leave Days</p>
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.leaveDays}</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceHistory.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.clock_in || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.clock_out || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">
                      {record.clock_in && record.clock_out ? '8h' : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.status === 'present' && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Present
                      </span>
                    )}
                    {record.status === 'absent' && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        Absent
                      </span>
                    )}
                    {record.status === 'half_day' && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 w-fit">
                        Half Day
                      </span>
                    )}
                    {record.status === 'late' && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 w-fit">
                        Late
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerAttendance;
