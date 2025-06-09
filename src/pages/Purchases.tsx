import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wasteManagementAPI } from '../lib/api/endpoints/waste-management';
import { 
  ShoppingCart, 
  Plus, 
  Calendar, 
  DollarSign,
  Package,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, suppliersRes] = await Promise.all([
        wasteManagementAPI.getProducts(user?.tenantId),
        wasteManagementAPI.getSuppliers(user?.tenantId),
      ]);

      setProducts(productsRes.data.products || []);
      setSuppliers(suppliersRes.data.suppliers || []);
      
      // TODO: Load actual purchases when API is ready
      setPurchases([]);
    } catch (error) {
      console.error('Error loading purchase data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
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
          <p className="text-gray-600">Loading purchase data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Management</h1>
          <p className="text-gray-600 mt-1">
            Record purchases, manage suppliers, and track inventory
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Purchase</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="This Month"
          value="₨0.00"
          color="blue"
          icon={DollarSign}
          description="Total purchases"
        />
        <StatCard
          title="Total Orders"
          value="0"
          color="green"
          icon={ShoppingCart}
          description="Purchase orders"
        />
        <StatCard
          title="Suppliers"
          value={suppliers.length.toString()}
          color="purple"
          icon={Package}
          description="Active suppliers"
        />
        <StatCard
          title="Products"
          value={products.length.toString()}
          color="orange"
          icon={FileText}
          description="Available products"
        />
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Purchase Management Setup</h3>
        <p className="text-gray-600 mb-4">
          To start recording purchases, you'll need products and suppliers set up in Master Data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Products: {products.length}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {products.length === 0 ? 'Add products in Master Data' : 'Products configured'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Suppliers: {suppliers.length}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {suppliers.length === 0 ? 'Add suppliers in Master Data' : 'Suppliers configured'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Start Recording</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ready to record purchases
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Records */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Purchase Records</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search purchases..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button className="btn-secondary btn-sm flex items-center space-x-1">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Purchase Records Yet</h4>
            <p className="text-gray-500 mb-6">
              Start by recording your first purchase to track inventory and costs
            </p>
            <div className="space-y-3">
              {products.length === 0 ? (
                <p className="text-sm text-amber-600">
                  ⚠️ Add products in Master Data first
                </p>
              ) : suppliers.length === 0 ? (
                <p className="text-sm text-amber-600">
                  ⚠️ Add suppliers in Master Data first
                </p>
              ) : (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  Record First Purchase
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Purchase Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record Purchase</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">Purchase Form Coming Soon</h4>
              <p className="text-gray-500 mb-4">
                The purchase recording interface will be implemented next
              </p>
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;