"use client"
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Droplet, Eye, EyeOff, CalendarIcon, Weight, Ruler, MapPin, ArrowLeft, Droplets, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { motion, AnimatePresence } from 'framer-motion';

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

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-CA") // YYYY-MM-DD format for input[type="date"]
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
  
  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Search states for location
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  
  // Popover states
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

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

  // Filter functions for search
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredStates = states.filter(state => 
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Get display names
  const getSelectedCountryName = () => {
    const country = countries.find(c => c.isoCode === formData.country);
    return country?.name || '';
  };

  const getSelectedStateName = () => {
    const state = states.find(s => s.isoCode === formData.state);
    return state?.name || '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
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
      // Update calendar date
      if (value) {
        setSelectedDate(new Date(value));
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    const dateString = formatDate(date);
    setFormData({
      ...formData,
      dob: dateString,
      age: date ? calculateAge(dateString) : 0
    });
    setShowCalendar(false);
  };

  const handleSelectChange = (name: string, value: string) => {
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
        }, 500);
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
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-3xl space-y-8">
        {/* Back Button - Fixed Position */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="fixed top-16 md:top-24 left-2 md:left-2 h-10 md:h-10 w-10 md:w-10 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
          </Button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 h-2"></div>
            
            <CardHeader className="space-y-6 pb-8 pt-8">
              {/* Logo */}
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center">
                    <Droplets className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-600 rounded-3xl blur opacity-25"></div>
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center space-y-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Become a Donor
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Join our community and save lives together
                </CardDescription>
              </motion.div>

              {/* Navigation Links */}
              <motion.div 
                className="text-center space-y-2 bg-gray-50/50 rounded-xl p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <p className="text-sm text-muted-foreground">
                  {getSignupMessage()}{' '}
                  <Button
                    variant="link"
                    onClick={() => router.push('/signup')}
                    className="p-0 h-auto text-red-600 hover:text-red-700 font-semibold cursor-pointer transition-colors"
                  >
                    Sign up
                  </Button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    onClick={() => router.push('/login')}
                    className="p-0 h-auto text-red-600 hover:text-red-700 font-semibold cursor-pointer transition-colors"
                  >
                    Login
                  </Button>
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Personal Information Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-red-500 pl-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          className={`pl-10 h-12 transition-all duration-200 ${errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.fullName && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.fullName}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className={`pl-10 h-12 transition-all duration-200 ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* Security Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          className={`pl-10 pr-12 h-12 transition-all duration-200 ${errors.password ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-10 w-10 cursor-pointer hover:bg-red-50"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          className={`pl-10 h-12 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.confirmPassword && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* Contact & Medical Information */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3">Contact & Medical</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <div className="absolute left-10 top-3 text-xs text-blue-600 font-medium">
                          {formData.country && `+${getCountryCode(formData.country)}`}
                        </div>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Phone Number"
                          className={`pl-20 h-12 transition-all duration-200 ${errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.phone && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.phone}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Blood Type */}
                    <div className="space-y-2">
                      <Label htmlFor="bloodType" className="text-sm font-medium text-gray-700">Blood Type</Label>
                      <div className="relative group">
                        <Droplet className="absolute left-3 top-3 h-4 w-4 text-red-500 z-10" />
                        <Select value={formData.bloodType} onValueChange={(value) => handleSelectChange('bloodType', value)}>
                          <SelectTrigger className={`pl-10 min-w-full h-12 cursor-pointer transition-all duration-200 ${errors.bloodType ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'}`}>
                            <SelectValue placeholder="Select Blood Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-0">
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                              <SelectItem key={type} value={type} className="cursor-pointer hover:bg-red-50 focus:bg-red-50">
                                <span className="flex items-center gap-2">
                                  {type}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <AnimatePresence>
                        {errors.bloodType && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.bloodType}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* Physical Details */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-purple-500 pl-3">Physical Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Date of Birth with Calendar */}
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="text-sm font-medium text-gray-700">Date of Birth</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCalendar(!showCalendar)}
                          className={`w-full justify-start text-left font-normal h-12 pl-10 pr-3 cursor-pointer transition-all duration-200 ${
                            !formData.dob && "text-muted-foreground"
                          } ${errors.dob ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-red-300 focus:border-red-500'}`}
                        >
                          {formData.dob ? (
                            new Date(formData.dob).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          ) : (
                            "Select date of birth"
                          )}
                        </Button>
                        
                        <AnimatePresence>
                          {showCalendar && (
                            <motion.div 
                              className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg border border-gray-200 p-4"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                className="rounded-md bg-white border-0"
                                captionLayout="dropdown"
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <AnimatePresence>
                        {errors.dob && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.dob}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium text-gray-700">Weight (kg)</Label>
                      <div className="relative group">
                        <Weight className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="weight"
                          name="weight"
                          type="text"
                          placeholder="Weight in kg"
                          className={`pl-10 h-12 transition-all duration-200 ${errors.weight ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                          value={formData.weight}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.weight && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.weight}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Height */}
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm font-medium text-gray-700">Height (cm)</Label>
                      <div className="relative group">
                        <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="height"
                          name="height"
                          type="text"
                          placeholder="Height in cm"
                          className={`pl-10 h-12 transition-all duration-200 ${errors.height ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} focus:ring-red-500/20`}
                          value={formData.height}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <AnimatePresence>
                        {errors.height && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.height}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                        <SelectTrigger className={`pl-10 h-12 cursor-pointer transition-all duration-200 ${errors.gender ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'}`}>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-0">
                          {['Male', 'Female', 'Other'].map((gender) => (
                            <SelectItem key={gender} value={gender} className="cursor-pointer hover:bg-red-50 focus:bg-red-50">
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <AnimatePresence>
                      {errors.gender && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-red-500 flex items-center gap-1"
                        >
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.gender}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Location Information with Searchable Dropdowns */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-orange-500 pl-3">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country with Search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        Country
                      </Label>
                      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={countryOpen}
                            className={`w-full justify-between h-12 ${errors.country ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} cursor-pointer`}
                          >
                            {getSelectedCountryName() || "Select Country"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search country..." 
                              value={countrySearch}
                              onValueChange={setCountrySearch}
                            />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {filteredCountries.map((country) => (
                                <CommandItem
                                  key={country.isoCode}
                                  value={country.name}
                                  onSelect={() => {
                                    handleSelectChange('country', country.isoCode);
                                    setCountryOpen(false);
                                    setCountrySearch('');
                                  }}
                                  className="cursor-pointer"
                                >
                                  {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <AnimatePresence>
                        {errors.country && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.country}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* State with Search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">State</Label>
                      <Popover open={stateOpen} onOpenChange={setStateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={stateOpen}
                            disabled={!formData.country}
                            className={`w-full justify-between h-12 ${errors.state ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} cursor-pointer disabled:cursor-not-allowed`}
                          >
                            {getSelectedStateName() || "Select State"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search state..." 
                              value={stateSearch}
                              onValueChange={setStateSearch}
                            />
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {filteredStates.map((state) => (
                                <CommandItem
                                  key={state.isoCode}
                                  value={state.name}
                                  onSelect={() => {
                                    handleSelectChange('state', state.isoCode);
                                    setStateOpen(false);
                                    setStateSearch('');
                                  }}
                                  className="cursor-pointer"
                                >
                                  {state.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <AnimatePresence>
                        {errors.state && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.state}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* City with Search */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">City</Label>
                      <Popover open={cityOpen} onOpenChange={setCityOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={cityOpen}
                            disabled={!formData.state}
                            className={`w-full justify-between h-12 ${errors.city ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-red-500'} cursor-pointer disabled:cursor-not-allowed`}
                          >
                            {formData.city || "Select City"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search city..." 
                              value={citySearch}
                              onValueChange={setCitySearch}
                            />
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {filteredCities.map((city) => (
                                <CommandItem
                                  key={city.name}
                                  value={city.name}
                                  onSelect={() => {
                                    handleSelectChange('city', city.name);
                                    setCityOpen(false);
                                    setCitySearch('');
                                  }}
                                  className="cursor-pointer"
                                >
                                  {city.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <AnimatePresence>
                        {errors.city && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.city}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* Availability */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-indigo-500 pl-3">Donation Availability</h3>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 sm:p-6">
                    <Label className="text-sm font-medium text-gray-700 mb-4 block">Are you currently available to donate blood?</Label>
                    <RadioGroup 
                      value={formData.isAvailable?.toString()} 
                      onValueChange={(value) => setFormData({...formData, isAvailable: value === 'true'})}
                      className="flex flex-col sm:flex-row gap-3 sm:gap-8"
                    >
                      <motion.div 
                        className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 border border-gray-100 transition-all cursor-pointer w-full sm:w-auto"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RadioGroupItem value="true" id="yes" className="cursor-pointer text-green-600 flex-shrink-0" />
                        <Label htmlFor="yes" className="cursor-pointer text-sm font-medium text-gray-700 flex-1">Yes, I'm available</Label>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 border border-gray-100 transition-all cursor-pointer w-full sm:w-auto"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RadioGroupItem value="false" id="no" className="cursor-pointer text-gray-600 flex-shrink-0" />
                        <Label htmlFor="no" className="cursor-pointer text-sm font-medium text-gray-700 flex-1">Not available now</Label>
                      </motion.div>
                    </RadioGroup>
                  </div>
                </motion.div>

                {/* Error Alerts */}
                <AnimatePresence>
                  {Object.keys(errors).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
                        <AlertDescription className="text-red-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Please fill out all required fields correctly to continue.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
                        <AlertDescription className="text-red-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div 
                  className="pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white font-bold text-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating your account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-5 h-5" />
                        <span>Register as Donor</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 border-0 bg-white max-w-md w-full mx-4 rounded-2xl">
                <div className="text-center">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <motion.div 
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to BloodBridge!</h3>
                  <p className="text-gray-600 text-lg mb-4">Registration successful!</p>
                  <p className="text-sm text-muted-foreground">Redirecting you to your dashboard...</p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Register;
