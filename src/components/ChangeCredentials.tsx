import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';
import { authStorage } from '../lib/auth-storage';
import { Alert } from './ui/Alert';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Eye, EyeOff, Lock, User, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const ChangeCredentials: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, refreshUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputChange>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate new username is different
    if (formData.newUsername === user?.username) {
      setError('New username must be different from current username');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.changeCredentials({
        currentPassword: formData.currentPassword,
        newUsername: formData.newUsername,
        newPassword: formData.newPassword,
      });

      // If the response includes updated user data, use it
      if (response.data.data?.user) {
        const updatedUser = response.data.data.user;
        console.log('📝 Updated user data received:', updatedUser);
        
        // Update storage with new user data
        authStorage.setUser(updatedUser);
        
        // Force refresh user context
        await refreshUser();
      }

      setSuccess('Credentials updated successfully! Redirecting to dashboard...');
      
      // Small delay to show success message, then the component should disappear
      setTimeout(() => {
        window.location.reload(); // Force a complete refresh
      }, 2000);

    } catch (error: any) {
      console.error('Credential change error:', error);
      setError(error.response?.data?.message || 'Failed to change credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { met: formData.newPassword.length >= 12, text: 'At least 12 characters' },
    { met: /[A-Z]/.test(formData.newPassword), text: 'One uppercase letter' },
    { met: /[a-z]/.test(formData.newPassword), text: 'One lowercase letter' },
    { met: /[0-9]/.test(formData.newPassword), text: 'One number' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword), text: 'One special character' },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);

  return (
    <div className="fixed inset-0 bg-gray-25 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Header */}
          <div className="text-center px-6 pt-8 pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Update Required</h1>
            <p className="text-gray-600 text-sm">
              Change your default credentials to secure your account
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-8">
            {/* Alert */}
            <Alert variant="warning" className="mb-6">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Default credentials detected</p>
                <p className="text-sm mt-1">Create new login credentials for security.</p>
              </div>
            </Alert>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    required
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Username */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  New Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="newUsername"
                    required
                    value={formData.newUsername}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                    placeholder="Choose a new username"
                    minLength={3}
                    maxLength={50}
                    pattern="[a-zA-Z0-9]+"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: <span className="font-medium text-gray-700">{user?.username}</span>
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    required
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                    placeholder="Create a strong password"
                    minLength={12}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {formData.newPassword && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-900 mb-2">Password Requirements:</h4>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className={`h-3 w-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-xs ${req.met ? 'text-green-700' : 'text-gray-500'}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                    placeholder="Confirm your new password"
                    minLength={12}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="error">
                  <p className="text-sm">{error}</p>
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm">{success}</p>
                  </div>
                </Alert>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || success || !allRequirementsMet || formData.newPassword !== formData.confirmPassword}
                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl text-sm"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2 text-white" />
                    Updating Credentials...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Update Credentials
                  </>
                )}
              </button>
            </form>

            {/* Debug Info */}
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <p>Debug: must_change_password = {user?.mustChangePassword ? 'true' : 'false'}</p>
              <p>User: {user?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeCredentials;