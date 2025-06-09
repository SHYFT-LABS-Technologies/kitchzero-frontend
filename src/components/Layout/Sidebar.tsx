import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  Settings,
  ChefHat,
  Crown,
  Shield,
  LogOut,
  Sparkles
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, current: true },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Tenants', href: '/tenants', icon: Building2 },
  { name: 'Branches', href: '/branches', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'superadmin': return <Crown className="w-3 h-3 text-primary-500" />;
    case 'admin': return <Shield className="w-3 h-3 text-primary-500" />;
    default: return <ChefHat className="w-3 h-3 text-primary-500" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'superadmin': return 'Super Admin';
    case 'admin': return 'Administrator';
    default: return 'User';
  }
};

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const filteredNavigation = navigation.filter(item => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'admin') return !['tenants'].includes(item.href.slice(1));
    return ['/', '/settings'].includes(item.href);
  });

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Logo section */}
      <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">KitchZero</h1>
            <p className="text-xs text-gray-500">Restaurant Management</p>
          </div>
        </div>
      </div>

      {/* User profile card */}
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 p-4 border border-primary-100">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white font-semibold shadow-md">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user?.username}
              </p>
              <div className="flex items-center space-x-1">
                {getRoleIcon(user?.role || '')}
                <p className="text-xs text-gray-600">{getRoleLabel(user?.role || '')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 pb-4">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main Menu
          </p>
        </div>
        
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
                {item.name === 'Dashboard' && (
                  <Sparkles className="ml-auto h-4 w-4 text-primary-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={logout}
          className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;