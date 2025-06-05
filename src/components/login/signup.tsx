"use client"
import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  signupReason: string;
  dateOfBirth?: string;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    }
    if (!formData.signupReason) {
      newErrors.signupReason = 'Please select a reason for signing up';
    }
    if (formData.signupReason === 'ageRestriction' && !formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required for age restriction';
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
        // Mock signup - store user data in localStorage
        const userData = {
          id: Date.now().toString(),
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          signupReason: formData.signupReason,
          dateOfBirth: formData.dateOfBirth
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Redirect to home page
        router.push('/home');
      } catch {
        setError('Signup failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <div className="mt-2 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-primary hover:text-primary/80 cursor-pointer"
              >
                Sign in
              </button>
            </p>
            <p className="text-sm text-gray-600">
              Want to donate blood?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-medium text-green-500 hover:text-green-400 cursor-pointer"
              >
                Register as Donor
              </button>
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
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
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                  errors.fullName ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
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
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                  errors.email ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
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
                className={`appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border ${
                  errors.password ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
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
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                  errors.confirmPassword ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
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
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border ${
                  errors.phone ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
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
                <div className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="donateLater"
                    name="signupReason"
                    value="donateLater"
                    checked={formData.signupReason === 'donateLater'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div className="ml-3">
                    <label htmlFor="donateLater" className="block text-sm font-medium text-gray-900">
                      I will register and donate blood later
                    </label>
                    <p className="text-sm text-gray-500">
                      Choose this option if you plan to donate blood in the future but want to create an account now.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="healthIssue"
                    name="signupReason"
                    value="healthIssue"
                    checked={formData.signupReason === 'healthIssue'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div className="ml-3">
                    <label htmlFor="healthIssue" className="block text-sm font-medium text-gray-900">
                      Health issue or some bad habit
                    </label>
                    <p className="text-sm text-gray-500">
                      Select this if you have any medical conditions or habits that prevent you from donating blood.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="ageRestriction"
                    name="signupReason"
                    value="ageRestriction"
                    checked={formData.signupReason === 'ageRestriction'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div className="ml-3">
                    <label htmlFor="ageRestriction" className="block text-sm font-medium text-gray-900">
                      Under age or above age
                    </label>
                    <p className="text-sm text-gray-500">
                      Choose this if you are either under 18 years old or above the maximum age limit for blood donation.
                    </p>
                  </div>
                </div>
              </div>
              {errors.signupReason && (
                <p className="text-red-500 text-xs mt-1">{errors.signupReason}</p>
              )}
            </div>

            {formData.signupReason === 'ageRestriction' && (
              <div>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.dateOfBirth ? 'border-primary' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-primary/50' : 'bg-primary hover:bg-primary/80'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
