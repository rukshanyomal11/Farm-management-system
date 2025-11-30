import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    const newErrors = {};

    // Client-side validation
    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password || formData.password.length === 0) {
      newErrors.password = 'Password is required';
    }

    // If there are errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('⚠️ Please fill in all fields correctly');
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Login attempt with email:', formData.email);
      
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        // Store tokens
        localStorage.setItem('adminAccessToken', data.data.accessToken);
        localStorage.setItem('adminRefreshToken', data.data.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(data.data.user));

        toast.success('✅ Welcome back, Administrator!', {
          icon: '👋',
          duration: 2000
        });
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        console.log('❌ Login failed:', response.status, data.message);
        
        // Handle specific error messages
        if (response.status === 404) {
          console.log('❌ Email not registered');
          setErrors({ email: 'This email is not registered' });
          toast.error('❌ This email is not registered. Please register first.', {
            duration: 4000,
            style: {
              background: '#FEE',
              color: '#C00',
              fontWeight: 'bold'
            }
          });
        } else if (response.status === 401) {
          console.log('❌ Wrong password');
          setErrors({ password: 'Wrong password' });
          toast.error('❌ Wrong password. Please try again.', {
            duration: 3000,
            style: {
              background: '#FEE',
              color: '#C00',
              fontWeight: 'bold'
            }
          });
        } else if (response.status === 403) {
          console.log('❌ Access denied:', data.message);
          if (data.message && data.message.includes('disabled')) {
            toast.error('🔒 Your admin account has been disabled. Contact system administrator.', {
              duration: 5000,
              style: {
                background: '#FEE',
                color: '#C00',
                fontWeight: 'bold'
              }
            });
          } else {
            setErrors({ email: data.message });
            toast.error(`❌ ${data.message}`, {
              duration: 4000,
              style: {
                background: '#FEE',
                color: '#C00',
                fontWeight: 'bold'
              }
            });
          }
        } else if (response.status === 400) {
          toast.error('⚠️ Please fill in all fields correctly', {
            duration: 3000
          });
        } else {
          toast.error(data.message || '❌ Login failed. Please try again.', {
            duration: 3000,
            style: {
              background: '#FEE',
              color: '#C00',
              fontWeight: 'bold'
            }
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('fetch')) {
        toast.error('🌐 Cannot connect to server. Please check your connection.', {
          duration: 4000,
          style: {
            background: '#FEE',
            color: '#C00',
            fontWeight: 'bold'
          }
        });
      } else {
        toast.error('❌ An error occurred. Please try again.', {
          duration: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex'>
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-gray-900/70"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full mb-6 border-4 border-white/30">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Admin Portal</h1>
          <p className="text-xl text-blue-100 mb-8">Farm Management System</p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <h3 className="font-semibold text-lg">System Control</h3>
                <p className="text-blue-100 text-sm">Manage all users and farm operations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <h3 className="font-semibold text-lg">Advanced Analytics</h3>
                <p className="text-blue-100 text-sm">Access detailed reports and insights</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <h3 className="font-semibold text-lg">Secure Access</h3>
                <p className="text-blue-100 text-sm">Protected with secret key authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Portal
            </h2>
            <p className="text-gray-600">Sign in to manage the system</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-white/80 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-12 py-3 bg-white/80 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                New administrator?{' '}
                <Link 
                  to="/admin/register" 
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Register here
                </Link>
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/70 text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to User Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
