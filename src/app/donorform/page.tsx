"use client"

import React, { useState, useEffect } from 'react';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { User, Mail, Phone, Heart, Droplet, CalendarIcon, Weight, Ruler, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from 'next/navigation';

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-CA");
}

const DonorFormPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // Add access control state
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null);

  const [donorFormData, setDonorFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    bloodType: string;
    dob: string;
    gender: string;
    weight: string;
    height: string;
    country: string;
    state: string;
    city: string;
    isAvailable: boolean | null;
  }>({
    name: "",
    email: "",
    phone: "",
    bloodType: "",
    dob: "",
    gender: "",
    weight: "",
    height: "",
    country: "",
    state: "",
    city: "",
    isAvailable: null,
  });
  const [donorFormErrors, setDonorFormErrors] = useState<{[key: string]: string}>({});
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  const router = useRouter();


  // Load countries and user details on mount, restrict access to donateLater users
  useEffect(() => {
    setCountries(Country.getAllCountries());
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Block access if user is already a donor or not a donateLater user
        if (
          user.signupReason !== 'donateLater' ||
          user.role === 'donor' ||
          user.signupReason === 'donor'
        ) {
          setErr('You are not allowed to access this page.');
          setAccessAllowed(false);
          setTimeout(() => router.replace('/home'), 1500);
          return;
        }
        setAccessAllowed(true);
        setDonorFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bloodType: user.bloodType || '',
          dob: user.dob || '',
          gender: user.gender || '',
          weight: user.weight ? String(user.weight) : '',
          height: user.height ? String(user.height) : '',
          country: user.country || '',
          state: user.state || '',
          city: user.city || '',
          isAvailable: typeof user.isAvailable === 'boolean' ? user.isAvailable : null,
        }));
        if (user.dob) {
          setSelectedDate(new Date(user.dob));
        }
      } catch {
        setErr('Invalid user data. Please log in again.');
        setAccessAllowed(false);
        setTimeout(() => router.replace('/home'), 1500);
      }
    } else {
      setErr('You must be logged in to access this page.');
      setAccessAllowed(false);
      setTimeout(() => router.replace('/home'), 1500);
    }
  }, []);

  useEffect(() => {
    if (donorFormData.country) {
      setStates(State.getStatesOfCountry(donorFormData.country));
      setDonorFormData(prev => ({ ...prev, state: '', city: '' }));
    }
  }, [donorFormData.country]);

  useEffect(() => {
    if (donorFormData.state && donorFormData.country) {
      setCities(City.getCitiesOfState(donorFormData.country, donorFormData.state));
      setDonorFormData(prev => ({ ...prev, city: '' }));
    }
  }, [donorFormData.state, donorFormData.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDonorFormData({ ...donorFormData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setDonorFormData({ ...donorFormData, [name]: value });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    const dateString = formatDate(date);
    setDonorFormData({
      ...donorFormData,
      dob: dateString
    });
    setShowCalendar(false);
  };

  const validateDonorForm = () => {
    const errors: {[key: string]: string} = {};
    if (!donorFormData.name) errors.name = 'Name is required';
    if (!donorFormData.email) errors.email = 'Email is required';
    if (!donorFormData.phone) errors.phone = 'Phone is required';
    if (!donorFormData.bloodType) errors.bloodType = 'Blood type is required';
    if (!donorFormData.dob) errors.dob = 'Date of birth is required';
    if (!donorFormData.gender) errors.gender = 'Gender is required';
    if (!donorFormData.weight) errors.weight = 'Weight is required';
    if (!donorFormData.height) errors.height = 'Height is required';
    if (!donorFormData.country) errors.country = 'Country is required';
    if (!donorFormData.state) errors.state = 'State is required';
    if (!donorFormData.city) errors.city = 'City is required';
    setDonorFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDonorSubmit = async () => {
    if (!validateDonorForm()) return;
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      // Get userId from localStorage
      let userId = '';
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user._id || user.id || '';
        } catch {}
      }
      if (!userId) {
        setErr('User not found. Please log in again.');
        setLoading(false);
        return;
      }
      const updatePayload = {
        ...donorFormData,
        userId,
        role: 'donor',
        signupReason: 'donateLater'
      };
      const res = await fetch('/api/profile/edit-donate-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMsg('Congratulations! You are now a registered donor!');
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => router.push('/home'), 2000); // Redirect after success
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const getCountryCode = (countryIso: string) => {
    if (!countryIso) return '';
    const country = Country.getCountryByCode(countryIso);
    return country ? country.phonecode : '';
  };

  // Only render the form if accessAllowed is true
  if (accessAllowed === null) {
    // Still checking access, show nothing or a loader
    return null;
  }
  if (accessAllowed === false) {
    // Show nothing (redirect will happen)
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-green-700 mb-2">
            <Heart className="w-8 h-8" /> Become a Blood Donor
          </h1>
          <p className="max-w-2xl text-gray-500 text-lg">
            Fill out this form to register as a blood donor and start saving lives today.
          </p>
        </div>

        {msg && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <AlertDescription className="text-green-700">{msg}</AlertDescription>
          </Alert>
        )}
        {err && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-700">{err}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8 bg-white pt-8 pb-10 px-6 rounded-xl shadow-2xl mb-8 border border-gray-100">
          {/* ------ Personal Info ------ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-green-500 pl-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </Label>
                <Input
                  name="name"
                  value={donorFormData.name}
                  onChange={handleChange}
                  className={`h-12 ${donorFormErrors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-green-500'}`}
                  placeholder="Enter your full name"
                  required
                />
                {donorFormErrors.name && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.name}
                </p>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={donorFormData.email}
                  onChange={handleChange}
                  className={`h-12 ${donorFormErrors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-green-500'}`}
                  placeholder="Enter your email"
                  required
                />
                {donorFormErrors.email && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.email}
                </p>}
              </div>
            </div>
          </div>

          {/* ------ Contact & Medical ------ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">Contact & Medical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-xs text-blue-600 font-medium">
                    {donorFormData.country && `+${getCountryCode(donorFormData.country)}`}
                  </div>
                  <Input
                    name="phone"
                    value={donorFormData.phone}
                    onChange={handleChange}
                    className={`h-12 pl-16 ${donorFormErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-green-500'}`}
                    placeholder="Phone number"
                    maxLength={10}
                    required
                  />
                </div>
                {donorFormErrors.phone && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.phone}
                </p>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Droplet className="w-4 h-4" /> Blood Type</Label>
                <Select value={donorFormData.bloodType} onValueChange={(value) => handleSelectChange('bloodType', value)}>
                  <SelectTrigger className={`h-12 cursor-pointer ${donorFormErrors.bloodType ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <SelectItem key={type} value={type} className="cursor-pointer">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {donorFormErrors.bloodType && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.bloodType}
                </p>}
              </div>
            </div>
          </div>

          {/* ------ Physical Details ------ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-purple-500 pl-3">Physical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`w-full justify-start text-left font-normal h-12 pl-10 pr-3 cursor-pointer transition-all duration-200 hover:shadow-md focus:shadow-lg ${
                      !donorFormData.dob && "text-muted-foreground"
                    } ${donorFormErrors.dob ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-red-300 focus:border-red-500'}`}
                  >
                    {donorFormData.dob ? (
                      new Date(donorFormData.dob).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    ) : (
                      "Select date of birth"
                    )}
                  </Button>
                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
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
                    </div>
                  )}
                </div>
                {donorFormErrors.dob && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.dob}
                </p>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Weight className="w-4 h-4" /> Weight (kg)</Label>
                <Input
                  name="weight"
                  type="number"
                  value={donorFormData.weight}
                  onChange={handleChange}
                  className={`h-12 ${donorFormErrors.weight ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-green-500'}`}
                  placeholder="Weight in kg"
                  min="40"
                  max="150"
                  required
                />
                {donorFormErrors.weight && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.weight}
                </p>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Ruler className="w-4 h-4" /> Height (cm)</Label>
                <Input
                  name="height"
                  type="number"
                  value={donorFormData.height}
                  onChange={handleChange}
                  className={`h-12 ${donorFormErrors.height ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-green-500'}`}
                  placeholder="Height in cm"
                  min="100"
                  max="250"
                  required
                />
                {donorFormErrors.height && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.height}
                </p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={donorFormData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                <SelectTrigger className={`h-12 cursor-pointer ${donorFormErrors.gender ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <SelectItem key={gender} value={gender} className="cursor-pointer">
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {donorFormErrors.gender && <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {donorFormErrors.gender}
              </p>}
            </div>
          </div>

          {/* ------ Location ------ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-orange-500 pl-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Country</Label>
                <Select value={donorFormData.country} onValueChange={(value) => handleSelectChange('country', value)}>
                  <SelectTrigger className={`h-12 cursor-pointer ${donorFormErrors.country ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map(country => (
                      <SelectItem key={country.isoCode} value={country.isoCode} className="cursor-pointer">
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {donorFormErrors.country && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.country}
                </p>}
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={donorFormData.state} onValueChange={(value) => handleSelectChange('state', value)} disabled={!donorFormData.country}>
                  <SelectTrigger className={`h-12 cursor-pointer ${donorFormErrors.state ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {states.map(state => (
                      <SelectItem key={state.isoCode} value={state.isoCode} className="cursor-pointer">
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {donorFormErrors.state && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.state}
                </p>}
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={donorFormData.city} onValueChange={(value) => handleSelectChange('city', value)} disabled={!donorFormData.state}>
                  <SelectTrigger className={`h-12 cursor-pointer ${donorFormErrors.city ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map(city => (
                      <SelectItem key={city.name} value={city.name} className="cursor-pointer">
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {donorFormErrors.city && <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {donorFormErrors.city}
                </p>}
              </div>
            </div>
          </div>

          {/* ------ Availability ------ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-indigo-500 pl-3">Donation Availability</h3>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
              <Label className="text-sm font-medium text-gray-700 mb-4 block">Are you currently available to donate blood?</Label>
              <RadioGroup
                value={donorFormData.isAvailable?.toString()}
                onValueChange={(value) => setDonorFormData({...donorFormData, isAvailable: value === 'true'})}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="yes" className="cursor-pointer" />
                  <Label htmlFor="yes" className="cursor-pointer">Yes, I'm available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="no" className="cursor-pointer" />
                  <Label htmlFor="no" className="cursor-pointer">Not available now</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            onClick={handleDonorSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Registering...</span>
              </div>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Register as Donor
              </>
            )}
          </Button>
          <Button onClick={() => router.back()} type="button" variant="outline" className="cursor-pointer">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DonorFormPage;
