import React from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  Users,
  Building2,
  GitBranch,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Clock,
  ChefHat
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const changeColor = {
    positive: 'text-success-600',
    negative: 'text-error-600',
    neutral: 'text-gray-600'
  }[changeType];

  const changeIcon = changeType === 'positive' ? ArrowUpRight : ArrowDownRight;
  const ChangeIcon = changeIcon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${changeColor}`}>
          <ChangeIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const metrics = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Active Tenants',
      value: '156',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Building2,
    },
    {
      title: 'Restaurant Branches',
      value: '1,204',
      change: '+23.1%',
      changeType: 'positive' as const,
      icon: GitBranch,
    },
    {
      title: 'Monthly Revenue',
      value: '$89,432',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'John Smith',
      action: 'created a new branch',
      target: 'Downtown Location',
      time: '2 minutes ago',
      avatar: 'JS',
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      action: 'updated menu items',
      target: 'Main Menu',
      time: '15 minutes ago',
      avatar: 'SJ',
    },
    {
      id: 3,
      user: 'Mike Wilson',
      action: 'added new staff member',
      target: 'Kitchen Team',
      time: '1 hour ago',
      avatar: 'MW',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <ChefHat className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.username}!</h1>
              <p className="text-primary-100 mt-1">Here's what's happening with your restaurant empire today</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                7d
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                30d
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                90d
              </button>
            </div>
          </div>
          
          {/* Chart placeholder */}
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Analytics Chart</p>
              <p className="text-sm text-gray-400">Chart component will be integrated here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 text-xs font-semibold">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;