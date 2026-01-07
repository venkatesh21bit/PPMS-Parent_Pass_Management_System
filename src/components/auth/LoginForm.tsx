'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'PARENT' as 'PARENT' | 'SECURITY' | 'HOSTEL_WARDEN',
    hostelName: '',
  });

  const { login, register } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        addToast({
          type: 'success',
          title: 'Login successful',
          message: 'Welcome back!',
        });
      } else {
        await register(formData);
        addToast({
          type: 'success',
          title: 'Registration successful',
          message: 'Your account has been created!',
        });
      }
    } catch (error: unknown) {
      let errorMsg = 'An error occurred.';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMsg = (error as { message: string }).message;
      }
      addToast({
        type: 'error',
        title: isLogin ? 'Login failed' : 'Registration failed',
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full">
      <div className="flex mb-6">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
            isLogin
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
          }`}
        >
          <LogIn className="w-4 h-4 inline mr-2" />
          Login
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border-t border-r border-b ${
            !isLogin
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="PARENT">Parent</option>
                <option value="SECURITY">Security</option>
                <option value="HOSTEL_WARDEN">Hostel Warden</option>
              </select>
            </div>
            {formData.role === 'HOSTEL_WARDEN' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hostel Name</label>
                <select
                  name="hostelName"
                  value={formData.hostelName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Hostel</option>
                  <option value="Agasthya Bhavanam">Agasthya Bhavanam</option>
                  <option value="Vasishta Bhavanam">Vasishta Bhavanam</option>
                  <option value="Gautama Bhavanam">Gautama Bhavanam</option>
                </select>
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              {isLogin ? 'Signing in...' : 'Creating account...'}
            </div>
          ) : (
            <>
              {isLogin ? (
                <>
                  <LogIn className="w-4 h-4 inline mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Create Account
                </>
              )}
            </>
          )}
        </button>
      </form>

      {isLogin && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-200 font-medium mb-3">🔑 Demo Credentials:</p>
          <div className="text-xs text-gray-300 space-y-2">
            <div className="pb-2 border-b border-gray-600">
              <div className="font-semibold text-blue-400 mb-1">Parent:</div>
              <div className="pl-2">📧 parent@example.com</div>
              <div className="pl-2">🔒 parent123</div>
            </div>
            
            <div className="pb-2 border-b border-gray-600">
              <div className="font-semibold text-green-400 mb-1">Security:</div>
              <div className="pl-2">📧 security@example.com</div>
              <div className="pl-2">🔒 security123</div>
            </div>
            
            <div>
              <div className="font-semibold text-purple-400 mb-1">Hostel Wardens:</div>
              <div className="pl-2 space-y-1">
                <div>
                  <span className="text-purple-300">Agasthya:</span> agasthya.warden@college.edu / warden123
                </div>
                <div>
                  <span className="text-purple-300">Vasishta:</span> vasishta.warden@college.edu / warden123
                </div>
                <div>
                  <span className="text-purple-300">Gautama:</span> gautama.warden@college.edu / warden123
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
