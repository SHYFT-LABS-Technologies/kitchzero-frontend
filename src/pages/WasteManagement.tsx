import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wasteManagementAPI } from '../lib/api/endpoints/waste-management';
import {
  TrendingDown,
  AlertTriangle,
  Package,
  Clock,
  DollarSign,
  Plus,
  Eye,
  RefreshCw,
  Calendar,
  Filter,
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Clock4,
  ShoppingCart,
  Settings,
  Users,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import type { InventoryItem, ExpiringItem, WasteAnalytics } from '../types/waste';

const WasteManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('setup');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [wasteAnalytics, setWasteAnalytics] = useState<WasteAnalytics | null>(null);
  const [fifoRecommendations, setFifoRecommendations] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');

  // Data management states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'product' | 'supplier' | 'waste-category'>('product');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [wasteCategories, setWasteCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Date range for analytics (default to last 30 days)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [selectedBranch, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load master data first
      await loadMasterData();

      // Load operational data if branch is selected
      if (selectedBranch) {
        const [inventoryRes, expiringRes, analyticsRes, settingsRes] = await Promise.all([
          wasteManagementAPI.getInventoryStatus(selectedBranch),
          wasteManagementAPI.getExpiringItems(selectedBranch, 7),
          wasteManagementAPI.getWasteAnalytics(selectedBranch, dateRange.startDate, dateRange.endDate),
          wasteManagementAPI.getSystemSettings?.() || Promise.resolve({ data: { default_currency: 'LKR', currency_symbol: '₨' } }),
        ]);

        setInventory(inventoryRes.data.inventory);
        setExpiringItems(expiringRes.data.expiringItems);
        setWasteAnalytics(analyticsRes.data);
        setSystemSettings(settingsRes.data || { default_currency: 'LKR', currency_symbol: '₨' });

        // Load FIFO recommendations for perishable items
        if (inventoryRes.data.inventory.some((item: any) => item.hasExpiringItems)) {
          try {
            const fifoRes = await wasteManagementAPI.getFIFORecommendations?.(selectedBranch);
            setFifoRecommendations(fifoRes?.data || []);
          } catch (error) {
            console.log('FIFO recommendations not available');
            setFifoRecommendations([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading waste management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const [categoriesRes, productsRes, suppliersRes, wasteCategoriesRes, unitsRes] = await Promise.all([
        wasteManagementAPI.getCategories(user?.tenantId),
        wasteManagementAPI.getProducts(user?.tenantId),
        wasteManagementAPI.getSuppliers(user?.tenantId),
        wasteManagementAPI.getWasteCategories(user?.tenantId),
        wasteManagementAPI.getUnits(),
      ]);

      setCategories(categoriesRes.data.categories || []);
      setProducts(productsRes.data.products || []);
      setSuppliers(suppliersRes.data.suppliers || []);
      setWasteCategories(wasteCategoriesRes.data.wasteCategories || []);
      setUnits(unitsRes.data.units || []);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const currencySymbol = systemSettings.currency_symbol || '₨';
  const lowStockItems = inventory.filter(item => item.isLowStock);
  const itemsWithExpiringSoon = inventory.filter(item => item.hasExpiringItems);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    color?: string;
    trend?: string;
  }> = ({ title, value, change, changeType, icon: Icon, color = 'primary', trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        {change && (
          <div className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className="text-xs text-gray-500 mt-1">{trend}</p>
        )}
      </div>
    </div>
  );

  // Add Modal Component
  const AddModal: React.FC = () => {
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        switch (modalType) {
          case 'category':
            await wasteManagementAPI.createCategory(formData);
            break;
          case 'product':
            await wasteManagementAPI.createProduct(formData);
            break;
          case 'supplier':
            await wasteManagementAPI.createSupplier(formData);
            break;
          case 'waste-category':
            await wasteManagementAPI.createWasteCategory(formData);
            break;
        }

        setShowAddModal(false);
        setFormData({});
        loadMasterData(); // Reload master data
      } catch (error) {
        console.error('Error creating item:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const renderForm = () => {
      switch (modalType) {
        case 'category':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Vegetables, Spices, Dairy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Optional description for this category"
                />
              </div>
            </div>
          );

        case 'product':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Tomatoes, Rice, Chicken"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.unitId || ''}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumStock || ''}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Cost per Unit ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.averageCostPerUnit || ''}
                    onChange={(e) => setFormData({ ...formData, averageCostPerUnit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.perishable || false}
                    onChange={(e) => setFormData({ ...formData, perishable: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Perishable item</span>
                </label>
                {formData.perishable && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shelf Life (days)
                    </label>
                    <input
                      type="number"
                      value={formData.shelfLifeDays || ''}
                      onChange={(e) => setFormData({ ...formData, shelfLifeDays: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="7"
                    />
                  </div>
                )}
              </div>
            </div>
          );

        case 'supplier':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Fresh Vegetables Pvt Ltd"
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
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="077-1234567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Supplier address"
                />
              </div>
            </div>
          );

        case 'waste-category':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waste Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Spoiled, Preparation Waste, Expired"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Description of this waste category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex space-x-2">
                  {['#FF6B6B', '#FFA726', '#FF8A65', '#FFAB40', '#EF5350', '#FF7043', '#F4511E'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Add {modalType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {renderForm()}

            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Setup Tab Component
  const SetupTab = () => (
    <div className="space-y-6">
      {/* Getting Started Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Getting Started with Waste Management</h3>
        <p className="text-gray-600 mb-4">
          Set up your restaurant's waste management system by adding your specific data. No pre-loaded data -
          customize everything according to your needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-900">Add Categories</h4>
            <p className="text-sm text-gray-600">Organize your ingredients</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-900">Add Products</h4>
            <p className="text-sm text-gray-600">Your ingredients & items</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-900">Add Suppliers</h4>
            <p className="text-sm text-gray-600">Your vendor contacts</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <h4 className="font-medium text-gray-900">Start Tracking</h4>
            <p className="text-sm text-gray-600">Record purchases & waste</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Categories"
          value={categories.length}
          icon={Package}
          color="blue"
          trend={categories.length === 0 ? "Add your first category" : "Categories created"}
        />
        <StatCard
          title="Products"
          value={products.length}
          icon={ShoppingCart}
          color="green"
          trend={products.length === 0 ? "Add your products" : "Products in system"}
        />
        <StatCard
          title="Suppliers"
          value={suppliers.length}
          icon={Users}
          color="purple"
          trend={suppliers.length === 0 ? "Add your suppliers" : "Suppliers added"}
        />
        <StatCard
          title="Waste Categories"
          value={wasteCategories.length}
          icon={AlertTriangle}
          color="red"
          trend={wasteCategories.length === 0 ? "Define waste types" : "Waste types defined"}
        />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <button
              onClick={() => { setModalType('category'); setShowAddModal(true); }}
              className="btn-primary btn-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No categories yet</p>
                <button
                  onClick={() => { setModalType('category'); setShowAddModal(true); }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add your first category
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
            <button
              onClick={() => { setModalType('product'); setShowAddModal(true); }}
              className="btn-primary btn-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.categoryName} • {product.unitSymbol} •
                      {product.perishable ? ` ${product.shelfLifeDays}d shelf life` : ' Non-perishable'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {currencySymbol}{product.averageCostPerUnit}
                    </p>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-xs">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No products yet</p>
                <button
                  onClick={() => { setModalType('product'); setShowAddModal(true); }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add your first product
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Suppliers Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Suppliers</h3>
            <button
              onClick={() => { setModalType('supplier'); setShowAddModal(true); }}
              className="btn-primary btn-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-sm text-gray-600">
                      {supplier.contactPerson && `${supplier.contactPerson} • `}
                      {supplier.phone}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No suppliers yet</p>
                <button
                  onClick={() => { setModalType('supplier'); setShowAddModal(true); }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add your first supplier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Waste Categories Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Waste Categories</h3>
            <button
              onClick={() => { setModalType('waste-category'); setShowAddModal(true); }}
              className="btn-primary btn-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Type</span>
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {wasteCategories.length > 0 ? (
              wasteCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No waste categories yet</p>
                <button
                  onClick={() => { setModalType('waste-category'); setShowAddModal(true); }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add your first waste type
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard Tab Component
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={`Total Waste Cost (${currencySymbol})`}
          value={wasteAnalytics?.summary.totalWasteCost ?
            `${currencySymbol}${wasteAnalytics.summary.totalWasteCost.toLocaleString()}` : `${currencySymbol}0`}
          icon={DollarSign}
          color="red"
          trend="Last 30 days"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems.length}
          icon={Package}
          color="orange"
          trend={`${lowStockItems.length} items need restocking`}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringItems.length}
          icon={Clock}
          color="yellow"
          trend="Next 7 days"
        />
        <StatCard
          title="Products Wasted"
          value={wasteAnalytics?.summary.productsWasted || 0}
          icon={TrendingDown}
          color="red"
          trend="Unique items wasted"
        />
      </div>

      {/* FIFO Recommendations Section */}
      {fifoRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 text-blue-500 mr-2" />
              FIFO Recommendations (First In, First Out)
            </h3>
            <span className="text-sm text-blue-600 font-medium">Smart Inventory Usage</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {fifoRecommendations.slice(0, 4).map((recommendation, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-gray-900 mb-2">{recommendation.product_name}</h4>
                <div className="space-y-2">
                  {recommendation.batches.slice(0, 3).map((batch: any, batchIndex: number) => (
                    <div key={batchIndex} className={`flex items-center justify-between p-2 rounded text-sm ${batch.urgency_level === 'expired' ? 'bg-red-100 text-red-800' :
                        batch.urgency_level === 'use_today' ? 'bg-orange-100 text-orange-800' :
                          batch.urgency_level === 'use_soon' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                      }`}>
                      <div>
                        <span className="font-medium">Use Next: </span>
                        {batch.current_quantity} {recommendation.unit_symbol}
                        {batch.batch_number && <span className="text-xs ml-1">({batch.batch_number})</span>}
                      </div>
                      <div className="text-xs">
                        {batch.days_to_expiry > 0 ? `${batch.days_to_expiry}d left` : 'Expired'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Critical Stock Levels
            </h3>
            <span className="text-sm text-gray-500">{lowStockItems.length} items</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lowStockItems.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Available: {item.availableQuantity} {item.unitSymbol} |
                    Min: {item.minimumStock} {item.unitSymbol}
                  </p>
                  {item.categoryName && (
                    <p className="text-xs text-gray-500">{item.categoryName}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-orange-600 font-semibold text-lg">
                    {((item.availableQuantity / item.minimumStock) * 100).toFixed(0)}%
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Order Now
                  </button>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500">All items are well stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Expiring Items Alert */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock4 className="w-5 h-5 text-yellow-500 mr-2" />
              Expiring Soon
            </h3>
            <span className="text-sm text-gray-500">{expiringItems.length} items</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {expiringItems.slice(0, 8).map((item) => (
              <div key={item.stockId} className={`flex items-center justify-between p-3 rounded-lg border ${item.daysToExpiry <= 0 ? 'bg-red-50 border-red-200' :
                  item.daysToExpiry <= 1 ? 'bg-orange-50 border-orange-200' :
                    'bg-yellow-50 border-yellow-200'
                }`}>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    {item.currentQuantity} {item.unitSymbol}
                    {item.batchNumber && <span className="ml-1">• Batch: {item.batchNumber}</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${item.daysToExpiry <= 0 ? 'text-red-600' :
                      item.daysToExpiry <= 1 ? 'text-orange-600' :
                        'text-yellow-600'
                    }`}>
                    {item.daysToExpiry <= 0 ? 'EXPIRED' : `${item.daysToExpiry}d`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Loss: {currencySymbol}{item.estimatedLoss.toFixed(2)}
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Use Now
                  </button>
                </div>
              </div>
            ))}
            {expiringItems.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500">No items expiring soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Waste Analytics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 text-primary-500 mr-2" />
            Waste Analysis & Trends
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={loadData}
              className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {wasteAnalytics?.details.length ? (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {currencySymbol}{wasteAnalytics.summary.totalWasteCost?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-red-700">Total Cost</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {wasteAnalytics.summary.totalIncidents || 0}
                </div>
                <div className="text-sm text-orange-700">Waste Incidents</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {wasteAnalytics.summary.productsWasted || 0}
                </div>
                <div className="text-sm text-yellow-700">Products Affected</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {currencySymbol}{wasteAnalytics.summary.avgCostPerIncident?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-blue-700">Avg per Incident</div>
              </div>
            </div>

            {/* Top Waste Items */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 mb-3">Top Waste Items by Cost</h4>
              {wasteAnalytics.details.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-red-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.wasteStage} • {item.wasteCategory || 'General Waste'} •
                          {item.incidentCount} incidents
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {item.totalQuantity} {item.unitSymbol}
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {currencySymbol}{item.totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Waste Data</h4>
            <p className="text-gray-500 mb-4">No waste records found for the selected period</p>
            <p className="text-sm text-gray-400">Start recording waste to see analytics here</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
            <ShoppingCart className="w-5 h-5 text-primary-600 mr-2" />
            <span className="font-medium text-primary-700">Record Purchase</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-700">Record Waste</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading waste management data...</p>
        </div>
      </div>
    );
  }

  // Navigation tabs
  const navigationTabs = [
    { id: 'setup', name: 'Setup', icon: Settings },
    { id: 'dashboard', name: 'Dashboard', icon: TrendingDown },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'waste', name: 'Waste Records', icon: AlertTriangle },
    { id: 'analytics', name: 'Analytics', icon: Eye },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
          <p className="text-gray-600 mt-1">
            Track inventory, reduce waste, optimize costs • Restaurant Management System
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Currency: <span className="font-medium">{systemSettings.default_currency || 'LKR'}</span>
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Purchase</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Record Waste</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon
                className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'setup' && <SetupTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
            <p className="text-gray-600">Advanced inventory management interface coming soon...</p>
          </div>
        )}
        {activeTab === 'waste' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Waste Records</h3>
            <p className="text-gray-600">Detailed waste records interface coming soon...</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
            <p className="text-gray-600">Advanced analytics interface coming soon...</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddModal />
    </div>
  );
};

export default WasteManagement;