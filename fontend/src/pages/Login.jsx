import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      console.log('Login response:', data); // Debug log

      if (response.ok) {
        // Store tokens and user data
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        console.log('User role:', data.data.user.role); // Debug log

        toast.success('Login successful!');

        // Redirect based on user role
        setTimeout(() => {
          const role = data.data.user.role;
          console.log('Navigating based on role:', role); // Debug log
          
          if (role === 'farm_owner') {
            navigate('/dashboard');
          } else if (role === 'farm_manager') {
            navigate('/manager/dashboard');
          } else if (role === 'accountant') {
            navigate('/accountant/dashboard');
          } else if (role === 'field_worker') {
            navigate('/worker/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
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
              Welcome back,
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
              Farmer
            </h2>
            
            <p className="text-lg mb-4 text-white/90 drop-shadow">
              Manage your farm operations efficiently
            </p>
            <p className="text-sm text-white/80 mb-8 drop-shadow">
              Access your dashboard and track everything from crops to livestock
            </p>
            
            {/* Decorative farm icons */}
            <div className="flex gap-6 mt-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-3xl">
                🌾
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-3xl">
                🐄
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 text-3xl">
                🚜
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-6">
          <div className="max-w-md mx-auto bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/30">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, Farmer</h2>
            <p className="text-gray-600 mb-6">Enter your credentials to access your account</p>

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
                  } rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500`}
                  placeholder="your@email.com"
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
                    } rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500`}
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
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember in me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Forgot your password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Log In
              </button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
                  Register here
                </Link>
              </p>

              {/* Admin Login Link */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-center text-sm text-gray-600">
                  System Administrator?{' '}
                  <Link to="/admin/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Admin Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
