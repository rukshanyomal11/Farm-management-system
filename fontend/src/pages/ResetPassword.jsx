import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!token) {
      setApiError('Invalid or missing reset token');
    }
  }, [token]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const newErrors = {};
    
    // Validate new password
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(', ');
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setApiError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setApiError('Network error. Please check your connection.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been changed successfully.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Redirecting to login page...
            </p>
            <Link
              to="/login"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-8">
              This password reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Illustration */}
        <div className="md:w-1/2 bg-gradient-to-br from-green-400 to-teal-500 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                <Lock className="w-16 h-16" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Create New</h1>
              <h2 className="text-3xl font-bold mb-4">Password</h2>
              <p className="text-lg opacity-90 mb-6">
                Choose a strong password for your account
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left">
                <p className="text-sm font-semibold mb-2">Password must contain:</p>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>✓ At least 8 characters</li>
                  <li>✓ One uppercase letter</li>
                  <li>✓ One lowercase letter</li>
                  <li>✓ One number</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
            <p className="text-gray-600 mb-8">
              Enter your new password below
            </p>

            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                    placeholder="Enter new password"
                    disabled={loading}
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
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Reset Password
                  </>
                )}
              </button>

              {/* Back to Login */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Back to Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
