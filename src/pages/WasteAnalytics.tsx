import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wasteManagementAPI } from '../lib/api/endpoints/waste-management';
import { 
  BarChart3, 
  PieChart, 
  TrendingDown, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Target,
  DollarSign,
  Package
} from 'lucide-react';

const WasteAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [wasteAnalytics, setWasteAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (selectedBranch) {
      loadAnalyticsData();
    }
  }, [selectedBranch, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const analyticsRes = await wasteManagementAPI.getWasteAnalytics(
        selectedBranch, 
        dateRange.startDate, 
        dateRange.endDate
      );

      setWasteAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error loading waste analytics:', error);
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
    trend?: string;
  }> = ({ title, value, color, icon: Icon, description, trend }) => (
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
        {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading waste analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Analytics</h1>
          <p className="text-gray-600 mt-1">
            Analyze waste patterns, trends, and identify cost-saving opportunities
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={loadAnalyticsData}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Analytics Period</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Waste Cost"
          value={wasteAnalytics?.summary?.totalWasteCost ? 
            `₨${wasteAnalytics.summary.totalWasteCost.toLocaleString()}` : '₨0.00'}
          color="red"
          icon={DollarSign}
          description="Selected period"
        />
        <StatCard
          title="Waste Incidents"
          value={wasteAnalytics?.summary?.totalIncidents?.toString() || '0'}
          color="orange"
          icon={TrendingDown}
          description="Total occurrences"
        />
        <StatCard
          title="Products Affected"
          value={wasteAnalytics?.summary?.productsWasted?.toString() || '0'}
          color="yellow"
          icon={Package}
          description="Unique items"
        />
        <StatCard
          title="Avg Cost/Incident"
          value={wasteAnalytics?.summary?.avgCostPerIncident ? 
            `₨${wasteAnalytics.summary.avgCostPerIncident.toFixed(2)}` : '₨0.00'}
          color="purple"
          icon={BarChart3}
          description="Per incident"
        />
      </div>

      {/* Analytics Content */}
      {wasteAnalytics?.details?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Waste Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Waste Items by Cost</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {wasteAnalytics.details.slice(0, 8).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.totalQuantity} {item.unitSymbol} • {item.incidentCount} incidents
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      ₨{item.totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Categories Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Waste by Category</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {wasteAnalytics.categoryBreakdown?.length > 0 ? (
                wasteAnalytics.categoryBreakdown.map((category: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.categoryName}</p>
                      <p className="text-sm text-gray-600">
                        {category.categoryQuantity} items • {category.productsInCategory} products
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₨{category.categoryCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No category data available</p>
              )}
            </div>
          </div>

          {/* Time Patterns */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Waste Patterns by Day</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            {wasteAnalytics.timePatterns?.length > 0 ? (
              <div className="grid grid-cols-7 gap-2">
                {wasteAnalytics.timePatterns.map((pattern: any, index: number) => (
                  <div key={index} className="text-center p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">{pattern.dayName}</div>
                    <div className="text-lg font-bold text-red-600 mt-1">
                      ₨{pattern.dailyWasteCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">{pattern.daysRecorded} days</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No time pattern data available</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Analytics Data</h4>
            <p className="text-gray-500 mb-6">
              No waste records found for the selected period. Start recording waste to see analytics.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Waste Reduction Target</h4>
            </div>
            <p className="text-sm text-gray-600">
              Aim to reduce waste by 15% next month through better inventory management
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-2">
              <TrendingDown className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Cost Savings</h4>
            </div>
            <p className="text-sm text-gray-600">
              Potential monthly savings of ₨2,000+ with improved waste tracking
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">Best Practices</h4>
            </div>
            <p className="text-sm text-gray-600">
              Implement FIFO methods and daily waste monitoring for best results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteAnalytics;