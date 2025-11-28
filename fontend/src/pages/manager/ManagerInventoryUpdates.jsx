import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, TrendingUp, Plus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerInventoryUpdates = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('usage'); // 'usage' or 'request'
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    usageQuantity: '',
    usageReason: '',
    requestQuantity: '',
    requestReason: '',
    urgency: 'normal'
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    const mockItems = [
      { id: 1, itemName: 'Fertilizer - NPK 15-15-15', category: 'Fertilizer', quantity: '150', unit: 'kg', minThreshold: '50', location: 'Storage Room A' },
      { id: 2, itemName: 'Seeds - Wheat', category: 'Seeds', quantity: '25', unit: 'kg', minThreshold: '20', location: 'Seed Vault' },
      { id: 3, itemName: 'Pesticide - Organic Spray', category: 'Pesticide', quantity: '8', unit: 'liters', minThreshold: '10', location: 'Chemical Storage' },
      { id: 4, itemName: 'Animal Feed - Poultry', category: 'Animal Feed', quantity: '500', unit: 'kg', minThreshold: '100', location: 'Feed Storage' }
    ];
    setItems(mockItems);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'usage') {
      const updatedQuantity = parseFloat(selectedItem.quantity) - parseFloat(formData.usageQuantity);
      setItems(items.map(item => item.id === selectedItem.id ? { ...item, quantity: updatedQuantity.toString() } : item));
      toast.success('Inventory usage recorded!');
    } else {
      toast.success('Purchase request submitted!');
    }
    resetForm();
  };

  const handleOpenModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setFormData({ usageQuantity: '', usageReason: '', requestQuantity: '', requestReason: '', urgency: 'normal' });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ usageQuantity: '', usageReason: '', requestQuantity: '', requestReason: '', urgency: 'normal' });
    setSelectedItem(null);
    setShowModal(false);
  };

  const isLowStock = (item) => parseFloat(item.quantity) <= parseFloat(item.minThreshold);

  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(isLowStock);

  return (
    <div >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory Updates</h1>
        <p className="text-gray-600">Record usage, request purchases, and update stock levels</p>
        <div className="mt-2 px-4 py-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <p className="text-sm text-yellow-800">📝 Manager Access: Can record usage and request purchases (cannot delete items)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{items.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-800">{lowStockItems.length}</p>
            </div>
            {lowStockItems.length > 0 && <AlertTriangle className="w-6 h-6 text-red-500" />}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Well Stocked</p>
          <p className="text-2xl font-bold text-gray-800">{items.length - lowStockItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-gray-800">{[...new Set(items.map(i => i.category))].length}</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} below minimum threshold</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className={isLowStock(item) ? 'bg-red-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                    <div className="text-xs text-gray-500">Min: {item.minThreshold} {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLowStock(item) ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                        <TrendingUp className="w-3 h-3" />In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(item, 'usage')}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs">
                        Record Usage
                      </button>
                      <button
                        onClick={() => handleOpenModal(item, 'request')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs">
                        Request Purchase
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalType === 'usage' ? 'Record Inventory Usage' : 'Request Purchase'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-lg mb-4">
                  <p className="text-sm font-medium text-purple-800">Item: {selectedItem.itemName}</p>
                  <p className="text-xs text-purple-600">Current Stock: {selectedItem.quantity} {selectedItem.unit}</p>
                </div>

                {modalType === 'usage' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usage Quantity *</label>
                      <input type="number" step="0.1" name="usageQuantity" value={formData.usageQuantity} onChange={handleInputChange}
                        required max={selectedItem.quantity}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={`Max: ${selectedItem.quantity}`} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usage Reason *</label>
                      <select name="usageReason" value={formData.usageReason} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Reason</option>
                        <option value="crop_fertilization">Crop Fertilization</option>
                        <option value="livestock_feeding">Livestock Feeding</option>
                        <option value="pest_control">Pest Control</option>
                        <option value="equipment_maintenance">Equipment Maintenance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Request Quantity *</label>
                      <input type="number" step="0.1" name="requestQuantity" value={formData.requestQuantity} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter quantity" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Urgency *</label>
                      <select name="urgency" value={formData.urgency} onChange={handleInputChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Request Reason *</label>
                      <textarea name="requestReason" value={formData.requestReason} onChange={handleInputChange} required rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Explain why this purchase is needed..." />
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    {modalType === 'usage' ? 'Record Usage' : 'Submit Request'}
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

export default ManagerInventoryUpdates;
