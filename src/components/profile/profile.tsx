"use client"

import React, { useState, useEffect } from 'react';
import { IUser as ImportedIUser } from '@/models/User';
import { ArrowLeft, User, Mail, Phone, Droplet, Calendar, Weight, Ruler, MapPin, Edit, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Extend IUser locally to include isAvailable
interface IUser extends ImportedIUser {
  isAvailable?: boolean;
}

const signupReasons = [
  { value: 'donateLater', label: 'I will register and donate blood later' },
  { value: 'healthIssue', label: 'Health issue or some bad habit' },
  { value: 'underAge', label: 'Under age (below 18)' },
  { value: 'aboveAge', label: 'Above age (over 65)' }
];

interface ProfileDetailsProps {
  user: IUser;
  onUserUpdate: (user: IUser) => void;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  onSignupReasonChange?: (newReason: string) => void;
}

// DonorProfileDetails: for donor users
export const DonorProfileDetails: React.FC<ProfileDetailsProps> = ({ user, onUserUpdate, editMode, setEditMode }) => {
  const [donorData, setDonorData] = useState<{
    bloodType?: string;
    dob?: string;
    gender?: string;
    weight?: string;
    height?: string;
    country?: string;
    state?: string;
    city?: string;
    isAvailable?: boolean | null;
  } | null>(null);
  const [editData, setEditData] = useState<{
    name: string;
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
    name: user.name,
    phone: user.phone,
    bloodType: user.bloodType === 'unknown' ? "I don't know my blood type" : user.bloodType || '',
    dob: '',
    gender: '',
    weight: '',
    height: '',
    country: '',
    state: '',
    city: '',
    isAvailable: null,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [prevCountry, setPrevCountry] = useState('');
  const [prevState, setPrevState] = useState('');

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (editData.country) {
      setStates(State.getStatesOfCountry(editData.country));
      if (editData.country !== prevCountry) {
        setEditData(prev => ({ ...prev, state: '', city: '' }));
      }
      setPrevCountry(editData.country);
    }
  }, [editData.country]);

  useEffect(() => {
    if (editData.state && editData.country) {
      setCities(City.getCitiesOfState(editData.country, editData.state));
      if (editData.state !== prevState) {
        setEditData(prev => ({ ...prev, city: '' }));
      }
      setPrevState(editData.state);
    }
  }, [editData.state, editData.country]);

  // Fetch donor data when component mounts
  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const response = await fetch(`/api/donors/${user._id}`);
        if (response.ok) {
          const data = await response.json();
          setDonorData(data.donor);
          setEditData(prev => ({
            ...prev,
            bloodType: data.donor.bloodType || '',
            dob: data.donor.dob || '',
            gender: data.donor.gender || '',
            weight: data.donor.weight || '',
            height: data.donor.height || '',
            country: data.donor.country || '',
            state: data.donor.state || '',
            city: data.donor.city || '',
            isAvailable: data.donor.isAvailable,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch donor data:', error);
      }
    };

    if (user.role === 'donor') {
      fetchDonorData();
    }
  }, [user._id, user.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditData({ ...editData, [name]: value });
  };

  const handleEdit = () => {
    setEditMode(true);
    setMsg('');
    setErr('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData({
      name: user.name,
      phone: user.phone,
      bloodType: donorData?.bloodType || '',
      dob: donorData?.dob || '',
      gender: donorData?.gender || '',
      weight: donorData?.weight || '',
      height: donorData?.height || '',
      country: donorData?.country || '',
      state: donorData?.state || '',
      city: donorData?.city || '',
      isAvailable: donorData?.isAvailable ?? null,
    });
    setMsg('');
    setErr('');
  };

  const validateDonorFields = () => {
    const requiredFields = [
      'bloodType', 'dob', 'gender', 'weight', 'height', 'country', 'state', 'city'
    ];
    for (const field of requiredFields) {
      if (!editData[field as keyof typeof editData] || editData[field as keyof typeof editData] === '') {
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    setMsg('');
    setErr('');
    if (!validateDonorFields()) {
      setErr('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const updatePayload: Record<string, unknown> = { userId: user._id, ...editData, role: 'donor' };
      const res = await fetch('/api/profile/edit-donate-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMsg('Profile updated!');
      setEditMode(false);
      onUserUpdate(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      const donorResponse = await fetch(`/api/donors/${user._id}`);
      if (donorResponse.ok) {
        const donorData = await donorResponse.json();
        setDonorData(donorData.donor);
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const getCountryCode = (countryIso: string) => {
    if (!countryIso) return '';
    const country = Country.getCountryByCode(countryIso);
    return country ? country.phonecode : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      {/* Fixed Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/home')}
        className="fixed top-14 md:top-24 left-6 h-12 w-12 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
      </Button>

      <div className="container mx-auto max-w-4xl">
        <Card className="border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">{user.name.slice(0, 1).toUpperCase()}{user.name.slice(1)}</CardTitle>
                    <CardDescription className="text-muted-foreground">Donor Profile</CardDescription>
                  </div>
                </div>
              </div>
              {!editMode && (
                <Button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success/Error Messages */}
            {msg && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{msg}</AlertDescription>
              </Alert>
            )}
            {err && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{err}</AlertDescription>
              </Alert>
            )}

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                {editMode ? (
                  <Input
                    id="name"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="h-12 border-gray-200 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {user.name.slice(0, 1).toUpperCase()}{user.name.slice(1)}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                  {user.email}
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-xs text-blue-600 font-medium z-10">
                    {donorData?.country && `+${getCountryCode(donorData.country)}`}
                  </div>
                  {editMode ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                      className="h-12 pl-16 border-gray-200 focus:border-blue-500"
                      placeholder="Phone number"
                    />
                  ) : (
                    <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center pl-16">
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Blood Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Blood Type
                </Label>
                {editMode ? (
                  <Select value={editData.bloodType} onValueChange={(value) => handleSelectChange('bloodType', value)}>
                    <SelectTrigger className="h-12 border-gray-200 cursor-pointer min-w-full">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                        <SelectItem key={type} value={type} className="cursor-pointer">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.bloodType || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </Label>
                {editMode ? (
                  <Input
                    name="dob"
                    type="date"
                    value={editData.dob}
                    onChange={handleChange}
                    className="h-12 border-gray-200 focus:border-blue-500"
                  />
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.dob || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Gender
                </Label>
                {editMode ? (
                  <Select value={editData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger className="h-12 border-gray-200 min-w-full cursor-pointer">
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
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.gender || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  Weight (kg)
                </Label>
                {editMode ? (
                  <Input
                    name="weight"
                    type="number"
                    value={editData.weight}
                    onChange={handleChange}
                    className="h-12 border-gray-200 focus:border-blue-500"
                    placeholder="Weight in kg"
                    min="40"
                    max="150"
                  />
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.weight || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Height (cm)
                </Label>
                {editMode ? (
                  <Input
                    name="height"
                    type="number"
                    value={editData.height}
                    onChange={handleChange}
                    className="h-12 border-gray-200 focus:border-blue-500"
                    placeholder="Height in cm"
                    min="100"
                    max="250"
                  />
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.height || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Country
                </Label>
                {editMode ? (
                  <Select value={editData.country} onValueChange={(value) => handleSelectChange('country', value)}>
                    <SelectTrigger className="h-12 min-w-full border-gray-200 cursor-pointer">
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
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.country || 'Not specified'}
                  </div>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">State</Label>
                {editMode ? (
                  <Select value={editData.state} onValueChange={(value) => handleSelectChange('state', value)} disabled={!editData.country}>
                    <SelectTrigger className="h-12 min-w-full border-gray-200 cursor-pointer">
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
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.state || 'Not specified'}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">City</Label>
                {editMode ? (
                  <Select value={editData.city} onValueChange={(value) => handleSelectChange('city', value)} disabled={!editData.state}>
                    <SelectTrigger className="h-12 min-w-full border-gray-200 cursor-pointer">
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
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {donorData?.city || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="col-span-1 md:col-span-2 space-y-3">
                <Label className="text-sm font-medium text-gray-700">Are you currently available to donate blood?</Label>
                {editMode ? (
                  <RadioGroup 
                    value={editData.isAvailable?.toString()} 
                    onValueChange={(value) => setEditData({...editData, isAvailable: value === 'true'})}
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
                ) : (
                  <div className={`h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center font-semibold ${
                    donorData?.isAvailable === true ? 'text-green-600' : 
                    donorData?.isAvailable === false ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {donorData?.isAvailable === null ? 'Not selected' : donorData?.isAvailable ? 'Yes, available' : 'Not available'}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Mode Action Buttons */}
            {editMode && (
              <div className="flex flex-row  gap-4 pt-6 border-t justify-center items-center">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// UserProfileDetails: for non-donor users
export const UserProfileDetails: React.FC<ProfileDetailsProps> = ({ user, onUserUpdate, editMode, setEditMode, onSignupReasonChange }) => {
  const [editData, setEditData] = useState({
    name: user.name,
    phone: user.phone
  });
  const [signupReason, setSignupReason] = useState(user.signupReason || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSignupReasonChange = (value: string) => {
    const newReason = value;
    if (newReason !== signupReason) {
      if (onSignupReasonChange) {
        onSignupReasonChange(newReason);
      } else {
        setSignupReason(newReason);
      }
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setMsg('');
    setErr('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData({
      name: user.name,
      phone: user.phone
    });
    setMsg('');
    setErr('');
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      const updatePayload: Record<string, unknown> = { 
        userId: user._id, 
        ...editData, 
        signupReason,
        role: 'user' 
      };
      const res = await fetch('/api/profile/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMsg('Profile updated!');
      setEditMode(false);
      onUserUpdate(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      {/* Fixed Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/home')}
        className="fixed top-14 md:top-24 left-6 h-12 w-12 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
      </Button>

      <div className="container mx-auto max-w-4xl pt-20 space-y-6">
        {/* Main Profile Card */}
        <Card className="border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">{user.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">User Profile</CardDescription>
                  </div>
                </div>
              </div>
              {!editMode && (
                <Button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success/Error Messages */}
            {msg && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{msg}</AlertDescription>
              </Alert>
            )}
            {err && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{err}</AlertDescription>
              </Alert>
            )}

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                {editMode ? (
                  <Input
                    id="name"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="h-12 border-gray-200 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {user.name}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                  {user.email}
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                {editMode ? (
                  <Input
                    id="phone"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    className="h-12 border-gray-200 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {user.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Mode Action Buttons */}
            {editMode && (
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signup Reason Card */}
        <Card className="border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Signup Information</CardTitle>
            <CardDescription>
              Your reason for joining BloodBridge community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="signupReason" className="text-sm font-medium text-gray-700">
                Why did you sign up?
              </Label>
              <Select
                value={signupReason}
                onValueChange={handleSignupReasonChange}
                disabled={editMode || loading}
              >
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 cursor-pointer">
                  <SelectValue placeholder="Select your reason" />
                </SelectTrigger>
                <SelectContent>
                  {signupReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value} className="cursor-pointer">
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!editMode && (
                <Button
                  onClick={handleSave}
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Update Signup Reason'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
