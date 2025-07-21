"use client"
import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  signupReason: string;
  dateOfBirth?: string;
  currentAge?: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  signupReason?: string;
  dateOfBirth?: string;
}

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    signupReason: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numbers and max 10 digits
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate age when date of birth changes
    if (name === 'dateOfBirth' && value) {
      const dobDate = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dobDate.getFullYear();
      const monthDiff = now.getMonth() - dobDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      const calculatedAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < dobDate.getDate()) 
        ? age - 1 
        : age;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        currentAge: calculatedAge.toString()
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!formData.signupReason) {
      newErrors.signupReason = 'Please select a reason for signing up';
    }
    if (formData.signupReason === 'underAge' && !formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required for under age';
    }
    if (formData.signupReason === 'aboveAge' && !formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required for above age';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.fullName,
            phone: formData.phone,
            signupReason: formData.signupReason,
            dateOfBirth: formData.dateOfBirth,
            currentAge: formData.currentAge
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/home');
        }, 2000);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Signup failed. Please try again.');
        } else {
          setError('Signup failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const signupReasons = [
    { value: 'donateLater', label: 'I will register and donate blood later' },
    { value: 'healthIssue', label: 'Health issue or some bad habit' },
    { value: 'underAge', label: 'Under age (below 18)' },
    { value: 'aboveAge', label: 'Above age (over 65)' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl relative">
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 cursor-pointer bg-white p-2 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Go to home page"
        >
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-primary">
            Create your account
          </h2>
          <div className="mt-2 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-semibold text-primary hover:text-primary/80 cursor-pointer"
              >
                Sign in
              </button>
            </p>
            <p className="text-sm text-gray-600">
              Want to donate blood?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-semibold text-green-600 hover:text-green-500 cursor-pointer"
              >
                Register as Donor
              </button>
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.fullName ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.email ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border ${
                  errors.password ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-20" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.confirmPassword ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.phone ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Sign Up
              </label>
              <div className="space-y-4">
                {signupReasons.map((reason) => (
                  <div key={reason.value} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      id={reason.value}
                      name="signupReason"
                      value={reason.value}
                      checked={formData.signupReason === reason.value}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="ml-3">
                      <label htmlFor={reason.value} className="block text-sm font-medium text-gray-900 cursor-pointer">
                        {reason.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.signupReason && (
                <p className="text-red-500 text-xs mt-1">{errors.signupReason}</p>
              )}
            </div>

            {(formData.signupReason === 'underAge' || formData.signupReason === 'aboveAge') && (
              <div className="grid grid-cols-1 gap-2">
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className={`appearance-none relative block w-full px-3 py-3 border ${errors.dateOfBirth ? 'border-primary' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                )}
                {formData.dateOfBirth && (
                  <div className="text-sm text-gray-700 mt-1">Current Age: <span className="font-semibold">{formData.currentAge || ''}</span></div>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-full text-white cursor-pointer ${
                isLoading ? 'bg-primary/50' : 'bg-primary hover:bg-primary/80'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-md transition-all duration-200`}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
            {/* Error message below the button */}
            {Object.keys(errors).length > 0 && (
              <div className="text-red-500 text-sm text-center mt-4">
                Please fill out all required fields correctly.
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center mt-4">
                {error}
              </div>
            )}
          </div>
        </form>
      </div>
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-red-200/80 via-white/80 to-red-400/80 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow text-green-600 text-lg font-semibold">
            Signup successful!
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
