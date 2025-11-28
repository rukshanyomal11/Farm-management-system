import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, TrendingUp, Activity, Home, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalFarms: 0,
    recentLogins: 0
  });

  useEffect(() => {
    // Check if admin is logged in
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
    const token = localStorage.getItem('adminAccessToken');

    if (!adminUser || !token) {
      toast.error('Please login as admin');
      navigate('/admin/login');
      return;
    }

    setAdmin(adminUser);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.data.users.total_users,
          activeUsers: data.data.users.active_users,
          totalFarms: data.data.farms.total_farms,
          recentLogins: data.data.users.logged_in_today
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {admin.fullName}!</h2>
        <p className="text-blue-100">System administrator control panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.activeUsers}</h3>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>

          {/* Recent Logins */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Recent</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.recentLogins}</h3>
            <p className="text-sm text-gray-600">Recent Logins</p>
          </div>

          {/* Total Farms */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Farms</span>
            </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalFarms}</h3>
          <p className="text-sm text-gray-600">Total Farms</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Manage Users</span>
            </button>
            <button className="flex items-center gap-3 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
              <Home className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-700">View Farms</span>
            </button>
            <button className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
              <Settings className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">System Settings</span>
          </button>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>📊 Dashboard Overview:</strong> Navigate through the sidebar to access User Management, Farm Management, Reports, and Settings.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;