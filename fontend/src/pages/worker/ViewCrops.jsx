import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout,
  MapPin,
  Calendar,
  TrendingUp,
  Info,
  Search,
  Filter
} from 'lucide-react';

const ViewCrops = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    fetchCrops();
  }, [navigate]);

  const fetchCrops = () => {
    // Mock data - replace with API call
    const mockCrops = [
      {
        id: 1,
        name: 'Tomatoes',
        variety: 'Cherry Tomatoes',
        location: 'Field A - North Section',
        area: '2.5 acres',
        plantingDate: '2025-08-15',
        expectedHarvest: '2025-12-10',
        status: 'growing',
        health: 'excellent',
        currentStage: 'Flowering',
        wateringSchedule: 'Daily at 6 AM and 6 PM',
        notes: 'Monitor for pests, especially in northeast corner'
      },
      {
        id: 2,
        name: 'Wheat',
        variety: 'Winter Wheat',
        location: 'North Field',
        area: '10 acres',
        plantingDate: '2025-09-01',
        expectedHarvest: '2025-12-01',
        status: 'ready_to_harvest',
        health: 'good',
        currentStage: 'Maturity',
        wateringSchedule: 'Natural rainfall sufficient',
        notes: 'Ready for harvest next week'
      },
      {
        id: 3,
        name: 'Corn',
        variety: 'Sweet Corn',
        location: 'Field B - South',
        area: '5 acres',
        plantingDate: '2025-07-20',
        expectedHarvest: '2025-11-15',
        status: 'growing',
        health: 'good',
        currentStage: 'Grain filling',
        wateringSchedule: 'Every 2 days',
        notes: 'Check for corn borers weekly'
      },
      {
        id: 4,
        name: 'Lettuce',
        variety: 'Romaine Lettuce',
        location: 'Greenhouse 1',
        area: '0.5 acres',
        plantingDate: '2025-10-01',
        expectedHarvest: '2025-11-30',
        status: 'growing',
        health: 'excellent',
        currentStage: 'Vegetative growth',
        wateringSchedule: 'Daily at 7 AM',
        notes: 'Temperature maintained at 65-70°F'
      },
      {
        id: 5,
        name: 'Potatoes',
        variety: 'Russet Potatoes',
        location: 'Field C - East',
        area: '3 acres',
        plantingDate: '2025-08-10',
        expectedHarvest: '2025-12-15',
        status: 'growing',
        health: 'fair',
        currentStage: 'Tuber development',
        wateringSchedule: 'Every 3 days',
        notes: 'Some yellowing leaves observed, check soil moisture'
      }
    ];
    
    setCrops(mockCrops);
    setFilteredCrops(mockCrops);
  };

  useEffect(() => {
    let filtered = crops;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(crop => crop.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(crop => 
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCrops(filtered);
  }, [crops, searchTerm, filterStatus]);

  const getHealthBadge = (health) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 border-green-200',
      good: 'bg-blue-100 text-blue-800 border-blue-200',
      fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      poor: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[health] || colors.good;
  };

  const getStatusBadge = (status) => {
    const colors = {
      growing: 'bg-blue-100 text-blue-800',
      ready_to_harvest: 'bg-green-100 text-green-800',
      harvesting: 'bg-orange-100 text-orange-800',
      harvested: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      growing: 'Growing',
      ready_to_harvest: 'Ready to Harvest',
      harvesting: 'Harvesting',
      harvested: 'Harvested'
    };
    return { color: colors[status] || colors.growing, label: labels[status] || 'Growing' };
  };

  const getDaysUntilHarvest = (harvestDate) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">View Crops</h1>
        <p className="text-gray-600">Browse crop information and locations</p>
      </div>

      {/* Read-Only Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Read-Only Access</p>
            <p className="text-sm text-blue-700">You can view crop information but cannot make changes. Contact your manager to report any issues.</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search crops by name, variety, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Crops</option>
              <option value="growing">Growing</option>
              <option value="ready_to_harvest">Ready to Harvest</option>
              <option value="harvesting">Harvesting</option>
              <option value="harvested">Harvested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Crops</p>
          <p className="text-2xl font-bold text-gray-800">{crops.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Growing</p>
          <p className="text-2xl font-bold text-blue-600">
            {crops.filter(c => c.status === 'growing').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Ready to Harvest</p>
          <p className="text-2xl font-bold text-green-600">
            {crops.filter(c => c.status === 'ready_to_harvest').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Excellent Health</p>
          <p className="text-2xl font-bold text-emerald-600">
            {crops.filter(c => c.health === 'excellent').length}
          </p>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No crops found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        ) : (
          filteredCrops.map((crop) => {
            const statusInfo = getStatusBadge(crop.status);
            return (
              <div key={crop.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-6 h-6" />
                      <h3 className="text-xl font-bold">{crop.name}</h3>
                    </div>
                  </div>
                  <p className="text-green-100 text-sm">{crop.variety}</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Status and Health Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getHealthBadge(crop.health)}`}>
                      {crop.health.toUpperCase()} HEALTH
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-800">{crop.location}</p>
                      <p className="text-sm text-gray-600">Area: {crop.area}</p>
                    </div>
                  </div>

                  {/* Current Stage */}
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Current Stage</p>
                      <p className="font-medium text-gray-800">{crop.currentStage}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Planted</p>
                          <p className="font-medium text-gray-800">
                            {new Date(crop.plantingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Harvest</p>
                          <p className="font-medium text-gray-800">
                            {getDaysUntilHarvest(crop.expectedHarvest)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Watering Schedule */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-semibold mb-1">💧 WATERING SCHEDULE</p>
                    <p className="text-sm text-blue-900">{crop.wateringSchedule}</p>
                  </div>

                  {/* Notes */}
                  {crop.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-600 font-semibold mb-1">📝 NOTES</p>
                      <p className="text-sm text-yellow-900">{crop.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ViewCrops;
