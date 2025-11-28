import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Home, MapPin, TrendingUp, RefreshCw } from 'lucide-react';

const FarmManagement = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [typeStats, setTypeStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/farms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFarms(data.data.farms);
        setTypeStats(data.data.typeStats);
      } else if (response.status === 401) {
        toast.error('Session expired');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast.error('Failed to fetch farms');
    } finally {
      setLoading(false);
    }
  };

  const getFarmTypeColor = (type) => {
    const colors = {
      'Crop Farming': 'bg-green-100 text-green-800',
      'Livestock': 'bg-yellow-100 text-yellow-800',
      'Dairy Farm': 'bg-blue-100 text-blue-800',
      'Poultry Farm': 'bg-orange-100 text-orange-800',
      'Mixed Farming': 'bg-purple-100 text-purple-800',
      'Organic Farm': 'bg-teal-100 text-teal-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Home className="w-8 h-8 text-green-600" />
          Farm Management
        </h1>
        <p className="text-gray-600 mt-1">View and manage all registered farms</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Farms</p>
              <p className="text-3xl font-bold text-gray-800">{farms.length}</p>
            </div>
            <Home className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Farm Size</p>
              <p className="text-3xl font-bold text-gray-800">
                {farms.reduce((sum, farm) => sum + parseFloat(farm.farm_size || 0), 0).toFixed(1)}
                <span className="text-lg text-gray-500"> acres</span>
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Size</p>
              <p className="text-3xl font-bold text-gray-800">
                {farms.length > 0 
                  ? (farms.reduce((sum, farm) => sum + parseFloat(farm.farm_size || 0), 0) / farms.length).toFixed(1)
                  : 0}
                <span className="text-lg text-gray-500"> acres</span>
              </p>
            </div>
            <MapPin className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Farm Type Distribution */}
      {typeStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Farm Type Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeStats.map((stat) => (
              <div key={stat.farm_type} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                <p className="text-sm text-gray-600">{stat.farm_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <button
          onClick={fetchFarms}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <div key={farm.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="w-16 h-16 text-white opacity-50" />
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{farm.farm_name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Type:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getFarmTypeColor(farm.farm_type)}`}>
                    {farm.farm_type}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Size:</span>
                  <span>{farm.farm_size} acres</span>
                </div>
                
                {farm.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {farm.address}, {farm.city}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-medium text-gray-800">{farm.owner_name}</p>
                <p className="text-sm text-gray-500">{farm.owner_email}</p>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Created: {new Date(farm.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {farms.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No farms registered yet</p>
        </div>
      )}
    </div>
  );
};

export default FarmManagement;
