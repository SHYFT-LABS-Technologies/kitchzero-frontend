import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { testConnection, systemAPI } from '../lib/api';

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    health: 'loading' | 'success' | 'error';
    api: 'loading' | 'success' | 'error';
    db: 'loading' | 'success' | 'error';
  }>({
    health: 'loading',
    api: 'loading',
    db: 'loading',
  });

  const [results, setResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setConnectionStatus({
      health: 'loading',
      api: 'loading',
      db: 'loading',
    });

    // Test 1: Health check
    try {
      const healthResult = await testConnection();
      setResults(prev => ({ ...prev, health: healthResult }));
      setConnectionStatus(prev => ({ 
        ...prev, 
        health: healthResult.success ? 'success' : 'error' 
      }));
    } catch (error) {
      setResults(prev => ({ ...prev, health: { success: false, error } }));
      setConnectionStatus(prev => ({ ...prev, health: 'error' }));
    }

    // Test 2: API Status
    try {
      const apiResult = await systemAPI.getStatus();
      setResults(prev => ({ ...prev, api: { success: true, data: apiResult.data } }));
      setConnectionStatus(prev => ({ ...prev, api: 'success' }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, api: { success: false, error: error.message } }));
      setConnectionStatus(prev => ({ ...prev, api: 'error' }));
    }

    // Test 3: Database connection
    try {
      const dbResult = await systemAPI.testDB();
      setResults(prev => ({ ...prev, db: { success: true, data: dbResult.data } }));
      setConnectionStatus(prev => ({ ...prev, db: 'success' }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, db: { success: false, error: error.message } }));
      setConnectionStatus(prev => ({ ...prev, db: 'error' }));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connection Test</h1>
        <p className="text-gray-600">Testing connection between frontend and backend services</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Health Check */}
        <div className={`card p-4 ${getStatusColor(connectionStatus.health)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(connectionStatus.health)}
              <div>
                <h3 className="font-medium">Health Check</h3>
                <p className="text-sm text-gray-600">Backend server health status</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {connectionStatus.health === 'success' ? 'Healthy' : 
                 connectionStatus.health === 'error' ? 'Failed' : 'Checking...'}
              </p>
              <p className="text-xs text-gray-500">http://localhost:3000/health</p>
            </div>
          </div>
          {results.health && (
            <div className="mt-3 p-2 bg-white rounded text-xs font-mono overflow-auto">
              <pre>{JSON.stringify(results.health, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* API Status */}
        <div className={`card p-4 ${getStatusColor(connectionStatus.api)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(connectionStatus.api)}
              <div>
                <h3 className="font-medium">API Status</h3>
                <p className="text-sm text-gray-600">API endpoints and routing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {connectionStatus.api === 'success' ? 'Connected' : 
                 connectionStatus.api === 'error' ? 'Failed' : 'Checking...'}
              </p>
              <p className="text-xs text-gray-500">http://localhost:3000/api/v1/status</p>
            </div>
          </div>
          {results.api && (
            <div className="mt-3 p-2 bg-white rounded text-xs font-mono overflow-auto max-h-32">
              <pre>{JSON.stringify(results.api, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Database Connection */}
        <div className={`card p-4 ${getStatusColor(connectionStatus.db)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(connectionStatus.db)}
              <div>
                <h3 className="font-medium">Database Connection</h3>
                <p className="text-sm text-gray-600">PostgreSQL database connectivity</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {connectionStatus.db === 'success' ? 'Connected' : 
                 connectionStatus.db === 'error' ? 'Failed' : 'Checking...'}
              </p>
              <p className="text-xs text-gray-500">http://localhost:3000/api/v1/db-test</p>
            </div>
          </div>
          {results.db && (
            <div className="mt-3 p-2 bg-white rounded text-xs font-mono overflow-auto max-h-32">
              <pre>{JSON.stringify(results.db, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-test Connection</span>
        </button>

        <div className="text-sm text-gray-600">
          Overall Status: {
            Object.values(connectionStatus).every(status => status === 'success')
              ? '✅ All Systems Operational'
              : Object.values(connectionStatus).some(status => status === 'loading')
              ? '🔄 Testing...'
              : '❌ Some Systems Down'
          }
        </div>
      </div>

      {/* Connection Help */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Troubleshooting</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Make sure your backend server is running: <code className="bg-gray-200 px-1 rounded">npm run dev</code></p>
          <p>• Backend should be accessible at: <code className="bg-gray-200 px-1 rounded">http://localhost:3000</code></p>
          <p>• Check browser console for detailed error messages</p>
          <p>• Ensure CORS is configured correctly in your backend</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;