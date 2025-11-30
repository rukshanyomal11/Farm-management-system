import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ViewerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('Viewer login response:', response.data); // Debug log

      // Handle different response structures
      const data = response.data;
      const user = data.data?.user || data.user;
      const token = data.data?.accessToken || data.token;
      const refreshToken = data.data?.refreshToken || data.refreshToken;

      if (user && token) {
        // Check if user is viewer role
        if (user.role !== 'viewer') {
          toast.error('This login is for Viewer/Consultant accounts only');
          setLoading(false);
          return;
        }

        // Store tokens and user data
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Login successful!', {
          duration: 2000,
          icon: '✅'
        });
        
        setTimeout(() => {
          navigate('/viewer/dashboard');
        }, 1000);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070)',
          filter: 'brightness(0.9)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40" />

      <div className="w-full max-w-6xl mx-4 relative z-10 flex flex-col md:flex-row gap-8 items-center justify-center">
        
        {/* Left Side - Welcome Text */}
        <div className="md:w-1/2 text-white p-8 md:p-12">
          <div className="max-w-md">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Welcome,
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
              Consultant
            </h2>
            
            <p className="text-lg mb-4 text-white/90 drop-shadow">
              Professional advisory access to farm operations
            </p>
            <p className="text-sm text-white/80 mb-8 drop-shadow">
              Access comprehensive farm data to provide expert recommendations
            </p>
            
            {/* Decorative icons */}
            <div className="flex gap-6 mt-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-3xl">
                👁️
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-3xl">
                📊
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-3xl">
                📋
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-6">
          <div className="max-w-md mx-auto bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/30">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Consultant Login</h2>
            <p className="text-gray-600 mb-6">Read-only advisory access to farm data</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${
                    errors.email ? 'border-red-500' : 'border-white/40'
                  } rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500`}
                  placeholder="consultant@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full px-4 pr-10 py-3 bg-white/60 backdrop-blur-sm border ${
                      errors.password ? 'border-red-500' : 'border-white/40'
                    } rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                  Forgot your password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/viewer/register" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                  Register here
                </Link>
              </p>

              {/* Other Login Links */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-center text-sm text-gray-600 mb-2">Login as a different role:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-semibold">
                    Farm Owner
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/admin/login" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    Admin
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerLogin;
