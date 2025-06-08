import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Shield, Users, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';

const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data.username, data.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left Panel - Login Form */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto w-full max-w-md lg:max-w-lg">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                <span className="text-2xl font-bold text-white">K</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                KitchZero
              </h1>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <Alert variant="error">
                    <div>
                      <p className="font-medium">Authentication Failed</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </Alert>
                )}

                {/* Username Field */}
                <div>
                  <label 
                    htmlFor="username" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
                  </label>
                  <input
                    {...register('username')}
                    type="text"
                    autoComplete="username"
                    className={`
                      w-full px-4 py-3 border-2 rounded-xl transition-all duration-200
                      focus:outline-none focus:ring-0
                      ${errors.username 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                      }
                    `}
                    placeholder="Enter your username"
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                  {errors.username && (
                    <p id="username-error" className="mt-2 text-sm text-red-600" role="alert">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`
                        w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200
                        focus:outline-none focus:ring-0
                        ${errors.password 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                        }
                      `}
                      placeholder="Enter your password"
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="
                    w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                    text-white font-medium py-3 px-4 rounded-xl
                    hover:from-blue-700 hover:to-indigo-700
                    focus:outline-none focus:ring-4 focus:ring-blue-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 transform hover:scale-[1.02]
                    flex items-center justify-center space-x-2
                  "
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Demo Credentials
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-white/70 p-2 rounded-lg">
                    <p className="font-medium text-blue-800">Super Admin</p>
                    <p className="text-blue-700 font-mono text-xs">superadmin / TempPass2024!</p>
                  </div>
                  <p className="text-blue-600 text-xs">
                    💡 You'll be prompted to change the password on first login
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Feature Showcase */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="relative flex flex-col justify-center px-8 xl:px-16 text-white">
            <div className="max-w-md">
              <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                Manage Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Business Empire
                </span>
              </h2>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Experience the future of hospitality management with our cutting-edge platform
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Building2,
                    title: "Multi-Tenant Management",
                    description: "Seamlessly manage multiple restaurants & hotels from one dashboard"
                  },
                  {
                    icon: Users,
                    title: "Advanced User Controls",
                    description: "Role-based permissions and branch-level access management"
                  },
                  {
                    icon: Shield,
                    title: "Enterprise Security",
                    description: "Bank-level security with encrypted data and audit trails"
                  },
                  {
                    icon: TrendingUp,
                    title: "Real-Time Analytics",
                    description: "Live insights and performance metrics across all locations"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;