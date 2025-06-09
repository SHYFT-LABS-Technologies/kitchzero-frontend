import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Eye, EyeOff, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(username, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kitchzero-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-kitchzero-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-kitchzero-text mb-2">Welcome to KitchZero</h1>
          <p className="text-kitchzero-secondary">Sign in to your restaurant dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-kitchzero-border p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-kitchzero-text mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-kitchzero-secondary" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-kitchzero-border rounded-xl focus:ring-2 focus:ring-kitchzero-primary focus:border-kitchzero-primary transition-all bg-white text-kitchzero-text placeholder-kitchzero-secondary"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-kitchzero-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-kitchzero-secondary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-kitchzero-border rounded-xl focus:ring-2 focus:ring-kitchzero-primary focus:border-kitchzero-primary transition-all bg-white text-kitchzero-text placeholder-kitchzero-secondary"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-kitchzero-secondary hover:text-kitchzero-text transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-kitchzero-primary hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-kitchzero-info rounded-xl border border-kitchzero-border">
            <h4 className="font-semibold text-kitchzero-text mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-kitchzero-success rounded-full"></div>
              Demo Access
            </h4>
            <div className="text-sm text-kitchzero-secondary space-y-1">
              <p><span className="font-medium text-kitchzero-text">Username:</span> superadmin</p>
              <p><span className="font-medium text-kitchzero-text">Password:</span> TempPass2024!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-kitchzero-secondary">
            © 2025 KitchZero. Powering the future of restaurant management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;