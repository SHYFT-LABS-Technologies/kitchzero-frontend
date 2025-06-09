import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wasteManagementAPI } from '../lib/api/endpoints/waste-management';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [fifoRecommendations, setFifoRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (selectedBranch) {
      loadInventoryData();
    }
  }, [selectedBranch]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      const [inventoryRes, categoriesRes] = await Promise.all([
        wasteManagementAPI.getInventoryStatus(selectedBranch),
        wasteManagementAPI.getCategories(user?.tenantId),
      ]);

      setInventory(inventoryRes.data.inventory || []);
      setCategories(categoriesRes.data.categories || []);

      // Load FIFO recommendations if there are perishable items
      try {
        const fifoRes = await wasteManagementAPI.getFIFORecommendations?.(selectedBranch);
        setFifoRecommendations(fifoRes?.data || []);
      } catch (error) {
        console.log('FIFO recommendations not available');
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => item.isLowStock);
  const expiringItems = inventory.filter(item => item.hasExpiringItems);

  const StatCard: React.FC<{
    title: string;
    value: number;
    color: string;
    icon: React.ElementType;
    description?: string;
  }> = ({ title, value, color, icon: Icon, description }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor stock levels, track expiry dates, and optimize inventory
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={loadInventoryData}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={inventory.length}
          color="blue"
          icon={Package}
          description="Items in inventory"
        />
        <StatCard
          title="Low Stock"
          value={lowStockItems.length}
          color="orange"
          icon={AlertTriangle}
          description="Items below minimum"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringItems.length}
          color="red"
          icon={Clock}
          description="Within 7 days"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          color="green"
          icon={TrendingUp}
          description="Product categories"
        />
      </div>

      {/* FIFO Recommendations */}
      {fifoRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 text-blue-500 mr-2" />
              FIFO Usage Recommendations
            </h3>
            <span className="text-sm text-blue-600 font-medium">First In, First Out</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {fifoRecommendations.slice(0, 6).map((recommendation, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-gray-900 mb-2">{recommendation.product_name}</h4>
                <div className="space-y-2">
                  {recommendation.batches.slice(0, 2).map((batch: any, batchIndex: number) => (
                    <div key={batchIndex} className={`flex items-center justify-between p-2 rounded text-sm ${
                      batch.urgency_level === 'expired' ? 'bg-red-100 text-red-800' :
                      batch.urgency_level === 'use_today' ? 'bg-orange-100 text-orange-800' :
                      batch.urgency_level === 'use_soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      <span>{batch.current_quantity} {recommendation.unit_symbol}</span>
                      <span className="text-xs">
                        {batch.days_to_expiry <= 0 ? 'Expired' : `${batch.days_to_expiry}d left`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
          <p className="text-sm text-gray-600">
            {filteredInventory.length} of {inventory.length} items
          </p>
        </div>
        
        {filteredInventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Min Stock: {item.minimumStock} {item.unitSymbol}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.availableQuantity} {item.unitSymbol}
                      </div>
                      <div className="text-sm text-gray-500">
                        Reserved: {item.reservedQuantity} {item.unitSymbol}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {item.isLowStock && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Low Stock
                          </span>
                        )}
                        {item.hasExpiringItems && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Expiring Soon
                          </span>
                        )}
                        {!item.isLowStock && !item.hasExpiringItems && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Good
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                        <button className="text-green-600 hover:text-green-900">Add Stock</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Inventory Items</h4>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory ? 'No items match your search criteria' : 'Start by adding products and recording purchases'}
            </p>
            {!searchTerm && !filterCategory && (
              <button className="btn-primary">
                Add First Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;