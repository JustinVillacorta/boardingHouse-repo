// pages/signIn.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// MODEL
interface LoginForm {
  email: string;
  password: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class UserModel {
  static validateUser(user: LoginForm): ValidationResult {
    const errors: string[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email) {
      errors.push('Email is required');
    } else if (!emailRegex.test(user.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!user.password) {
      errors.push('Password is required');
    } else if (user.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// VIEW
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/main' : 
                          user.role === 'staff' ? '/staff-dashboard' :
                          user.role === 'tenant' ? '/tenant' : '/main';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      setMessage({ text: 'Please accept the Terms & Conditions', type: 'error' });
      return;
    }

    // Validate form data
    const validation = UserModel.validateUser(formData);
    if (!validation.isValid) {
      setMessage({ text: validation.errors.join(', '), type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await login(formData.email, formData.password);
      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
      
      // Navigation will be handled by the useEffect hook above
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 relative overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full text-white space-y-6 p-12">
          {/* Icon Circle */}
          <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg">
            <svg
              width="180"
              height="135"
              viewBox="0 0 98 78"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M70.9664 0.00170898H26.725L0.582364 27.4534L9.83284 26.9151V56.6993L2.79443 57.417C2.79443 57.417 -0.62422 57.9552 0.18017 61.1849C0.984559 63.5173 3.59882 63.5174 3.59882 63.5174L9.83284 62.6202V70.5148L53.8731 77.6917L88.4619 70.6943V27.6328L97.9135 26.9151C97.7124 26.7357 70.9664 0.00170898 70.9664 0.00170898ZM61.917 32.6566L71.5697 31.7595V43.0632L61.917 44.1397V32.6566ZM13.0504 68.5412V62.2614L32.1546 59.3906C32.1546 59.3906 35.3722 59.3906 35.1711 56.161C34.97 53.2903 31.3503 53.8285 31.3503 53.8285L13.0504 56.3404V26.018L32.3557 5.74324L53.8731 26.9151V75.0004L13.0504 68.5412ZM61.917 59.57V47.9076L71.5697 46.831V58.1347L61.917 59.57ZM83.4345 56.161L75.3906 57.417V46.2928L83.4345 45.2162V56.161ZM75.5917 42.7043V31.5801L83.6356 30.8624V41.8072C83.4345 41.8072 75.5917 42.7043 75.5917 42.7043ZM41.4051 27.8122C39.193 25.4797 36.1766 24.0444 32.7579 24.0444H32.1546C28.736 24.2238 25.9206 25.8386 23.9097 28.1711C21.8987 30.5036 20.6921 33.7332 20.6921 37.1422V38.0393C20.8932 41.6278 22.3009 44.8574 24.5129 47.0105C26.725 49.343 29.7415 50.7783 33.1601 50.7783H33.7634C37.1821 50.5989 39.9974 48.9841 42.0084 46.6516C44.0194 44.3191 45.226 41.0895 45.226 37.6805V36.7834C45.0249 33.3743 43.6172 30.1447 41.4051 27.8122ZM39.9974 45.3957C38.3887 47.3693 35.9755 48.6253 33.5623 48.6253H33.1601C30.5459 48.6253 28.1327 47.5487 26.3228 45.5751C24.5129 43.6014 23.1053 40.9101 23.1053 37.8599V37.1422C23.1053 34.092 24.1107 31.4007 25.9206 29.427C27.5294 27.4534 29.9426 26.1974 32.3557 26.1974H32.7579C35.3722 26.1974 37.7854 27.274 39.5952 29.2476C41.4051 31.2213 42.8128 33.9126 42.8128 36.9628V37.6805C42.8128 40.7307 41.8073 43.422 39.9974 45.3957ZM28.736 37.6805C28.5349 33.9126 29.9426 30.5036 31.9535 29.2476C28.3338 29.427 25.5184 33.3743 25.9206 37.8599C26.1217 42.5249 29.3393 46.1133 32.959 45.9339C30.747 44.8574 28.9371 41.6278 28.736 37.6805Z"
                fill="#ffffffff"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-extrabold text-center">Welcome Back!</h2>

          {/* Description */}
          <p className="text-lg text-center max-w-xs opacity-90">
            Access your account and continue your journey with us.
          </p>
        </div>
      </div>


      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Sign in to access your boarding house dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  Terms & Conditions
                </label>
              </div>
              <button type="button" className="text-sm text-blue-600 font-medium">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || authLoading ? 'Logging in...' : 'Log in'}
            </button>


            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
