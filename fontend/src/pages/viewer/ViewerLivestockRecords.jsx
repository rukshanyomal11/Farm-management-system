import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beef,
  Search,
  Filter,
  Info,
  Eye,
  Heart,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';

const ViewerLivestockRecords = () => {
  const navigate = useNavigate();
  const [livestock, setLivestock] = useState([]);
  const [filteredLivestock, setFilteredLivestock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('accessToken');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    fetchLivestock();
  }, [navigate]);

  const fetchLivestock = () => {
    // Mock data
    const mockLivestock = [
      {
        id: 1,
        tagNumber: 'COW-001',
        type: 'Dairy Cattle',
        breed: 'Holstein',
        name: 'Bessie',
        age: '4 years',
        gender: 'Female',
        weight: '550 kg',
        healthStatus: 'excellent',
        location: 'Barn A - Stall 5',
        lastCheckup: '2025-11-20',
        nextCheckup: '2025-12-20',
        vaccinations: 'Up to date',
        feedingSchedule: '3 times daily - 7 AM, 1 PM, 7 PM',
        milkProduction: '28 liters/day',
        notes: 'High milk producer, maintain current diet',
        purchaseDate: '2021-06-15',
        purchasePrice: '$2,500'
      },
      {
        id: 2,
        tagNumber: 'COW-002',
        type: 'Dairy Cattle',
        breed: 'Jersey',
        name: 'Daisy',
        age: '3 years',
        gender: 'Female',
        weight: '450 kg',
        healthStatus: 'good',
        location: 'Barn A - Stall 8',
        lastCheckup: '2025-11-22',
        nextCheckup: '2025-12-22',
        vaccinations: 'Up to date',
        feedingSchedule: '3 times daily - 7 AM, 1 PM, 7 PM',
        milkProduction: '22 liters/day',
        notes: 'Regular health checks recommended',
        purchaseDate: '2022-03-10',
        purchasePrice: '$2,200'
      },
      {
        id: 3,
        tagNumber: 'CHK-101',
        type: 'Chickens',
        breed: 'Rhode Island Red',
        name: 'Flock A',
        age: '1.5 years',
        gender: 'Mixed',
        weight: '2.5 kg avg',
        healthStatus: 'excellent',
        location: 'Coop 1',
        lastCheckup: '2025-11-18',
        nextCheckup: '2025-12-18',
        vaccinations: 'Up to date',
        feedingSchedule: '2 times daily - 8 AM, 4 PM',
        eggProduction: '25 eggs/day (30 birds)',
        notes: 'Excellent egg layers, good health',
        purchaseDate: '2024-05-20',
        purchasePrice: '$450'
      },
      {
        id: 4,
        tagNumber: 'SHP-010',
        type: 'Sheep',
        breed: 'Merino',
        name: 'Woolly',
        age: '2 years',
        gender: 'Male',
        weight: '75 kg',
        healthStatus: 'good',
        location: 'Pasture B',
        lastCheckup: '2025-11-15',
        nextCheckup: '2025-12-15',
        vaccinations: 'Up to date',
        feedingSchedule: 'Free grazing + supplement at 5 PM',
        woolProduction: 'Sheared 3 months ago',
        notes: 'Ready for next shearing in 2 months',
        purchaseDate: '2023-08-12',
        purchasePrice: '$350'
      },
      {
        id: 5,
        tagNumber: 'COW-003',
        type: 'Dairy Cattle',
        breed: 'Guernsey',
        name: 'Rosie',
        age: '5 years',
        gender: 'Female',
        weight: '500 kg',
        healthStatus: 'fair',
        location: 'Barn B - Stall 2',
        lastCheckup: '2025-11-25',
        nextCheckup: '2025-11-30',
        vaccinations: 'Up to date',
        feedingSchedule: '3 times daily - 7 AM, 1 PM, 7 PM',
        milkProduction: '18 liters/day',
        notes: 'Monitor closely, slight decrease in production',
        purchaseDate: '2020-04-08',
        purchasePrice: '$2,800'
      }
    ];
    
    setLivestock(mockLivestock);
    setFilteredLivestock(mockLivestock);
  };

  useEffect(() => {
    let filtered = livestock;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(animal => animal.type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(animal => 
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLivestock(filtered);
  }, [livestock, searchTerm, filterType]);

  const handleViewDetails = (animal) => {
    setSelectedAnimal(animal);
    setShowDetailsModal(true);
  };

  const getHealthBadge = (health) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[health] || colors.good;
  };

  const getTypeIcon = (type) => {
    return '🐄'; // Default icon
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Livestock Records</h1>
        <p className="text-gray-600">Comprehensive view of all animal data and health records</p>
      </div>

      {/* Read-Only Notice */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-600 mt-0.5" />
          <div>
            <p className="font-medium text-cyan-900">Viewer Access - Read Only</p>
            <p className="text-sm text-cyan-700">You can view detailed livestock records and health data, but cannot edit or delete records.</p>
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
              placeholder="Search by tag number, name, or breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="Dairy Cattle">Dairy Cattle</option>
              <option value="Chickens">Chickens</option>
              <option value="Sheep">Sheep</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Animals</p>
          <p className="text-2xl font-bold text-gray-800">{livestock.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Dairy Cattle</p>
          <p className="text-2xl font-bold text-orange-600">
            {livestock.filter(a => a.type === 'Dairy Cattle').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Excellent Health</p>
          <p className="text-2xl font-bold text-green-600">
            {livestock.filter(a => a.healthStatus === 'excellent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Chickens</p>
          <p className="text-2xl font-bold text-yellow-600">
            {livestock.filter(a => a.type === 'Chickens').length}
          </p>
        </div>
      </div>

      {/* Livestock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLivestock.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Beef className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No livestock found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        ) : (
          filteredLivestock.map((animal) => (
            <div key={animal.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Beef className="w-6 h-6" />
                    <div>
                      <h3 className="text-xl font-bold">{animal.name}</h3>
                      <p className="text-orange-100 text-sm">{animal.tagNumber}</p>
                    </div>
                  </div>
                </div>
                <p className="text-orange-100 text-sm">{animal.breed} • {animal.type}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Health Status */}
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getHealthBadge(animal.healthStatus)}`}>
                    {animal.healthStatus.toUpperCase()} HEALTH
                  </span>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Age</p>
                    <p className="font-medium text-gray-800">{animal.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Weight</p>
                    <p className="font-medium text-gray-800">{animal.weight}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Gender</p>
                    <p className="font-medium text-gray-800">{animal.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium text-gray-800">{animal.location}</p>
                  </div>
                </div>

                {/* Production Info */}
                {animal.milkProduction && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-semibold mb-1">🥛 MILK PRODUCTION</p>
                    <p className="text-sm text-blue-900">{animal.milkProduction}</p>
                  </div>
                )}

                {animal.eggProduction && (
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-600 font-semibold mb-1">🥚 EGG PRODUCTION</p>
                    <p className="text-sm text-yellow-900">{animal.eggProduction}</p>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(animal)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Full Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                Livestock Details - {selectedAnimal.name} ({selectedAnimal.tagNumber})
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Health Status */}
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500" />
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getHealthBadge(selectedAnimal.healthStatus)}`}>
                  {selectedAnimal.healthStatus.toUpperCase()} HEALTH
                </span>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tag Number</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.tagNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Breed</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vaccinations</p>
                  <p className="font-medium text-gray-800">{selectedAnimal.vaccinations}</p>
                </div>
              </div>

              {/* Health Checkups */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Health Checkup Schedule
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-purple-700">Last Checkup</p>
                    <p className="font-medium text-purple-900">{new Date(selectedAnimal.lastCheckup).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Next Checkup</p>
                    <p className="font-medium text-purple-900">{new Date(selectedAnimal.nextCheckup).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Feeding Schedule */}
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900 mb-2">🌾 Feeding Schedule</p>
                <p className="text-green-800">{selectedAnimal.feedingSchedule}</p>
              </div>

              {/* Production Info */}
              {selectedAnimal.milkProduction && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">🥛 Milk Production</p>
                  <p className="text-blue-800">{selectedAnimal.milkProduction}</p>
                </div>
              )}

              {selectedAnimal.eggProduction && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">🥚 Egg Production</p>
                  <p className="text-yellow-800">{selectedAnimal.eggProduction}</p>
                </div>
              )}

              {/* Notes */}
              {selectedAnimal.notes && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-orange-900 mb-2">📝 Notes</p>
                  <p className="text-orange-800">{selectedAnimal.notes}</p>
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

export default ViewerLivestockRecords;
