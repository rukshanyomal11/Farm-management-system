import { useState, useEffect } from 'react';
import { Search, Edit, Heart, Activity, Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerLivestockOperations = () => {
  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState('health'); // 'health' or 'production'
  const [formData, setFormData] = useState({
    healthStatus: 'healthy',
    lastCheckup: '',
    vaccination: '',
    treatment: '',
    productionType: '',
    quantity: '',
    productionDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = () => {
    const mockAnimals = [
      { id: 1, animalType: 'Cattle', breed: 'Holstein', tagNumber: 'C-001', healthStatus: 'healthy', lastCheckup: '2024-11-01', weight: '450' },
      { id: 2, animalType: 'Chicken', breed: 'Rhode Island Red', tagNumber: 'CH-015', healthStatus: 'healthy', lastCheckup: '2024-10-20', weight: '2.5' },
      { id: 3, animalType: 'Goat', breed: 'Boer', tagNumber: 'G-008', healthStatus: 'under_observation', lastCheckup: '2024-11-15', weight: '65' }
    ];
    setAnimals(mockAnimals);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'health') {
      setAnimals(animals.map(a => a.id === editingAnimal.id ? { ...a, healthStatus: formData.healthStatus, lastCheckup: formData.lastCheckup } : a));
      toast.success('Health record updated!');
    } else {
      toast.success('Production record added!');
    }
    resetForm();
  };

  const handleOpenModal = (animal, type) => {
    setEditingAnimal(animal);
    setModalType(type);
    setFormData({
      healthStatus: animal.healthStatus,
      lastCheckup: animal.lastCheckup,
      vaccination: '',
      treatment: '',
      productionType: '',
      quantity: '',
      productionDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ healthStatus: 'healthy', lastCheckup: '', vaccination: '', treatment: '', productionType: '', quantity: '', productionDate: '', notes: '' });
    setEditingAnimal(null);
    setShowModal(false);
  };

  const getHealthBadge = (status) => {
    const badges = {
      healthy: 'bg-green-100 text-green-800',
      sick: 'bg-red-100 text-red-800',
      under_observation: 'bg-yellow-100 text-yellow-800',
      recovering: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || badges.healthy;
  };

  const filteredAnimals = animals.filter(a =>
    a.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tagNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='p-4'>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Livestock Operations</h1>
        <p className="text-gray-600">Update health records, schedule care, and record production</p>
        <div className="mt-2 px-4 py-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <p className="text-sm text-yellow-800">📝 Manager Access: Can update health and production records (cannot delete animals)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600">Total Animals</p>
          <p className="text-2xl font-bold text-gray-800">{animals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Healthy</p>
          <p className="text-2xl font-bold text-gray-800">{animals.filter(a => a.healthStatus === 'healthy').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Under Observation</p>
          <p className="text-2xl font-bold text-gray-800">{animals.filter(a => a.healthStatus === 'under_observation').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Need Attention</p>
          <p className="text-2xl font-bold text-gray-800">{animals.filter(a => a.healthStatus === 'sick').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search animals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

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
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getHealthBadge(animal.healthStatus)}`}>
                  {animal.healthStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">⚖ Weight:</span>
                  <span className="font-medium">{animal.weight} kg</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Last Checkup:</span>
                  <span className="font-medium">{new Date(animal.lastCheckup).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(animal, 'health')}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Heart className="w-4 h-4" />
                  Health
                </button>
                <button
                  onClick={() => handleOpenModal(animal, 'production')}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Production
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalType === 'health' ? 'Update Health Record' : 'Record Production'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-orange-50 rounded-lg mb-4">
                  <p className="text-sm font-medium text-orange-800">Animal: {editingAnimal.animalType} - #{editingAnimal.tagNumber}</p>
                </div>

                {modalType === 'health' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Health Status *</label>
                      <select name="healthStatus" value={formData.healthStatus} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        <option value="healthy">Healthy</option>
                        <option value="sick">Sick</option>
                        <option value="under_observation">Under Observation</option>
                        <option value="recovering">Recovering</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Checkup Date *</label>
                      <input type="date" name="lastCheckup" value={formData.lastCheckup} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination</label>
                      <input type="text" name="vaccination" value={formData.vaccination} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Rabies vaccine" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Treatment/Medicine</label>
                      <input type="text" name="treatment" value={formData.treatment} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Antibiotic prescribed" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Production Type *</label>
                      <select name="productionType" value={formData.productionType} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        <option value="">Select Type</option>
                        <option value="milk">Milk</option>
                        <option value="eggs">Eggs</option>
                        <option value="wool">Wool</option>
                        <option value="meat">Meat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input type="number" step="0.1" name="quantity" value={formData.quantity} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., 15.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Production Date *</label>
                      <input type="date" name="productionDate" value={formData.productionDate} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Additional notes..." />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                    {modalType === 'health' ? 'Update Health Record' : 'Record Production'}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
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

export default ManagerLivestockOperations;
