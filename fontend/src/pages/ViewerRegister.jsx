import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Mail, CheckCircle, ArrowRight } from 'lucide-react';

const ViewerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verify Code, 3: Registration Form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
    expertise: '',
    licenseNumber: ''
  });

  useEffect(() => {
    if (timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerSeconds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      toast.error('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email' });
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/verification/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setTimerSeconds(600); // 10 minutes
        toast.success('Verification code sent to your email!');
      } else {
        setErrors({ email: data.message });
        toast.error(data.message || 'Failed to send code');
      }
    } catch (err) {
      setErrors({ email: 'Failed to send code. Please try again.' });
      toast.error('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setErrors({ verificationCode: 'Please enter the verification code' });
      toast.error('Please enter the verification code');
      return;
    }

    if (formData.verificationCode.length !== 6) {
      setErrors({ verificationCode: 'Code must be 6 digits' });
      toast.error('Code must be 6 digits');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/verification/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
        toast.success('Email verified successfully!');
      } else {
        setErrors({ verificationCode: data.message });
        toast.error(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setErrors({ verificationCode: 'Verification failed. Please try again.' });
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || '0000000000', // Provide default if empty
        password: formData.password,
        role: 'viewer',
        // Viewer accounts don't need farm details, but backend validation requires them
        farmName: 'N/A - Viewer Account',
        farmType: 'Other',
        farmSize: '0',
        location: 'N/A',
        organization: formData.organization,
        expertise: formData.expertise,
        licenseNumber: formData.licenseNumber
      });

      // Check if registration was successful
      if (response.data.success || response.status === 200 || response.status === 201) {
        toast.success('Registration successful! Redirecting to login...', {
          duration: 2000,
          icon: '✅'
        });
        setTimeout(() => {
          navigate('/viewer/login');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation failed: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
              Join as
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
              Consultant
            </h2>
            
            <p className="text-lg mb-4 text-white/90 drop-shadow">
              Provide professional advisory services to farmers
            </p>
            <p className="text-sm text-white/80 mb-8 drop-shadow">
              Register to access farm data and offer expert recommendations
            </p>
            
            {/* Benefits list */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                  <span className="text-lg">✓</span>
                </div>
                <span className="text-white/90">Read-only access to farm data</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                  <span className="text-lg">✓</span>
                </div>
                <span className="text-white/90">Provide recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                  <span className="text-lg">✓</span>
                </div>
                <span className="text-white/90">Access analytics & reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="md:w-1/2 p-6">
          <div className="max-w-md mx-auto bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/30">
            
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Email</span>
                </div>
                <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-cyan-600' : 'bg-gray-200'}`} />
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Verify</span>
                </div>
                <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-cyan-600' : 'bg-gray-200'}`} />
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Details</span>
                </div>
              </div>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600 mb-6">Enter your email to get started</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border ${
                          errors.email ? 'border-red-500' : 'border-white/40'
                        } rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500`}
                        placeholder="consultant@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending...' : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verify Code */}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify Email</h2>
                <p className="text-gray-600 mb-6">Enter the 6-digit code sent to {formData.email}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="verificationCode"
                      value={formData.verificationCode}
                      onChange={handleChange}
                      maxLength={6}
                      className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${
                        errors.verificationCode ? 'border-red-500' : 'border-white/40'
                      } rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500 text-center text-2xl tracking-widest`}
                      placeholder="000000"
                    />
                    {errors.verificationCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
                    )}
                  </div>

                  {timerSeconds > 0 && (
                    <p className="text-sm text-center text-gray-600">
                      Code expires in: <span className="font-semibold text-cyan-600">{formatTime(timerSeconds)}</span>
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Verifying...' : (
                      <>
                        Verify Code
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading || timerSeconds > 0}
                    className="w-full text-cyan-600 hover:text-cyan-700 font-medium text-sm disabled:text-gray-400"
                  >
                    Resend Code
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-600 hover:text-gray-700 font-medium text-sm"
                  >
                    ← Change Email
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Registration Form */}
            {step === 3 && (
              <div className="max-h-[65vh] overflow-y-auto pr-2">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Profile</h2>
                <p className="text-gray-600 mb-6">Fill in your details</p>

                <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              {/* Email and Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
                  placeholder="+1234567890"
                />
              </div>

              {/* Organization and Expertise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization/Company
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
                    placeholder="Agricultural Consultants Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area of Expertise
                  </label>
                  <select
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select expertise</option>
                    <option value="crop_specialist">Crop Specialist</option>
                    <option value="livestock_expert">Livestock Expert</option>
                    <option value="soil_scientist">Soil Scientist</option>
                    <option value="agricultural_engineer">Agricultural Engineer</option>
                    <option value="pest_management">Pest Management</option>
                    <option value="organic_farming">Organic Farming</option>
                    <option value="general_consultant">General Consultant</option>
                  </select>
                </div>
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional License/Certificate Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
                  placeholder="License/Certificate Number (if applicable)"
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 pr-10 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 pr-10 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Register as Consultant'}
              </button>
            </form>
              </div>
            )}

            {/* Login Link - Show on all steps */}
            <div className="mt-6">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/viewer/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                  Login here
                </Link>
              </p>

              {/* Other Registration Links */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-center text-sm text-gray-600 mb-2">Register as a different role:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/register" className="text-sm text-green-600 hover:text-green-700 font-semibold">
                    Farm Owner
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/admin/register" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerRegister;
