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
    role: 'PARENT' as 'PARENT' | 'SECURITY' | 'WARDEN',
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
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="label-text">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your full name"
              required
            />
          </div>
        )}

        <div>
          <label className="label-text">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="label-text">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-10"
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
          <div>
            <label className="label-text">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="PARENT">Parent</option>
              <option value="SECURITY">Security</option>
              <option value="WARDEN">Warden</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Parent: parent@example.com / parent123</div>
            <div>Security: security@example.com / security123</div>
            <div>Warden: warden@example.com / warden123</div>
          </div>
        </div>
      )}
    </div>
  );
}
