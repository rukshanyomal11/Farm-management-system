import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye,
  Sprout,
  Beef,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  MessageSquare,
  Info
} from 'lucide-react';

const ViewerDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }
    
    setUserData(user);
  }, [navigate]);

  // Mock farm overview data
  const farmStats = {
    farmName: 'Green Valley Farm',
    totalArea: '50 acres',
    activeCrops: 12,
    totalLivestock: 85,
    lastUpdate: '2025-11-28',
    overallHealth: 'excellent'
  };

  const cropSummary = [
    { name: 'Tomatoes', area: '2.5 acres', status: 'growing', health: 'excellent' },
    { name: 'Wheat', area: '10 acres', status: 'ready_to_harvest', health: 'good' },
    { name: 'Corn', area: '5 acres', status: 'growing', health: 'good' },
    { name: 'Lettuce', area: '0.5 acres', status: 'growing', health: 'excellent' }
  ];

  const livestockSummary = [
    { type: 'Dairy Cattle', count: 45, health: 'good', production: '95%' },
    { type: 'Chickens', count: 30, health: 'excellent', production: '88%' },
    { type: 'Sheep', count: 10, health: 'good', production: '92%' }
  ];

  const recentActivities = [
    { date: '2025-11-27', activity: 'Wheat field inspection completed', type: 'inspection' },
    { date: '2025-11-26', activity: 'Livestock health check - All animals healthy', type: 'health' },
    { date: '2025-11-25', activity: 'Irrigation system maintenance performed', type: 'maintenance' },
    { date: '2025-11-24', activity: 'Pest control treatment in tomato field', type: 'treatment' }
  ];

  const quickActions = [
    { 
      title: 'View Crop Records',
      description: 'Browse all crop information',
      icon: Sprout,
      color: 'from-green-600 to-emerald-600',
      link: '/viewer/crops'
    },
    { 
      title: 'Livestock Data',
      description: 'View animal health and production',
      icon: Beef,
      color: 'from-orange-600 to-amber-600',
      link: '/viewer/livestock'
    },
    { 
      title: 'Reports & Analytics',
      description: 'Access farm performance data',
      icon: BarChart3,
      color: 'from-purple-600 to-pink-600',
      link: '/viewer/reports'
    },
    { 
      title: 'Add Recommendations',
      description: 'Submit advisory suggestions',
      icon: FileText,
      color: 'from-blue-600 to-indigo-600',
      link: '/viewer/recommendations'
    }
  ];

  const getHealthBadge = (health) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[health] || colors.good;
  };

  return (
    <div>
      {/* Read-Only Access Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Read-Only Consultant Access</h2>
            <p className="text-cyan-50">
              You have viewer access to {farmStats.farmName}. You can view all farm data, 
              add comments, and generate recommendation reports. You cannot edit or delete any records.
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {userData?.full_name || 'Consultant'}!
        </h1>
        <p className="text-gray-600">Here's an overview of {farmStats.farmName}</p>
      </div>

      {/* Farm Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Area</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{farmStats.totalArea}</p>
          <p className="text-xs text-gray-500 mt-1">Farm coverage</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Crops</h3>
            <Sprout className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{farmStats.activeCrops}</p>
          <p className="text-xs text-gray-500 mt-1">Different varieties</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Livestock</h3>
            <Beef className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{farmStats.totalLivestock}</p>
          <p className="text-xs text-gray-500 mt-1">Total animals</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Overall Health</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getHealthBadge(farmStats.overallHealth)}`}>
            {farmStats.overallHealth.toUpperCase()}
          </span>
          <p className="text-xs text-gray-500 mt-1">Farm status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Crop Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sprout className="w-6 h-6 text-green-600" />
              Crop Summary
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {cropSummary.map((crop, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{crop.name}</p>
                    <p className="text-sm text-gray-600">{crop.area}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getHealthBadge(crop.health)}`}>
                    {crop.health}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/viewer/crops"
              className="block mt-4 text-center py-2 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              View All Crops →
            </Link>
          </div>
        </div>

        {/* Livestock Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Beef className="w-6 h-6 text-orange-600" />
              Livestock Summary
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {livestockSummary.map((animal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{animal.type}</p>
                    <p className="text-sm text-gray-600">{animal.count} animals</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getHealthBadge(animal.health)}`}>
                      {animal.health}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Production: {animal.production}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/viewer/livestock"
              className="block mt-4 text-center py-2 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              View All Livestock →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Recent Farm Activities
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border-l-4 border-cyan-600 bg-cyan-50 rounded">
                <Calendar className="w-5 h-5 text-cyan-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.activity}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(activity.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
