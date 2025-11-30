import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchWithAuth, checkTokenAndRedirect } from '../utils/authHelpers';
import { 
  Sprout, 
  Bird, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar,
  CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FarmOwnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    crops: { total: 0, active: 0, harvesting: 0 },
    livestock: { total: 0, healthy: 0, needsAttention: 0 },
    inventory: { items: 0, lowStock: 0 },
    finance: { income: 0, expenses: 0, profit: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');

    if (!userData || !token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setUser(userData);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (checkTokenAndRedirect()) return;

      const response = await fetchWithAuth(`${API_URL}/dashboard/farmer`);

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const dashData = data.data;
        setDashboardData(dashData);

        // Set statistics
        setStats({
          crops: {
            total: dashData.statistics.crops.total_crops || 0,
            active: (dashData.statistics.crops.planted || 0) + (dashData.statistics.crops.growing || 0),
            harvesting: dashData.statistics.crops.ready_to_harvest || 0
          },
          livestock: {
            total: dashData.statistics.livestock.total_livestock || 0,
            healthy: dashData.statistics.livestock.healthy || 0,
            needsAttention: dashData.statistics.livestock.sick || 0
          },
          inventory: {
            items: dashData.statistics.inventory.total_items || 0,
            lowStock: dashData.statistics.inventory.low_stock_items || 0
          },
          finance: {
            income: 0, // You can add this data later
            expenses: dashData.statistics.inventory.total_value || 0,
            profit: 0
          }
        });

        // Set recent activities from recent data
        const activities = [];
        
        // Add recent crops
        if (dashData.recent.crops && dashData.recent.crops.length > 0) {
          dashData.recent.crops.slice(0, 2).forEach(crop => {
            activities.push({
              id: `crop-${crop.crop_name}`,
              type: 'crop',
              message: `${crop.crop_name} ${crop.variety ? '(' + crop.variety + ')' : ''} - ${crop.status}`,
              time: new Date(crop.planting_date).toLocaleDateString(),
              icon: Sprout,
              color: 'text-green-600'
            });
          });
        }

        // Add recent livestock
        if (dashData.recent.livestock && dashData.recent.livestock.length > 0) {
          dashData.recent.livestock.slice(0, 2).forEach(animal => {
            activities.push({
              id: `livestock-${animal.tag_number}`,
              type: 'livestock',
              message: `${animal.type} #${animal.tag_number} - ${animal.status}`,
              time: animal.birth_date ? new Date(animal.birth_date).toLocaleDateString() : 'N/A',
              icon: Bird,
              color: 'text-orange-600'
            });
          });
        }

        // Add low stock alerts
        if (dashData.recent.lowStockItems && dashData.recent.lowStockItems.length > 0) {
          dashData.recent.lowStockItems.slice(0, 2).forEach(item => {
            activities.push({
              id: `inventory-${item.item_name}`,
              type: 'inventory',
              message: `Low stock: ${item.item_name} (${item.quantity} ${item.unit})`,
              time: 'Alert',
              icon: AlertTriangle,
              color: 'text-red-600'
            });
          });
        }

        setRecentActivities(activities);

        // Set upcoming tasks (based on low stock items)
        const tasks = [];
        if (dashData.recent.lowStockItems && dashData.recent.lowStockItems.length > 0) {
          dashData.recent.lowStockItems.forEach((item, index) => {
            tasks.push({
              id: index + 1,
              task: `Restock ${item.item_name} (Currently: ${item.quantity} ${item.unit})`,
              due: 'Soon',
              priority: item.quantity <= item.reorder_level * 0.5 ? 'high' : 'medium'
            });
          });
        }
        setUpcomingTasks(tasks);

      } else {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(data.message || 'Failed to fetch dashboard data');
        }
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user.fullName || user.full_name}!</h2>
        <p className="text-green-100">Here's what's happening on your farm today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Crops */}
        <Link to="/dashboard/crops" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Sprout className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Crops</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.crops.total}</h3>
          <p className="text-sm text-gray-600 mb-2">Total Crops</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600 font-medium">{stats.crops.active} Active</span>
            <span className="text-gray-400">•</span>
            <span className="text-orange-600 font-medium">{stats.crops.harvesting} Harvesting</span>
          </div>
        </Link>

        {/* Livestock */}
        <Link to="/dashboard/livestock" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Bird className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Livestock</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.livestock.total}</h3>
          <p className="text-sm text-gray-600 mb-2">Total Animals</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600 font-medium">{stats.livestock.healthy} Healthy</span>
            {stats.livestock.needsAttention > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-red-600 font-medium">{stats.livestock.needsAttention} Alert</span>
              </>
            )}
          </div>
        </Link>

        {/* Inventory */}
        <Link to="/dashboard/inventory" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Inventory</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.inventory.items}</h3>
          <p className="text-sm text-gray-600 mb-2">Items Tracked</p>
          {stats.inventory.lowStock > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-medium">{stats.inventory.lowStock} Low Stock</span>
            </div>
          )}
        </Link>

        {/* Finance */}
        <Link to="/dashboard/finance" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">${(stats.finance.profit / 1000).toFixed(1)}K</h3>
          <p className="text-sm text-gray-600 mb-2">Net Profit</p>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span className="font-medium">+12% from last month</span>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${activity.color.replace('text', 'bg').replace('600', '100')}`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Upcoming Tasks
          </h3>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-800">{task.task}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{task.due}</p>
              </div>
            ))}
          </div>
          <Link 
            to="/dashboard/tasks"
            className="mt-4 block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            View All Tasks
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/crops" className="flex flex-col items-center gap-2 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
            <Sprout className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Add Crop</span>
          </Link>
          <Link to="/dashboard/livestock" className="flex flex-col items-center gap-2 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
            <Bird className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Add Livestock</span>
          </Link>
          <Link to="/dashboard/inventory" className="flex flex-col items-center gap-2 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <Package className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Add Item</span>
          </Link>
          <Link to="/dashboard/tasks" className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">New Task</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FarmOwnerDashboard;
