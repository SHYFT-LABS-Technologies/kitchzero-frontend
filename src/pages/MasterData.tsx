import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wasteManagementAPI } from '../lib/api/endpoints/waste-management';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Users, 
  AlertTriangle,
  Ruler,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

const MasterData: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [categories, setCategories] = useState<any[]>([]);
  const [wasteCategories, setWasteCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [categoriesRes, wasteCategoriesRes, unitsRes, suppliersRes, settingsRes] = await Promise.all([
        wasteManagementAPI.getCategories(user?.tenantId),
        wasteManagementAPI.getWasteCategories(user?.tenantId),
        wasteManagementAPI.getUnits(),
        wasteManagementAPI.getSuppliers(user?.tenantId),
        wasteManagementAPI.getSystemSettings?.() || Promise.resolve({ data: {} })
      ]);

      setCategories(categoriesRes.data.categories || []);
      setWasteCategories(wasteCategoriesRes.data.wasteCategories || []);
      setUnits(unitsRes.data.units || []);
      setSuppliers(suppliersRes.data.suppliers || []);
      setSystemSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type: string) => {
    setModalMode('add');
    setEditingItem(null);
    setFormData({});
    setActiveTab(type);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (type: string, itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (type) {
        case 'categories':
          await wasteManagementAPI.deleteCategory(itemId);
          break;
        case 'waste-categories':
          await wasteManagementAPI.deleteWasteCategory(itemId);
          break;
        case 'suppliers':
          await wasteManagementAPI.deleteSupplier(itemId);
          break;
      }
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalMode === 'add') {
        switch (activeTab) {
          case 'categories':
            await wasteManagementAPI.createCategory(formData);
            break;
          case 'waste-categories':
            await wasteManagementAPI.createWasteCategory(formData);
            break;
          case 'suppliers':
            await wasteManagementAPI.createSupplier(formData);
            break;
        }
      } else {
        switch (activeTab) {
          case 'categories':
            await wasteManagementAPI.updateCategory(editingItem.id, formData);
            break;
          case 'waste-categories':
            await wasteManagementAPI.updateWasteCategory(editingItem.id, formData);
            break;
          case 'suppliers':
            await wasteManagementAPI.updateSupplier(editingItem.id, formData);
            break;
        }
      }

      setShowModal(false);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSystemSettings = async (newSettings: any) => {
    try {
      const response = await wasteManagementAPI.updateSystemSettings?.(newSettings);
      if (response) {
        setSystemSettings({ ...systemSettings, ...newSettings });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'categories', name: 'Product Categories', icon: Package, data: categories },
    { id: 'waste-categories', name: 'Waste Categories', icon: AlertTriangle, data: wasteCategories },
    { id: 'units', name: 'Units of Measurement', icon: Ruler, data: units },
    { id: 'suppliers', name: 'Suppliers', icon: Users, data: suppliers },
    { id: 'settings', name: 'System Settings', icon: Settings, data: [] },
  ];

  const renderFormFields = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Vegetables, Meat & Poultry, Spices"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Optional description for this category"
              />
            </div>
          </>
        );

      case 'waste-categories':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waste Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Spoiled/Expired, Preparation Waste, Over-preparation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Description of this waste category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Tag
              </label>
              <div className="flex space-x-2">
                {['#FF6B6B', '#FFA726', '#FF8A65', '#FFAB40', '#EF5350', '#FF7043', '#F4511E', '#9C27B0', '#3F51B5', '#009688'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({...formData, color})}
                    className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </>
        );

      case 'suppliers':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Fresh Market Suppliers Ltd"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson || ''}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="077-1234567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="supplier@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Complete supplier address"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (!currentTab) return null;

    if (activeTab === 'settings') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={systemSettings.default_currency || 'LKR'}
                  onChange={(e) => updateSystemSettings({ default_currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="LKR">Sri Lankan Rupee (LKR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Alert Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={systemSettings.inventory_low_stock_threshold || 10}
                  onChange={(e) => updateSystemSettings({ inventory_low_stock_threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Alert Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={systemSettings.waste_alert_threshold || 5}
                  onChange={(e) => updateSystemSettings({ waste_alert_threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemSettings.fifo_enforcement !== false}
                    onChange={(e) => updateSystemSettings({ fifo_enforcement: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enforce FIFO (First In, First Out)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'units') {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Units of Measurement</h3>
            <span className="text-sm text-gray-500">System Defined</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => (
              <div key={unit.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{unit.name}</h4>
                    <p className="text-sm text-gray-600">Symbol: {unit.symbol}</p>
                    <p className="text-xs text-gray-500 capitalize">Type: {unit.type}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    System
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{currentTab.name}</h3>
          <button
            onClick={() => handleAdd(activeTab)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add {currentTab.name.slice(0, -1)}</span>
          </button>
        </div>

        {currentTab.data.length > 0 ? (
          <div className="space-y-3">
            {currentTab.data.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {activeTab === 'waste-categories' && (
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color || '#FF6B6B' }}
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                      {activeTab === 'suppliers' && (
                        <div className="text-sm text-gray-500">
                          {item.contactPerson && <span>{item.contactPerson} • </span>}
                          {item.phone && <span>{item.phone} • </span>}
                          {item.email && <span>{item.email}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(activeTab, item.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <currentTab.icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No {currentTab.name} Yet</h4>
            <p className="text-gray-500 mb-4">Start by adding your first {currentTab.name.toLowerCase()}</p>
            <button
              onClick={() => handleAdd(activeTab)}
              className="btn-primary"
            >
              Add {currentTab.name.slice(0, -1)}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading master data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data Management</h1>
          <p className="text-gray-600 mt-1">
            Manage categories, units, suppliers, and system settings
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tabs.slice(0, 4).map((tab) => (
          <div key={tab.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                <tab.icon className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{tab.data.length}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{tab.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {tab.data.length === 0 ? 'No items yet' : `${tab.data.length} items configured`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === tab.id
                 ? 'border-primary-500 text-primary-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             <tab.icon
               className={`mr-2 h-5 w-5 ${
                 activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
               }`}
             />
             {tab.name}
             {tab.data.length > 0 && (
               <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full">
                 {tab.data.length}
               </span>
             )}
           </button>
         ))}
       </nav>
     </div>

     {/* Tab Content */}
     <div className="mt-6">
       {renderTabContent()}
     </div>

     {/* Modal */}
     {showModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-gray-900">
               {modalMode === 'add' ? 'Add' : 'Edit'} {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
             </h3>
             <button
               onClick={() => setShowModal(false)}
               className="text-gray-400 hover:text-gray-600"
             >
               <X className="w-6 h-6" />
             </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             {renderFormFields()}

             <div className="flex space-x-3 mt-6">
               <button
                 type="button"
                 onClick={() => setShowModal(false)}
                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
               >
                 {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Update'}
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
   </div>
 );
};

export default MasterData;