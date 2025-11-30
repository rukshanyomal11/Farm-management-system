import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchWithAuth, checkTokenAndRedirect } from '../utils/authHelpers';
import { 
  Clock,
  CheckCircle,
  ClipboardList,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText,
  Play,
  Square
} from 'lucide-react';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [workHours, setWorkHours] = useState('0h 0m');
  const [stats, setStats] = useState({
    tasksToday: 5,
    tasksCompleted: 2,
    totalHoursWeek: 38.5,
    pendingReports: 1
  });
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    fetchDashboardData();
    
    // Check if already clocked in today
    const clockedIn = localStorage.getItem('clockedIn');
    const clockTime = localStorage.getItem('clockInTime');
    if (clockedIn === 'true' && clockTime) {
      setIsClockedIn(true);
      setClockInTime(clockTime);
      updateWorkHours(clockTime);
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth('http://localhost:5000/api/tasks/my-tasks');

      if (response.ok) {
        const data = await response.json();
        const tasks = data.data.tasks || [];
        const statistics = data.data.statistics || {};

        console.log('Fetched tasks:', tasks);

        // Filter tasks - show only tasks that are due today or past due, and are pending/in_progress
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tasksToday = tasks.filter(task => {
          // Only show pending or in_progress tasks
          if (task.status !== 'pending' && task.status !== 'in_progress') {
            return false;
          }
          
          // If task has due_date, check if it's today or past
          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() <= today.getTime();
          }
          
          // If no due_date, show immediately
          return true;
        });

        console.log('Tasks for display:', tasksToday);

        setTodayTasks(tasksToday);
        setStats({
          tasksToday: tasksToday.length,
          tasksCompleted: statistics.completed || 0,
          totalHoursWeek: stats.totalHoursWeek, // Keep existing
          pendingReports: statistics.pending || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to load dashboard data');
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
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [isClockedIn, clockInTime]);

  const handleClockIn = () => {
    const now = new Date().toISOString();
    setIsClockedIn(true);
    setClockInTime(now);
    localStorage.setItem('clockedIn', 'true');
    localStorage.setItem('clockInTime', now);
    toast.success('Clocked in successfully!');
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    setClockInTime(null);
    localStorage.removeItem('clockedIn');
    localStorage.removeItem('clockInTime');
    toast.success('Clocked out successfully!');
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority] || colors.low;
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  if (!user) return null;

  return (
    <div className="h-full bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg shadow-lg p-6 mb-4 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.fullName}!</h1>
        <p className="text-orange-100">Ready for today's farm work?</p>
      </div>

      {/* Clock In/Out Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isClockedIn ? 'Clocked In' : 'Not Clocked In'}
              </h2>
              {isClockedIn ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Started at: {new Date(clockInTime).toLocaleTimeString()}
                  </p>
                  <p className="text-lg font-semibold text-orange-600">
                    Work Time: {workHours}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Click to start your work day</p>
              )}
            </div>
          </div>
          
          <button
            onClick={isClockedIn ? handleClockOut : handleClockIn}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              isClockedIn 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-5 h-5" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Clock In
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Tasks Today</p>
            <ClipboardList className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.tasksToday}</p>
          <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.tasksCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Tasks done today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Hours (Week)</p>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalHoursWeek}</p>
          <p className="text-xs text-gray-500 mt-1">This week</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending Reports</p>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingReports}</p>
          <p className="text-xs text-gray-500 mt-1">Submit soon</p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Today's Tasks</h2>
          <Link 
            to="/worker/tasks"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p>No tasks assigned for today</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      task.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityBadge(task.priority)}`}>
                          {task.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ⏰ Due: {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(task.status)}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/worker/tasks"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <ClipboardList className="w-12 h-12 text-orange-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">My Tasks</h3>
          <p className="text-sm text-gray-600">View and manage your assigned tasks</p>
        </Link>

        <Link 
          to="/worker/reports"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <FileText className="w-12 h-12 text-purple-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Submit Report</h3>
          <p className="text-sm text-gray-600">Submit your daily work report</p>
        </Link>

        <Link 
          to="/worker/calendar"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Calendar className="w-12 h-12 text-blue-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">View Calendar</h3>
          <p className="text-sm text-gray-600">Check farm schedule and events</p>
        </Link>
      </div>
    </div>
  );
};

export default WorkerDashboard;
