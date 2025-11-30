import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout,
  MapPin,
  Calendar,
  TrendingUp,
  Info,
  Search,
  Filter,
  Eye,
  MessageSquare,
  FileText
} from 'lucide-react';

const ViewerCropRecords = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
        soilType: 'Loamy',
        phLevel: '6.5',
        lastInspection: '2025-11-25',
        notes: 'Monitor for pests, especially in northeast corner',
        expenses: '$1,250',
        estimatedYield: '3,500 kg'
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
        soilType: 'Clay loam',
        phLevel: '7.0',
        lastInspection: '2025-11-27',
        notes: 'Ready for harvest next week',
        expenses: '$4,800',
        estimatedYield: '15,000 kg'
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
        soilType: 'Sandy loam',
        phLevel: '6.8',
        lastInspection: '2025-11-24',
        notes: 'Check for corn borers weekly',
        expenses: '$2,300',
        estimatedYield: '8,000 kg'
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
        soilType: 'Peat-based mix',
        phLevel: '6.2',
        lastInspection: '2025-11-26',
        notes: 'Temperature maintained at 65-70°F',
        expenses: '$600',
        estimatedYield: '800 kg'
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
        soilType: 'Sandy',
        phLevel: '5.5',
        lastInspection: '2025-11-23',
        notes: 'Some yellowing leaves observed, check soil moisture',
        expenses: '$1,800',
        estimatedYield: '5,500 kg'
      }
    ];
    
    setCrops(mockCrops);
    setFilteredCrops(mockCrops);
  };

  useEffect(() => {
    let filtered = crops;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(crop => crop.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(crop => 
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCrops(filtered);
  }, [crops, searchTerm, filterStatus]);

  const handleViewDetails = (crop) => {
    setSelectedCrop(crop);
    setShowDetailsModal(true);
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Records</h1>
        <p className="text-gray-600">Comprehensive view of all crop information</p>
      </div>

      {/* Read-Only Notice */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-600 mt-0.5" />
          <div>
            <p className="font-medium text-cyan-900">Viewer Access - Read Only</p>
            <p className="text-sm text-cyan-700">You can view detailed crop records and add recommendations, but cannot edit or delete records.</p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
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
                {/* Header */}
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
                  {/* Status and Health */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getHealthBadge(crop.health)}`}>
                      {crop.health.toUpperCase()}
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

                  {/* Harvest Date */}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Expected Harvest</p>
                      <p className="font-medium text-gray-800">{getDaysUntilHarvest(crop.expectedHarvest)}</p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewDetails(crop)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Crop Details - {selectedCrop.name}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Variety</p>
                  <p className="font-medium text-gray-800">{selectedCrop.variety}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-800">{selectedCrop.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="font-medium text-gray-800">{selectedCrop.area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Stage</p>
                  <p className="font-medium text-gray-800">{selectedCrop.currentStage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Planting Date</p>
                  <p className="font-medium text-gray-800">{new Date(selectedCrop.plantingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Harvest</p>
                  <p className="font-medium text-gray-800">{new Date(selectedCrop.expectedHarvest).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Soil Type</p>
                  <p className="font-medium text-gray-800">{selectedCrop.soilType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">pH Level</p>
                  <p className="font-medium text-gray-800">{selectedCrop.phLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expenses</p>
                  <p className="font-medium text-gray-800">{selectedCrop.expenses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Yield</p>
                  <p className="font-medium text-gray-800">{selectedCrop.estimatedYield}</p>
                </div>
              </div>

              {/* Watering Schedule */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">💧 Watering Schedule</p>
                <p className="text-blue-800">{selectedCrop.wateringSchedule}</p>
              </div>

              {/* Notes */}
              {selectedCrop.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">📝 Notes</p>
                  <p className="text-yellow-800">{selectedCrop.notes}</p>
                </div>
              )}

              {/* Consultant Actions */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                  <FileText className="w-5 h-5" />
                  Add Recommendation
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  <MessageSquare className="w-5 h-5" />
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerCropRecords;
