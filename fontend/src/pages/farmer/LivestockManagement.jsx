import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Heart, Activity, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth, checkTokenAndRedirect } from '../../utils/authHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LivestockManagement = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
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

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      if (checkTokenAndRedirect()) return;

      console.log('Fetching livestock...');

      const response = await fetchWithAuth(`${API_URL}/livestock`);

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.status === 'success') {
        // Transform backend data to frontend format
        const transformedAnimals = data.data.livestock.map(animal => ({
          id: animal.id,
          animalType: animal.type, // Keep lowercase for form
          breed: animal.breed || '',
          tagNumber: animal.tag_number,
          dateOfBirth: animal.birth_date ? animal.birth_date.split('T')[0] : '',
          gender: animal.gender, // Keep lowercase for form
          weight: animal.weight?.toString() || '',
          healthStatus: animal.status,
          lastCheckup: animal.updated_at?.split('T')[0] || '',
          notes: animal.notes || ''
        }));
        console.log('Transformed animals:', transformedAnimals);
        setAnimals(transformedAnimals);
      } else {
        console.error('Failed to fetch livestock:', data);
        if (response.status === 404) {
          // No farm found - show helpful message
          toast.error(data.message || 'No farm found. Please contact support.');
        } else if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.error(data.message || 'Failed to fetch livestock');
        }
      }
    } catch (error) {
      console.error('Fetch livestock error:', error);
      toast.error('Failed to connect to server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to manage livestock');
        return;
      }

      // Validate required fields
      if (!formData.tagNumber || !formData.animalType || !formData.gender || !formData.dateOfBirth) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Transform frontend data to backend format
      const payload = {
        tagNumber: formData.tagNumber.trim(),
        name: formData.tagNumber.trim(), // Using tag number as name if no name field
        type: formData.animalType.toLowerCase(),
        breed: formData.breed?.trim() || null,
        gender: formData.gender.toLowerCase(),
        birthDate: formData.dateOfBirth,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        status: formData.healthStatus || 'healthy',
        notes: formData.notes?.trim() || null
      };

      console.log('Submitting payload:', payload);

      if (editingAnimal) {
        // Update existing animal
        const response = await fetch(`${API_URL}/livestock/${editingAnimal.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Update response:', data);

        if (response.ok && data.status === 'success') {
          toast.success('Animal updated successfully!');
          await fetchAnimals();
          resetForm();
        } else {
          console.error('Failed to update animal:', data);
          if (response.status === 401) {
            toast.error('Session expired. Please login again.');
            setTimeout(() => navigate('/login'), 2000);
          } else if (data.field === 'tagNumber') {
            toast.error('Tag number already exists. Please use a different tag number.');
          } else {
            toast.error(data.message || 'Failed to update animal');
          }
        }
      } else {
        // Create new animal
        const response = await fetch(`${API_URL}/livestock`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Create response:', data);

        if (response.ok && data.status === 'success') {
          toast.success('Animal added successfully!');
          await fetchAnimals();
          resetForm();
        } else {
          console.error('Failed to add animal:', data);
          if (response.status === 401) {
            toast.error('Session expired. Please login again.');
            setTimeout(() => navigate('/login'), 2000);
          } else if (data.field === 'tagNumber') {
            toast.error('Tag number already exists. Please use a different tag number.');
          } else {
            toast.error(data.message || 'Failed to add animal');
          }
        }
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
    // Map the animal data to form data structure
    setFormData({
      animalType: animal.animalType,
      breed: animal.breed || '',
      tagNumber: animal.tagNumber,
      dateOfBirth: animal.dateOfBirth || '',
      gender: animal.gender,
      weight: animal.weight || '',
      healthStatus: animal.healthStatus,
      lastCheckup: animal.lastCheckup || '',
      notes: animal.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this animal record?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to manage livestock');
        return;
      }

      const response = await fetch(`${API_URL}/livestock/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        toast.success('Animal deleted successfully!');
        await fetchAnimals();
      } else {
        toast.error(data.message || 'Failed to delete animal');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
      {loading && animals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Loading animals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
          <div key={animal.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold capitalize">{animal.animalType}</h3>
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
                  <span className="font-medium capitalize">{animal.gender}</span>
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
      )}

      {!loading && filteredAnimals.length === 0 && (
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
                      <option value="cattle">Cattle</option>
                      <option value="goat">Goat</option>
                      <option value="sheep">Sheep</option>
                      <option value="poultry">Poultry</option>
                      <option value="pig">Pig</option>
                      <option value="other">Other</option>
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
                      <option value="male">Male</option>
                      <option value="female">Female</option>
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
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : (editingAnimal ? 'Update Animal' : 'Add Animal')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
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
