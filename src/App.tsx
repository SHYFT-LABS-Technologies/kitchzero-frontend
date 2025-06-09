import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Import existing pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Import new pages
import Users from './pages/Users';
import Tenants from './pages/Tenants';
import TenantManagement from './pages/TenantManagement'; // New tenant management page
import Branches from './pages/Branches';
import Settings from './pages/Settings';
import MasterData from './pages/MasterData';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import WasteTracking from './pages/WasteTracking';
import WasteAnalytics from './pages/WasteAnalytics';

import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Main Dashboard */}
                      <Route path="/" element={<Dashboard />} />
                      
                      {/* Core Business - Waste Management */}
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/purchases" element={<Purchases />} />
                      <Route path="/waste-tracking" element={<WasteTracking />} />
                      <Route path="/waste-analytics" element={<WasteAnalytics />} />
                      <Route path="/master-data" element={<MasterData />} />
                      
                      {/* User Management (Tenant-scoped) */}
                      <Route path="/users" element={<Users />} />
                      <Route path="/branches" element={<Branches />} />
                      
                      {/* Super Admin Only - Global Tenant Management */}
                      <Route 
                        path="/admin/tenants" 
                        element={
                          <ProtectedRoute requiredRole={['super_admin']}>
                            <TenantManagement />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Legacy tenant page (redirect for now) */}
                      <Route path="/tenants" element={<Navigate to="/admin/tenants" replace />} />
                      
                      {/* Settings */}
                      <Route path="/settings" element={<Settings />} />
                      
                      {/* Fallback route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route for non-authenticated users */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;