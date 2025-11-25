import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Forgot password error:', err);
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please check your inbox and spam folder. The link will expire in 1 hour.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
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
        <div className="md:w-1/2 bg-gradient-to-br from-orange-400 to-red-500 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-3">Forgot</h1>
              <h2 className="text-3xl font-bold mb-4">Password?</h2>
              <p className="text-lg opacity-90 mb-6">
                Don't worry, it happens to everyone!
              </p>
              <p className="text-sm opacity-80">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            
            {/* Decorative icons */}
            <div className="flex justify-center gap-6 mt-8">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                🔒
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                📧
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                🔑
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-600 mb-8">
              Enter your email address and we'll send you instructions to reset your password
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      error ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </button>

              {/* Additional Info */}
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                    Login here
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  The password reset link will expire in 1 hour for security reasons.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
