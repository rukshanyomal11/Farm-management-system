import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Calendar, Activity, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerCropOperations = () => {
  const [crops, setCrops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cropName: '',
    fieldLocation: '',
    healthStatus: 'good',
    lastInspection: '',
    notes: ''
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = () => {
    // Mock data
    const mockCrops = [
      { id: 1, cropName: 'Wheat', fieldLocation: 'North Field', areaSize: '50', status: 'growing', healthStatus: 'good', lastInspection: '2024-11-20' },
      { id: 2, cropName: 'Tomatoes', fieldLocation: 'Greenhouse 1', areaSize: '10', status: 'harvesting', healthStatus: 'excellent', lastInspection: '2024-11-22' },
      { id: 3, cropName: 'Corn', fieldLocation: 'East Field', areaSize: '75', status: 'planted', healthStatus: 'good', lastInspection: '2024-11-18' }
    ];
    setCrops(mockCrops);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCrop) {
      setCrops(crops.map(crop => crop.id === editingCrop.id ? { ...crop, ...formData } : crop));
      toast.success('Crop observation recorded!');
    }
    resetForm();
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      cropName: crop.cropName,
      fieldLocation: crop.fieldLocation,
      healthStatus: crop.healthStatus,
      lastInspection: crop.lastInspection,
      notes: crop.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ cropName: '', fieldLocation: '', healthStatus: 'good', lastInspection: '', notes: '' });
    setEditingCrop(null);
    setShowModal(false);
  };

  const getHealthBadge = (status) => {
    const badges = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.good;
  };

  const filteredCrops = crops.filter(crop =>
    crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.fieldLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Operations</h1>
        <p className="text-gray-600">Update crop health, schedule activities, and record observations</p>
        <div className="mt-2 px-4 py-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <p className="text-sm text-yellow-800">📝 Manager Access: Can view and update crop records (cannot delete)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Total Crops</p>
          <p className="text-2xl font-bold text-gray-800">{crops.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Excellent Health</p>
          <p className="text-2xl font-bold text-gray-800">{crops.filter(c => c.healthStatus === 'excellent').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Need Attention</p>
          <p className="text-2xl font-bold text-gray-800">{crops.filter(c => c.healthStatus === 'fair' || c.healthStatus === 'poor').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Ready to Harvest</p>
          <p className="text-2xl font-bold text-gray-800">{crops.filter(c => c.status === 'harvesting').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <div key={crop.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold">{crop.cropName}</h3>
                <p className="text-green-100">{crop.fieldLocation}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Area: {crop.areaSize} acres</span>
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getHealthBadge(crop.healthStatus)}`}>
                  {crop.healthStatus.toUpperCase()}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{crop.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Last Inspection:</span>
                  <span className="font-medium">{new Date(crop.lastInspection).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(crop)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Update Record
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Update Crop Record</h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name</label>
                  <input type="text" name="cropName" value={formData.cropName} onChange={handleInputChange} disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Location</label>
                  <input type="text" name="fieldLocation" value={formData.fieldLocation} onChange={handleInputChange} disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Health Status *</label>
                  <select name="healthStatus" value={formData.healthStatus} onChange={handleInputChange} required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Inspection Date *</label>
                  <input type="date" name="lastInspection" value={formData.lastInspection} onChange={handleInputChange} required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observation Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Record your observations..."/>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Update Record
                  </button>
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCropOperations;