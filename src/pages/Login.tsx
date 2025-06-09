import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Eye, EyeOff, Lock, User, ArrowRight, Sparkles, Shield, CheckCircle, Leaf, TrendingDown, Recycle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(username, password);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUsername('superadmin');
    setPassword('TempPass2024!');
    setError(''); // Clear any existing errors
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex">
      {/* Left side - Professional hero section with sustainable theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 relative overflow-hidden">
        {/* Animated floating elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 right-20 w-24 h-24 bg-teal-300/10 rounded-full blur-lg animate-bounce-slow"></div>
          <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-green-400/10 rounded-full blur-lg animate-pulse-slow"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-emerald-300/10 rounded-full blur-md animate-float"></div>
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leaf-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="currentColor" opacity="0.3"/>
                <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.2"/>
                <circle cx="50" cy="50" r="0.5" fill="currentColor" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-md">
            {/* Logo with animation */}
            <div className="flex items-center space-x-3 mb-12 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">KitchZero</h1>
                <p className="text-emerald-200 text-sm">Zero Waste Restaurant Management</p>
              </div>
            </div>
            
            {/* Hero content with staggered animation */}
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                Eliminate Food Waste,
                <span className="text-emerald-300"> Maximize Profits</span>
              </h2>
              <p className="text-xl text-emerald-100 mb-12 leading-relaxed">
                Transform your restaurant into a sustainable, profitable operation with our intelligent waste management platform.
              </p>
            </div>
            
            {/* Features with staggered animations */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-emerald-400/30">
                  <TrendingDown className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Reduce Waste by 80%</h3>
                  <p className="text-emerald-200 text-sm">AI-powered inventory optimization</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 animate-slide-in-left" style={{animationDelay: '0.4s'}}>
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-teal-400/30">
                  <Recycle className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sustainability Tracking</h3>
                  <p className="text-emerald-200 text-sm">Monitor your environmental impact</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 animate-slide-in-left" style={{animationDelay: '0.6s'}}>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-green-400/30">
                  <Leaf className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Eco-friendly Operations</h3>
                  <p className="text-emerald-200 text-sm">Build a greener restaurant business</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Clean login form with fixed height */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-white/80 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">KitchZero</h1>
            <p className="text-gray-600 mt-1">Zero Waste Management</p>
          </div>

          {/* Login header */}
          <div className="text-center lg:text-left mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Continue your sustainability journey</p>
          </div>

          {/* Error message - Fixed positioning */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="group">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white placeholder-gray-500 hover:border-emerald-300"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white placeholder-gray-500 hover:border-emerald-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit button with animation */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Access Your Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials with clickable auto-populate */}
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg animate-fade-in" style={{animationDelay: '0.8s'}}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                  <Leaf className="w-3 h-3 text-emerald-600" />
                </div>
                Demo Access - Try Sustainability Features
              </h4>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-full transition-colors duration-200 transform hover:scale-105"
              >
                Use Demo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-white/60 rounded border border-emerald-100">
                <span className="text-gray-600 block text-xs">Username:</span>
                <p className="font-mono font-semibold text-emerald-800 text-sm">superadmin</p>
              </div>
              <div className="p-2 bg-white/60 rounded border border-emerald-100">
                <span className="text-gray-600 block text-xs">Password:</span>
                <p className="font-mono font-semibold text-emerald-800 text-sm">TempPass2024!</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 animate-fade-in" style={{animationDelay: '1s'}}>
            <p className="text-sm text-gray-500">
              © 2025 KitchZero. Building sustainable restaurants worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;