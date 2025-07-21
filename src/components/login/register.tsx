"use client"
import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaTint, FaEye, FaEyeSlash, FaCalendar, FaWeight, FaRuler, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  bloodType: string;
  dob: string;
  age: number;
  gender: string;
  weight: string;
  height: string;
  country: string;
  state: string;
  city: string;
  isAvailable: boolean | null;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  bloodType?: string;
  dob?: string;
  gender?: string;
  weight?: string;
  height?: string;
  country?: string;
  state?: string;
  city?: string;
}

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodType: '',
    dob: '',
    age: 0,
    gender: '',
    weight: '',
    height: '',
    country: '',
    state: '',
    city: '',
    isAvailable: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state && formData.country) {
      const stateCities = City.getCitiesOfState(formData.country, formData.state);
      setCities(stateCities);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state, formData.country]);

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const isEligibleDonor = (age: number) => {
    return age >= 18 && age <= 65;
  };

  const getCountryCode = (countryIso: string) => {
    if (!countryIso) return '';
    const country = Country.getCountryByCode(countryIso);
    return country ? country.phonecode : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'isAvailable') {
      setFormData({
        ...formData,
        isAvailable: value === 'true',
      });
      return;
    }
    if (name === 'phone') {
      // Only allow numbers and max 10 digits
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
      return;
    }
    if (name === 'dob') {
      const age = calculateAge(value);
      setFormData({
        ...formData,
        [name]: value,
        age: age
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
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
    if (!formData.bloodType) {
      newErrors.bloodType = 'Blood type is required';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dob);
      if (!isEligibleDonor(age)) {
        newErrors.dob = 'You must be between 18 and 65 years old to register as a donor';
      }
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    if (!formData.height) {
      newErrors.height = 'Height is required';
    } else if (isNaN(Number(formData.height)) || Number(formData.height) <= 0) {
      newErrors.height = 'Please enter a valid height';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
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
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
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
          setError(err.message || 'Registration failed. Please try again.');
        } else {
          setError('Registration failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSignupMessage = () => {
    if (formData.dob) {
      const age = calculateAge(formData.dob);
      if (!isEligibleDonor(age)) {
        return 'You are not eligible to be a donor. Please sign up as a regular user.';
      }
    }
    return 'Want to create a regular account?';
  };

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
            Register as a Donor
          </h2>
          <div className="mt-2 text-center space-y-2">
            <p className="text-sm text-gray-600">
              {getSignupMessage()}{' '}
              <button
                onClick={() => router.push('/signup')}
                className="font-semibold text-primary hover:text-primary/80 cursor-pointer"
              >
                Sign up
              </button>
            </p>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-semibold text-primary hover:text-primary/80 cursor-pointer"
              >
                Login
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
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.confirmPassword ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 left-10 flex items-center text-gray-500 text-sm pl-1 pr-1">
                {formData.country && `+${getCountryCode(formData.country)}`}
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-20 border ${
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

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaTint className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="bloodType"
                name="bloodType"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.bloodType ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary cursor-pointer focus:z-10 sm:text-sm`}
                value={formData.bloodType}
                onChange={handleChange}
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.dob ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Date of Birth"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaWeight className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="weight"
                name="weight"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.weight ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaRuler className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="height"
                name="height"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  errors.height ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="Height (cm)"
                value={formData.height}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="country"
                name="country"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border cursor-pointer ${
                  errors.country ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="state"
                name="state"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border cursor-pointer ${
                  errors.state ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                value={formData.state}
                onChange={handleChange}
              >
                <option value="">Select state</option>
                {states.map(state => (
                  <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="city"
                name="city"
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border cursor-pointer ${
                  errors.city ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                value={formData.city}
                onChange={handleChange}
              >
                <option value="">Select city</option>
                {cities.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="gender"
                name="gender"
                required 
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border cursor-pointer ${
                  errors.gender ? 'border-primary' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Are you currently available to donate blood?</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="isAvailable"
                    value="true"
                    checked={formData.isAvailable === true}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="isAvailable"
                    value="false"
                    checked={formData.isAvailable === false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-full cursor-pointer text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-md transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          {/* Error message below the button */}
          {Object.keys(errors).length > 0 && (
            <div className="text-red-500 text-sm text-center mt-4">
              Please fill out all required fields correctly.
            </div>
          )}
          {(errors.dob || error) && (
            <div className="text-red-500 text-sm text-center mt-4">
              {errors.dob ? errors.dob : error}
            </div>
          )}
        </form>
      </div>
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-red-200/80 via-white/80 to-red-400/80 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow text-green-600 text-lg font-semibold">
            Registration successful!
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;