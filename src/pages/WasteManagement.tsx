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
  Filter
} from 'lucide-react';
import type { InventoryItem, ExpiringItem, WasteAnalytics } from '../types/waste';

const WasteManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [wasteAnalytics, setWasteAnalytics] = useState<WasteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');

  // Date range for analytics (default to last 30 days)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (selectedBranch) {
      loadData();
    }
  }, [selectedBranch, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [inventoryRes, expiringRes, analyticsRes] = await Promise.all([
        wasteManagementAPI.getInventoryStatus(selectedBranch),
        wasteManagementAPI.getExpiringItems(selectedBranch, 7),
        wasteManagementAPI.getWasteAnalytics(selectedBranch, dateRange.startDate, dateRange.endDate),
      ]);

      setInventory(inventoryRes.data.inventory);
      setExpiringItems(expiringRes.data.expiringItems);
      setWasteAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error loading waste management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter(item => item.isLowStock);
  const itemsWithExpiringSoon = inventory.filter(item => item.hasExpiringItems);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    color?: string;
  }> = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        {change && (
          <div className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Waste Cost (LKR)"
          value={wasteAnalytics?.summary.totalWasteCost ? 
            `₨${wasteAnalytics.summary.totalWasteCost.toLocaleString()}` : '₨0'}
          icon={DollarSign}
          color="red"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems.length}
          icon={Package}
          color="orange"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringItems.length}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Products Wasted"
          value={wasteAnalytics?.summary.productsWasted || 0}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Low Stock Alerts
            </h3>
            <span className="text-sm text-gray-500">{lowStockItems.length} items</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Current: {item.availableQuantity} {item.unitSymbol} | 
                    Min: {item.minimumStock} {item.unitSymbol}
                  </p>
                </div>
                <div className="text-orange-600 font-semibold">
                  {((item.availableQuantity / item.minimumStock) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No low stock items</p>
            )}
          </div>
        </div>

        {/* Expiring Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              Expiring Soon
            </h3>
            <span className="text-sm text-gray-500">{expiringItems.length} items</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {expiringItems.slice(0, 5).map((item) => (
              <div key={item.stockId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    {item.currentQuantity} {item.unitSymbol} | 
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-yellow-600 font-semibold">
                    {item.daysToExpiry} days
                  </div>
                  <div className="text-xs text-gray-500">
                    ₨{item.estimatedLoss.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {expiringItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No items expiring soon</p>
            )}
          </div>
        </div>
      </div>

      {/* Waste Analytics Chart Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Waste Trends</h3>
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
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {wasteAnalytics?.details.length ? (
          <div className="space-y-3">
            {wasteAnalytics.details.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    {item.wasteStage} • {item.wasteCategory || 'General Waste'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {item.totalQuantity} {item.unitSymbol}
                  </div>
                  <div className="text-sm text-red-600">
                    ₨{item.totalCost.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No waste data available for selected period</p>
          </div>
        )}
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
          <p className="text-gray-600 mt-1">Track inventory, reduce waste, optimize costs</p>
        </div>
        <div className="flex items-center space-x-3">
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
          {[
            { id: 'dashboard', name: 'Dashboard', icon: TrendingDown },
            { id: 'inventory', name: 'Inventory', icon: Package },
            { id: 'waste', name: 'Waste Records', icon: AlertTriangle },
            { id: 'analytics', name: 'Analytics', icon: Eye },
          ].map((tab) => (
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
            <p className="text-gray-600">Inventory management interface coming soon...</p>
          </div>
        )}
        {activeTab === 'waste' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Waste Records</h3>
            <p className="text-gray-600">Waste records interface coming soon...</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
            <p className="text-gray-600">Advanced analytics interface coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteManagement;