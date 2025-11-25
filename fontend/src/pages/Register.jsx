import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Building2, UserPlus, CheckCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Verify Code, 3: Personal Info, 4: Farm Info
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    farmType: '',
    farmSize: '',
    location: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const farmTypes = [
    'Crop Farming',
    'Livestock',
    'Dairy Farm',
    'Poultry Farm',
    'Mixed Farming',
    'Organic Farm',
    'Other'
  ];

  useEffect(() => {
    if (timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerSeconds]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email' });
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
        alert('Verification code sent to your email!');
      } else {
        setErrors({ email: data.message });
      }
    } catch (err) {
      setErrors({ email: 'Failed to send code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setErrors({ verificationCode: 'Please enter the verification code' });
      return;
    }

    if (formData.verificationCode.length !== 6) {
      setErrors({ verificationCode: 'Code must be 6 digits' });
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
      } else {
        setErrors({ verificationCode: data.message });
      }
    } catch (err) {
      setErrors({ verificationCode: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    
    if (!formData.farmName.trim()) {
      newErrors.farmName = 'Farm name is required';
    }
    
    if (!formData.farmType) {
      newErrors.farmType = 'Please select farm type';
    }
    
    if (!formData.farmSize) {
      newErrors.farmSize = 'Farm size is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 2) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep4()) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          farmName: formData.farmName,
          farmType: formData.farmType,
          farmSize: formData.farmSize,
          location: formData.location
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! You can now login.');
        window.location.href = '/login';
      } else {
        setErrors({ submit: data.message });
      }
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Illustration */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-500 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                <UserPlus className="w-16 h-16" />
              </div>
              <h1 className="text-4xl font-bold mb-3">HELLO</h1>
              <h2 className="text-3xl font-bold mb-4">WELCOME</h2>
              <p className="text-lg opacity-90 mb-6">
                Join our Farm Management System
              </p>
              <p className="text-sm opacity-80 mb-8">
                Create an account and start managing your farm efficiently
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex justify-center items-center gap-2 mb-8">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= num ? 'bg-white text-blue-500' : 'bg-white/30'
                  } font-bold text-sm`}>
                    {step > num ? <CheckCircle className="w-5 h-5" /> : num}
                  </div>
                  {num < 4 && <div className={`w-8 h-0.5 ${step > num ? 'bg-white' : 'bg-white/30'}`}></div>}
                </div>
              ))}
            </div>
            
            {/* Step Labels */}
            <div className="text-xs space-y-1">
              <p className={step === 1 ? 'font-bold' : 'opacity-60'}>Step 1: Email Verification</p>
              <p className={step === 2 ? 'font-bold' : 'opacity-60'}>Step 2: Verify Code</p>
              <p className={step === 3 ? 'font-bold' : 'opacity-60'}>Step 3: Personal Info</p>
              <p className={step === 4 ? 'font-bold' : 'opacity-60'}>Step 4: Farm Details</p>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600 mb-8">
              {step === 1 && 'Enter your email to get started'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Enter your personal information'}
              {step === 4 && 'Tell us about your farm'}
            </p>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-6">
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="your@email.com"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Verify Code */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    maxLength="6"
                    className={`block w-full px-3 py-3 border ${
                      errors.verificationCode ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-bold`}
                    placeholder="000000"
                    disabled={loading}
                  />
                  {errors.verificationCode && <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>}
                  
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600">
                      Code sent to: <strong>{formData.email}</strong>
                    </p>
                    {timerSeconds > 0 && (
                      <p className="text-sm text-blue-600 mt-2">
                        Expires in: <strong>{formatTime(timerSeconds)}</strong>
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={timerSeconds > 540 || loading}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-2/3 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Info */}
            {step === 3 && (
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2.5 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Next Step
                </button>
              </form>
            )}

            {/* Step 4: Farm Info */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.farmName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Green Valley Farm"
                    />
                  </div>
                  {errors.farmName && <p className="mt-1 text-sm text-red-600">{errors.farmName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Type</label>
                  <select
                    name="farmType"
                    value={formData.farmType}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border ${errors.farmType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select farm type</option>
                    {farmTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.farmType && <p className="mt-1 text-sm text-red-600">{errors.farmType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (acres)</label>
                  <input
                    type="number"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border ${errors.farmSize ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="100"
                    min="0"
                  />
                  {errors.farmSize && <p className="mt-1 text-sm text-red-600">{errors.farmSize}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="City, State, Country"
                    />
                  </div>
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to the Terms & Conditions and Privacy Policy
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
