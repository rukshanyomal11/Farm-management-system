import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, TrendingUp, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const CropManagement = () => {
  const [crops, setCrops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cropName: '',
    cropType: '',
    variety: '',
    fieldLocation: '',
    areaSize: '',
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'planted',
    notes: ''
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = () => {
    // Mock data - replace with API call
    const mockCrops = [
      {
        id: 1,
        cropName: 'Wheat',
        cropType: 'Grain',
        variety: 'Spring Wheat',
        fieldLocation: 'North Field',
        areaSize: '50',
        plantingDate: '2024-03-15',
        expectedHarvestDate: '2024-07-15',
        status: 'growing',
        notes: 'Irrigation scheduled twice weekly'
      },
      {
        id: 2,
        cropName: 'Tomatoes',
        cropType: 'Vegetable',
        variety: 'Roma',
        fieldLocation: 'Greenhouse 1',
        areaSize: '10',
        plantingDate: '2024-04-01',
        expectedHarvestDate: '2024-06-15',
        status: 'harvesting',
        notes: 'Ready for harvest'
      },
      {
        id: 3,
        cropName: 'Corn',
        cropType: 'Grain',
        variety: 'Sweet Corn',
        fieldLocation: 'East Field',
        areaSize: '75',
        plantingDate: '2024-04-10',
        expectedHarvestDate: '2024-08-20',
        status: 'planted',
        notes: 'Recently fertilized'
      }
    ];
    setCrops(mockCrops);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCrop) {
      // Update existing crop
      setCrops(crops.map(crop => 
        crop.id === editingCrop.id ? { ...formData, id: crop.id } : crop
      ));
      toast.success('Crop updated successfully!');
    } else {
      // Add new crop
      const newCrop = {
        ...formData,
        id: Date.now()
      };
      setCrops([...crops, newCrop]);
      toast.success('Crop added successfully!');
    }
    
    resetForm();
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData(crop);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this crop?')) {
      setCrops(crops.filter(crop => crop.id !== id));
      toast.success('Crop deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      cropName: '',
      cropType: '',
      variety: '',
      fieldLocation: '',
      areaSize: '',
      plantingDate: '',
      expectedHarvestDate: '',
      status: 'planted',
      notes: ''
    });
    setEditingCrop(null);
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      planted: 'bg-blue-100 text-blue-800',
      growing: 'bg-green-100 text-green-800',
      harvesting: 'bg-yellow-100 text-yellow-800',
      harvested: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.planted;
  };

  const filteredCrops = crops.filter(crop =>
    crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.fieldLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Management</h1>
        <p className="text-gray-600">Manage your crops, planting schedules, and harvests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Crops</p>
          <p className="text-2xl font-bold text-gray-800">{crops.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Growing</p>
          <p className="text-2xl font-bold text-gray-800">
            {crops.filter(c => c.status === 'growing').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Ready to Harvest</p>
          <p className="text-2xl font-bold text-gray-800">
            {crops.filter(c => c.status === 'harvesting').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Total Area</p>
          <p className="text-2xl font-bold text-gray-800">
            {crops.reduce((sum, crop) => sum + parseFloat(crop.areaSize || 0), 0)} acres
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Crop
          </button>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <div key={crop.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold">{crop.cropName}</h3>
                <p className="text-green-100">{crop.variety}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Type: {crop.cropType}</span>
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusBadge(crop.status)}`}>
                  {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">📍 Location:</span>
                  <span className="font-medium">{crop.fieldLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">📏 Area:</span>
                  <span className="font-medium">{crop.areaSize} acres</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Planted:</span>
                  <span className="font-medium">{new Date(crop.plantingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Harvest:</span>
                  <span className="font-medium">{new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>
                </div>
              </div>

              {crop.notes && (
                <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                  📝 {crop.notes}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(crop)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(crop.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No crops found</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Your First Crop
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name *</label>
                    <input
                      type="text"
                      name="cropName"
                      value={formData.cropName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Wheat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type *</label>
                    <select
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="Grain">Grain</option>
                      <option value="Vegetable">Vegetable</option>
                      <option value="Fruit">Fruit</option>
                      <option value="Legume">Legume</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variety</label>
                    <input
                      type="text"
                      name="variety"
                      value={formData.variety}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Spring Wheat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Location *</label>
                    <input
                      type="text"
                      name="fieldLocation"
                      value={formData.fieldLocation}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., North Field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area Size (acres) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="areaSize"
                      value={formData.areaSize}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="planted">Planted</option>
                      <option value="growing">Growing</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="harvested">Harvested</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Planting Date *</label>
                    <input
                      type="date"
                      name="plantingDate"
                      value={formData.plantingDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Harvest Date *</label>
                    <input
                      type="date"
                      name="expectedHarvestDate"
                      value={formData.expectedHarvestDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {editingCrop ? 'Update Crop' : 'Add Crop'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
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

export default CropManagement;
