import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Sprout,
  Bird,
  Package,
  Plus,
  TrendingUp,
  Calendar,
  Cloud,
  CloudRain,
  Sun,
  ClipboardList
} from 'lucide-react';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    todayTasks: { total: 0, completed: 0, pending: 0, inProgress: 0 },
    staff: { total: 0, present: 0, absent: 0 },
    weather: { condition: 'sunny', temp: 28, description: 'Clear sky' }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = () => {
    // Mock data - replace with API calls
    setStats({
      todayTasks: { total: 12, completed: 7, pending: 5, inProgress: 3 },
      staff: { total: 10, present: 8, absent: 2 },
      weather: { condition: 'sunny', temp: 28, description: 'Clear sky, good for fieldwork' }
    });

    setRecentActivities([
      { id: 1, type: 'task', message: 'Wheat field irrigation completed', user: 'John Doe', time: '15 mins ago', icon: CheckCircle, color: 'text-green-600' },
      { id: 2, type: 'staff', message: 'Staff attendance marked for today', user: 'You', time: '1 hour ago', icon: Users, color: 'text-blue-600' },
      { id: 3, type: 'crop', message: 'Crop health inspection scheduled', user: 'You', time: '2 hours ago', icon: Sprout, color: 'text-green-600' },
      { id: 4, type: 'livestock', message: 'Cattle feeding completed', user: 'Sarah Wilson', time: '3 hours ago', icon: Bird, color: 'text-orange-600' }
    ]);

    setUrgentTasks([
      { id: 1, title: 'Fertilizer application - North Field', priority: 'high', dueTime: 'Today 2:00 PM', assignedTo: 'John Doe' },
      { id: 2, title: 'Check irrigation system', priority: 'high', dueTime: 'Today 4:00 PM', assignedTo: 'Mike Brown' },
      { id: 3, title: 'Livestock health checkup', priority: 'medium', dueTime: 'Tomorrow 9:00 AM', assignedTo: 'Sarah Wilson' }
    ]);
  };

  const getWeatherIcon = () => {
    const condition = stats.weather.condition;
    if (condition === 'sunny') return <Sun className="w-8 h-8 text-yellow-500" />;
    if (condition === 'rainy') return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  if (!user) return null;

  return (
    <div className="h-full bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg shadow-lg p-6 mb-4 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
        <p className="text-blue-100">Here's what's happening on the farm today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Today's Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Today's Tasks</p>
              <p className="text-3xl font-bold text-gray-800">{stats.todayTasks.total}</p>
            </div>
            <ClipboardList className="w-12 h-12 text-blue-600" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{stats.todayTasks.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.todayTasks.pending}</span>
            </div>
          </div>
        </div>

        {/* Staff Attendance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Staff Attendance</p>
              <p className="text-3xl font-bold text-gray-800">{stats.staff.present}/{stats.staff.total}</p>
            </div>
            <Users className="w-12 h-12 text-indigo-600" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Present</span>
              <span className="font-semibold text-green-600">{stats.staff.present}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Absent</span>
              <span className="font-semibold text-red-600">{stats.staff.absent}</span>
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Weather Today</p>
              <p className="text-3xl font-bold text-gray-800">{stats.weather.temp}°C</p>
            </div>
            {getWeatherIcon()}
          </div>
          <p className="text-sm text-gray-600">{stats.weather.description}</p>
        </div>

        {/* Quick Action */}
        <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <p className="text-sm mb-2">Quick Actions</p>
          <Link 
            to="/manager/tasks"
            className="flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium mb-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Link>
          <Link 
            to="/manager/staff"
            className="flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Users className="w-4 h-4" />
            Mark Attendance
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`p-2 rounded-lg bg-white ${activity.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">by {activity.user}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <Link to="/manager/reports" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Activities →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Tasks - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Urgent Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {urgentTasks.map((task) => (
                  <div key={task.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{task.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link 
                  to="/manager/tasks"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View All Tasks
                </Link>
              </div>
            </div>
          </div>

          {/* Operations Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Today's Summary</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link to="/manager/crops" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Sprout className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Crop Activities</span>
                </div>
                <span className="text-sm font-bold text-green-600">3 pending</span>
              </Link>
              
              <Link to="/manager/livestock" className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Bird className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Livestock Care</span>
                </div>
                <span className="text-sm font-bold text-orange-600">2 pending</span>
              </Link>
              
              <Link to="/manager/inventory" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Inventory Updates</span>
                </div>
                <span className="text-sm font-bold text-purple-600">1 low stock</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
