import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Heart, Activity, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LivestockManagement = () => {
  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    animalType: '',
    breed: '',
    tagNumber: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    healthStatus: 'healthy',
    lastCheckup: '',
    notes: ''
  });

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = () => {
    // Mock data - replace with API call
    const mockAnimals = [
      {
        id: 1,
        animalType: 'Cattle',
        breed: 'Holstein',
        tagNumber: 'C-001',
        dateOfBirth: '2022-05-15',
        gender: 'Female',
        weight: '450',
        healthStatus: 'healthy',
        lastCheckup: '2024-11-01',
        notes: 'High milk producer'
      },
      {
        id: 2,
        animalType: 'Chicken',
        breed: 'Rhode Island Red',
        tagNumber: 'CH-015',
        dateOfBirth: '2024-03-10',
        gender: 'Female',
        weight: '2.5',
        healthStatus: 'healthy',
        lastCheckup: '2024-10-20',
        notes: 'Good egg layer'
      },
      {
        id: 3,
        animalType: 'Goat',
        breed: 'Boer',
        tagNumber: 'G-008',
        dateOfBirth: '2023-08-22',
        gender: 'Male',
        weight: '65',
        healthStatus: 'under_observation',
        lastCheckup: '2024-11-15',
        notes: 'Minor infection, on medication'
      }
    ];
    setAnimals(mockAnimals);
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
    
    if (editingAnimal) {
      setAnimals(animals.map(animal => 
        animal.id === editingAnimal.id ? { ...formData, id: animal.id } : animal
      ));
      toast.success('Animal updated successfully!');
    } else {
      const newAnimal = {
        ...formData,
        id: Date.now()
      };
      setAnimals([...animals, newAnimal]);
      toast.success('Animal added successfully!');
    }
    
    resetForm();
  };

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
    setFormData(animal);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this animal record?')) {
      setAnimals(animals.filter(animal => animal.id !== id));
      toast.success('Animal deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      animalType: '',
      breed: '',
      tagNumber: '',
      dateOfBirth: '',
      gender: '',
      weight: '',
      healthStatus: 'healthy',
      lastCheckup: '',
      notes: ''
    });
    setEditingAnimal(null);
    setShowModal(false);
  };

  const getHealthStatusBadge = (status) => {
    const badges = {
      healthy: 'bg-green-100 text-green-800',
      sick: 'bg-red-100 text-red-800',
      under_observation: 'bg-yellow-100 text-yellow-800',
      recovering: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || badges.healthy;
  };

  const getHealthStatusIcon = (status) => {
    if (status === 'healthy') return <Heart className="w-5 h-5 text-green-600" />;
    if (status === 'sick') return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (status === 'under_observation') return <Activity className="w-5 h-5 text-yellow-600" />;
    return <Activity className="w-5 h-5 text-blue-600" />;
  };

  const filteredAnimals = animals.filter(animal =>
    animal.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Livestock Management</h1>
        <p className="text-gray-600">Manage your animals, health records, and breeding information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600">Total Animals</p>
          <p className="text-2xl font-bold text-gray-800">{animals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Healthy</p>
          <p className="text-2xl font-bold text-gray-800">
            {animals.filter(a => a.healthStatus === 'healthy').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Under Observation</p>
          <p className="text-2xl font-bold text-gray-800">
            {animals.filter(a => a.healthStatus === 'under_observation').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Sick</p>
          <p className="text-2xl font-bold text-gray-800">
            {animals.filter(a => a.healthStatus === 'sick').length}
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
              placeholder="Search animals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Animal
          </button>
        </div>
      </div>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <div key={animal.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold">{animal.animalType}</h3>
                <p className="text-orange-100">{animal.breed}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-700">#{animal.tagNumber}</span>
                <span className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 ${getHealthStatusBadge(animal.healthStatus)}`}>
                  {getHealthStatusIcon(animal.healthStatus)}
                  {animal.healthStatus.replace('_', ' ').charAt(0).toUpperCase() + animal.healthStatus.replace('_', ' ').slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">⚥ Gender:</span>
                  <span className="font-medium">{animal.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">⚖ Weight:</span>
                  <span className="font-medium">{animal.weight} kg</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Born:</span>
                  <span className="font-medium">{new Date(animal.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Last Checkup:</span>
                  <span className="font-medium">{new Date(animal.lastCheckup).toLocaleDateString()}</span>
                </div>
              </div>

              {animal.notes && (
                <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                  📝 {animal.notes}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(animal)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(animal.id)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No animals found</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Add Your First Animal
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
                  {editingAnimal ? 'Edit Animal' : 'Add New Animal'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Animal Type *</label>
                    <select
                      name="animalType"
                      value={formData.animalType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="Cattle">Cattle</option>
                      <option value="Goat">Goat</option>
                      <option value="Sheep">Sheep</option>
                      <option value="Chicken">Chicken</option>
                      <option value="Pig">Pig</option>
                      <option value="Horse">Horse</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Holstein"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag Number *</label>
                    <input
                      type="text"
                      name="tagNumber"
                      value={formData.tagNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., C-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="450"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Health Status *</label>
                    <select
                      name="healthStatus"
                      value={formData.healthStatus}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="healthy">Healthy</option>
                      <option value="sick">Sick</option>
                      <option value="under_observation">Under Observation</option>
                      <option value="recovering">Recovering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Checkup</label>
                    <input
                      type="date"
                      name="lastCheckup"
                      value={formData.lastCheckup}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    {editingAnimal ? 'Update Animal' : 'Add Animal'}
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

export default LivestockManagement;
