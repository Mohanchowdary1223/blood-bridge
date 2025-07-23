"use client"

import React, { useState, useEffect } from 'react';
import { IUser } from '@/models/User';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { ArrowLeft, User, Mail, Phone, Edit, Save, X, Heart, Droplet, CalendarIcon, Weight, Ruler, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from "@/components/ui/calendar"

const signupReasons = [
  { value: 'donateLater', label: 'I will register and donate blood later' },
  { value: 'healthIssue', label: 'Health issue or some bad habit' },
  { value: 'underAge', label: 'Under age (below 18)' },
  { value: 'aboveAge', label: 'Above age (over 65)' }
];

interface DonateLaterProfileProps {
  user: IUser;
  onUserUpdate: (user: IUser) => void;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  onSignupReasonChange?: (newReason: string) => void;
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-CA") // YYYY-MM-DD format for input[type="date"]
}

export const DonateLaterProfile: React.FC<DonateLaterProfileProps> = ({ 
  user, 
  onUserUpdate, 
  editMode, 
  setEditMode, 
  onSignupReasonChange 
}) => {
  const [editData, setEditData] = useState({
    name: user.name,
    phone: user.phone
  });
  const [signupReason, setSignupReason] = useState(user.signupReason || 'donateLater');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showSaveLivesModal, setShowSaveLivesModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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
    name: editData.name || '',
    email: user.email || '',
    phone: editData.phone || '',
    bloodType: '',
    dob: '',
    gender: '',
    weight: '',
    height: '',
    country: '',
    state: '',
    city: '',
    isAvailable: null,
  });
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [donorFormErrors, setDonorFormErrors] = useState<{[key: string]: string}>({});

  const router = useRouter();

  useEffect(() => {
    setCountries(Country.getAllCountries());
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
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSignupReasonChange = (value: string) => {
    if (value !== signupReason) {
      if (onSignupReasonChange) {
        onSignupReasonChange(value);
      } else {
        setSignupReason(value);
      }
    }
  };

  const handleDonorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDonorFormData({ ...donorFormData, [name]: value });
  };

  const handleDonorSelectChange = (name: string, value: string) => {
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
        role: user.role
      };
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
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLives = () => {
    setShowSaveLivesModal(true);
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
    try {
      const updatePayload = {
        userId: user._id,
        ...editData,
        ...donorFormData,
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
      setShowSaveLivesModal(false);
      onUserUpdate(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      {/* Fixed Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/home')}
        className="fixed top-14 md:top-24 left-6 h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
      </Button>

      <div className="container mx-auto max-w-4xl">
        {/* Main Profile Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm mb-6">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">{user.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">Future Donor Profile</CardDescription>
                  </div>
                </div>
              </div>
              {!editMode && (
                <Button
                  onClick={handleEdit}
                  className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success/Error Mdateessages */}
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

            {/* Ready to Donate Call-to-Action */}
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Ready to Donate?</h3>
                    <p className="text-green-700 mb-4">
                      You can become a donor anytime! Click "Save Lives" to register as a blood donor and start making a difference.
                    </p>
                    <Button
                      onClick={handleSaveLives}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save Lives Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    className="h-12 border-gray-200 focus:border-green-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {user.name}
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
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
              <div className="space-y-2 md:col-span-2">
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
                    className="h-12 border-gray-200 focus:border-green-500"
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
                  className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
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
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
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
                <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 cursor-pointer">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Lives Modal */}
      <Dialog open={showSaveLivesModal} onOpenChange={setShowSaveLivesModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <Heart className="w-6 h-6" />
              Become a Blood Donor
            </DialogTitle>
            <DialogDescription>
              Fill out this form to register as a blood donor and start saving lives today.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-green-500 pl-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    name="name"
                    value={donorFormData.name}
                    onChange={handleDonorFormChange}
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
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    value={donorFormData.email}
                    onChange={handleDonorFormChange}
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

            {/* Contact & Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">Contact & Medical</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-xs text-blue-600 font-medium">
                      {donorFormData.country && `+${getCountryCode(donorFormData.country)}`}
                    </div>
                    <Input
                      name="phone"
                      value={donorFormData.phone}
                      onChange={handleDonorFormChange}
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
                  <Label className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    Blood Type
                  </Label>
                  <Select value={donorFormData.bloodType} onValueChange={(value) => handleDonorSelectChange('bloodType', value)}>
                    <SelectTrigger className={`h-12 cursor-pointer ${donorFormErrors.bloodType ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
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
                  {donorFormErrors.bloodType && <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {donorFormErrors.bloodType}
                  </p>}
                </div>
              </div>
            </div>

            {/* Physical Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-purple-500 pl-3">Physical Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of Birth with Calendar */}
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
                  <Label className="flex items-center gap-2">
                    <Weight className="w-4 h-4" />
                    Weight (kg)
                  </Label>
                  <Input
                    name="weight"
                    type="number"
                    value={donorFormData.weight}
                    onChange={handleDonorFormChange}
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
                  <Label className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Height (cm)
                  </Label>
                  <Input
                    name="height"
                    type="number"
                    value={donorFormData.height}
                    onChange={handleDonorFormChange}
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
                <Select value={donorFormData.gender} onValueChange={(value) => handleDonorSelectChange('gender', value)}>
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

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-orange-500 pl-3">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Country
                  </Label>
                  <Select value={donorFormData.country} onValueChange={(value) => handleDonorSelectChange('country', value)}>
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
                  <Select value={donorFormData.state} onValueChange={(value) => handleDonorSelectChange('state', value)} disabled={!donorFormData.country}>
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
                  <Select value={donorFormData.city} onValueChange={(value) => handleDonorSelectChange('city', value)} disabled={!donorFormData.state}>
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

            {/* Availability */}
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

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
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
              <Button
                onClick={() => setShowSaveLivesModal(false)}
                variant="outline"
                disabled={loading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
