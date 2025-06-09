import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConnectionTest from './components/ConnectionTest';
import { useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-25">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-lg mb-4 animate-bounce-subtle">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Placeholder components for future development
const Users: React.FC = () => (
  <div className="animate-fade-in">
    <div className="card p-8 text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">👥</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
      <p className="text-gray-600 mb-6">Manage user accounts, roles, and permissions</p>
      <div className="badge badge-warning">Coming Soon</div>
    </div>
  </div>
);

const Tenants: React.FC = () => (
  <div className="animate-fade-in">
    <div className="card p-8 text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🏢</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenant Management</h1>
      <p className="text-gray-600 mb-6">Manage restaurant chains and hotel groups</p>
      <div className="badge badge-warning">Coming Soon</div>
    </div>
  </div>
);

const Branches: React.FC = () => (
  <div className="animate-fade-in">
    <div className="card p-8 text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🏪</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Branch Management</h1>
      <p className="text-gray-600 mb-6">Manage individual restaurant locations</p>
      <div className="badge badge-warning">Coming Soon</div>
    </div>
  </div>
);

const Settings: React.FC = () => (
  <div className="animate-fade-in">
    <div className="card p-8 text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⚙️</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-6">Configure application preferences and security</p>
      <div className="badge badge-warning">Coming Soon</div>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-25">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/connection-test" element={<ConnectionTest />} />
              
              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="tenants" element={<Tenants />} />
                <Route path="branches" element={<Branches />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;