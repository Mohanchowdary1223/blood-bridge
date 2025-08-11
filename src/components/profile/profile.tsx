"use client"

import React, { useState, useEffect } from 'react';
import { IUser as ImportedIUser } from '@/models/User';
import { ArrowLeft, User, Mail, Phone, Droplet, Calendar, Weight, Ruler, MapPin, Edit, Save, X, Heart, Calendar as CalendarIcon, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { motion, AnimatePresence } from 'framer-motion';

// Add interface for donation records
interface DonationRecord {
  units: number;
  [key: string]: unknown; // Allow other properties
}

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

  // Auto-hide success/error messages after 5 seconds (DonorProfileDetails)
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);
  useEffect(() => {
    if (err) {
      const timer = setTimeout(() => setErr(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [err]);

  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [prevCountry, setPrevCountry] = useState('');
  const [prevState, setPrevState] = useState('');
  
  // Search states for location
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  
  // Popover states
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  
  // NEW: Donation statistics state
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    totalLivesSaved: 0,
    totalUnits: 0
  });

  // NEW: Schedule Donation Dialog state
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduleErr, setScheduleErr] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');
  const [scheduledDateFromDb, setScheduledDateFromDb] = useState<string | null>(null);

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
    const country = countries.find(c => c.isoCode === editData.country);
    return country?.name || '';
  };

  const getSelectedStateName = () => {
    const state = states.find(s => s.isoCode === editData.state);
    return state?.name || '';
  };

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
          // Update main user object with backend bloodType if different
          if (data.donor.bloodType && data.donor.bloodType !== user.bloodType) {
            const updatedUser = { ...user, bloodType: data.donor.bloodType } as IUser;
            onUserUpdate(updatedUser as IUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        console.error('Failed to fetch donor data:', error);
      }
    };

    if (user.role === 'donor') {
      fetchDonorData();
    }
  }, [user._id, user.role]);

  // NEW: Fetch donation statistics
  useEffect(() => {
    const fetchDonationStats = async () => {
      try {
        const response = await fetch(`/api/donoralltypedata/stackdata?userId=${user._id}`);
        if (response.ok) {
          const data = await response.json();
          const donations = data.records || [];
          const totalDonations = donations.length;
          const totalUnits = donations.reduce((sum: number, d: DonationRecord) => sum + d.units, 0);
          const totalLivesSaved = totalUnits * 3;
          
          setDonationStats({
            totalDonations,
            totalLivesSaved,
            totalUnits
          });
        }
      } catch (error) {
        console.error('Failed to fetch donation stats:', error);
      }
    };

    if (user._id) {
      fetchDonationStats();
    }
  }, [user._id]);

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
    // Reset search states
    setCountrySearch('');
    setStateSearch('');
    setCitySearch('');
    setCountryOpen(false);
    setStateOpen(false);
    setCityOpen(false);
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
      // Reset search states
      setCountrySearch('');
      setStateSearch('');
      setCitySearch('');
      setCountryOpen(false);
      setStateOpen(false);
      setCityOpen(false);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // --- SCHEDULE DONATION LOGIC (NEW) ---
  // Only allow future dates (not today or before)
  const todayStr = new Date().toISOString().split('T')[0];
  const isValidFutureDate = (dateStr: string) => {
    if (!dateStr) return false;
    const selected = new Date(dateStr);
    const now = new Date();
    selected.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    // Only true if strictly greater than today
    return selected > now;
  };

  // Watch for manual change to unavailable and clear past scheduled date
  // Remove scheduled date ONLY when user is auto-updated to available (i.e., scheduled date reached)
  // Scheduled date is only used for auto-updating ONCE, then removed so user can set a new date
  useEffect(() => {
    if (scheduledDateFromDb) {
      const today = new Date();
      const scheduled = new Date(scheduledDateFromDb);
      today.setHours(0,0,0,0);
      scheduled.setHours(0,0,0,0);
      // If scheduled date is today or in the past and user is NOT available, auto-update to available and remove scheduled date
      if (scheduled <= today && donorData?.isAvailable !== true) {
        // Auto-update availability in backend
        fetch('/api/profile/edit-donate-later', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, isAvailable: true, role: 'donor' })
        }).then(() => {
          setDonorData(prev => prev ? { ...prev, isAvailable: true } : prev);
          setEditData(prev => ({ ...prev, isAvailable: true }));
          const updatedUser = { ...user, isAvailable: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          onUserUpdate(updatedUser as IUser);
          // Remove scheduled date in backend
          fetch('/api/donorscheduledonation', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id })
          }).then(() => {
            setScheduledDateFromDb(null);
          });
        });
      }
    }
  }, [scheduledDateFromDb, donorData?.isAvailable, user._id, onUserUpdate]);

  // Fetch scheduled date from new backend on mount and auto-update availability
  useEffect(() => {
    const fetchScheduled = async () => {
      if (!user._id) return;
      try {
        const res = await fetch(`/api/donorscheduledonation?userId=${user._id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.schedule && data.schedule.scheduledDate) {
            const scheduledDateStr = data.schedule.scheduledDate.split('T')[0];
            setScheduledDateFromDb(scheduledDateStr);
            // Check if scheduled date is today or in the past
            const today = new Date();
            const scheduled = new Date(scheduledDateStr);
            today.setHours(0,0,0,0);
            scheduled.setHours(0,0,0,0);
            if (scheduled <= today && donorData?.isAvailable !== true) {
              // Auto-update availability in backend
              await fetch('/api/profile/edit-donate-later', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, isAvailable: true, role: 'donor' })
              });
              setDonorData(prev => prev ? { ...prev, isAvailable: true } : prev);
              setEditData(prev => ({ ...prev, isAvailable: true }));
              // Optionally update user object in localStorage
              const updatedUser = { ...user, isAvailable: true };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              onUserUpdate(updatedUser as IUser);
            }
          } else {
            setScheduledDateFromDb(null);
          }
        }
      } catch {}
    };
    fetchScheduled();
  }, [user._id, donorData?.isAvailable, onUserUpdate]);

  const handleSchedule = async () => {
    setScheduleErr('');
    setScheduleSuccess('');
    if (!isValidFutureDate(scheduledDate)) {
      setScheduleErr('Please pick a valid future date.');
      return;
    }
    try {
      // Double-check in backend: do not allow past or today
      const today = new Date();
      today.setHours(0,0,0,0);
      const selected = new Date(scheduledDate);
      selected.setHours(0,0,0,0);
      if (selected <= today) {
        setScheduleErr('Cannot schedule for today or past date.');
        return;
      }
      // Only schedule the donation date; do not update isAvailable immediately
      const res = await fetch('/api/donorscheduledonation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, scheduledDate })
      });
      if (!res.ok) throw new Error('Failed to schedule');
      setScheduleSuccess('Donation scheduled for ' + scheduledDate + '.');
      setScheduledDateFromDb(scheduledDate);
      setShowScheduleDialog(false);
    } catch {
      setScheduleErr('Failed to schedule. Try again.');
    }
  };

  const router = useRouter();

  const getCountryCode = (countryIso: string) => {
    if (!countryIso) return '';
    const country = Country.getCountryByCode(countryIso);
    return country ? country.phonecode : '';
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fixed Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/home')}
          className="fixed top-16 md:top-24 left-2 md:left-2 h-10 md:h-10 w-10 md:w-10 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
          aria-label="Back to Home"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
      </motion.div>

      <div className="container mx-auto max-w-4xl">
        {/* Save Lives Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-r from-red-50 to-pink-50 mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <motion.div 
                  className="flex justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-red-800 mb-2">Life Saver Achievement!</h3>
                  <p className="text-red-700 mb-4">
                    You've made {donationStats.totalDonations} donation{donationStats.totalDonations !== 1 ? 's' : ''} and potentially saved {donationStats.totalLivesSaved} lives!
                  </p>
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <div className="text-2xl font-bold text-red-600">{donationStats.totalDonations}</div>
                      <div className="text-sm text-red-700">Donations</div>
                    </motion.div>
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <div className="text-2xl font-bold text-green-600">{donationStats.totalLivesSaved}</div>
                      <div className="text-sm text-green-700">Lives Saved</div>
                    </motion.div>
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <div className="text-2xl font-bold text-blue-600">{donationStats.totalUnits}</div>
                      <div className="text-sm text-blue-700">Units</div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r text-xl text-white from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {user.name.slice(0,1).toUpperCase()}
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">{user.name.slice(0, 1).toUpperCase()}{user.name.slice(1)}</CardTitle>
                      <CardDescription className="text-muted-foreground">Donor Profile</CardDescription>
                    </div>
                  </div>
                </motion.div>
                <AnimatePresence>
                  {!editMode && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={handleEdit}
                        className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success/Error Messages */}
              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-700">{msg}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{err}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
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
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {user.email}
                  </div>
                </motion.div>

                {/* Phone Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
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
                </motion.div>

                {/* Blood Type */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
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
                </motion.div>

                {/* Date of Birth */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
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
                </motion.div>

                {/* Gender */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
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
                </motion.div>

                {/* Weight */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
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
                </motion.div>

                {/* Height */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                >
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
                </motion.div>

                {/* Country with Search */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                >
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Country
                  </Label>
                  {editMode ? (
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryOpen}
                          className="w-full justify-between h-12 border-gray-200 focus:border-blue-500 cursor-pointer"
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
                  ) : (
                    <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                      {donorData?.country || 'Not specified'}
                    </div>
                  )}
                </motion.div>

                {/* State with Search */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.3 }}
                >
                  <Label className="text-sm font-medium text-gray-700">State</Label>
                  {editMode ? (
                    <Popover open={stateOpen} onOpenChange={setStateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={stateOpen}
                          disabled={!editData.country}
                          className="w-full justify-between h-12 border-gray-200 focus:border-blue-500 cursor-pointer disabled:cursor-not-allowed"
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
                  ) : (
                    <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                      {donorData?.state || 'Not specified'}
                    </div>
                  )}
                </motion.div>

                {/* City with Search */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.4 }}
                >
                  <Label className="text-sm font-medium text-gray-700">City</Label>
                  {editMode ? (
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityOpen}
                          disabled={!editData.state}
                          className="w-full justify-between h-12 border-gray-200 focus:border-blue-500 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {editData.city || "Select City"}
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
                  ) : (
                    <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                      {donorData?.city || 'Not specified'}
                    </div>
                  )}
                </motion.div>

                {/* Availability */}
                <motion.div 
                  className="col-span-1 md:col-span-2 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.5 }}
                >
                  <Label className="text-sm font-medium text-gray-700">Are you currently available to donate blood?</Label>
                  {editMode ? (
                    <RadioGroup 
                      value={editData.isAvailable?.toString()} 
                      onValueChange={(value) => setEditData({...editData, isAvailable: value === 'true'})}
                      className="flex gap-6"
                    >
                      <motion.div 
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RadioGroupItem value="true" id="yes" className="cursor-pointer" />
                        <Label htmlFor="yes" className="cursor-pointer">Yes, I'm available</Label>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RadioGroupItem value="false" id="no" className="cursor-pointer" />
                        <Label htmlFor="no" className="cursor-pointer">Not available now</Label>
                      </motion.div>
                    </RadioGroup>
                  ) : (
                    <div className={`h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center font-semibold ${
                      donorData?.isAvailable === true ? 'text-green-600' : 
                      donorData?.isAvailable === false ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {donorData?.isAvailable === null ? 'Not selected' : donorData?.isAvailable ? 'Yes, available' : 'Not available'}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* --- SCHEDULED DONATION DISPLAY & UPDATE --- */}
              <AnimatePresence>
                {(donorData?.isAvailable !== true) && (
                  <motion.div 
                    className="col-span-1 md:col-span-2 space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Scheduled Donation Date
                    </Label>
                    {!editMode && (
                      <div className={`h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center font-semibold text-blue-700 gap-3`}>
                        {scheduledDateFromDb ? (
                          <>
                            {scheduledDateFromDb}
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2 px-2 py-1 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                              onClick={() => {
                                setScheduledDate('');
                                setShowScheduleDialog(true);
                                setScheduleErr('');
                                setScheduleSuccess('');
                              }}
                            >
                              Update
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="bg-red-500 cursor-pointer hover:bg-red-600 text-white flex items-center gap-2"
                            onClick={() => {
                              setScheduledDate('');
                              setShowScheduleDialog(true);
                              setScheduleErr('');
                              setScheduleSuccess('');
                            }}
                          >
                            <CalendarIcon className="w-4 h-4" />
                            Schedule Donation
                          </Button>
                        )}
                      </div>
                    )}
                    {/* POPUP MODAL */}
                    <AnimatePresence>
                      {showScheduleDialog && (
                        <motion.div 
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div 
                            className="bg-white rounded-lg p-6 space-y-6 shadow-xl w-[90vw] max-w-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center gap-2 mb-4">
                              <CalendarIcon className="w-5 h-5 text-red-500" />
                              <span className="font-semibold text-lg">Schedule Your Donation</span>
                            </div>
                            <p className="text-gray-600 text-sm">Pick a date in future to schedule your next blood donation.</p>
                            <Input
                              type="date"
                              min={todayStr}
                              value={scheduledDate}
                              onChange={e => setScheduledDate(e.target.value)}
                              className="h-12 border-gray-200"
                            />
                            <AnimatePresence>
                              {scheduleErr && (
                                <motion.div 
                                  className="text-red-600 text-sm font-medium"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  {scheduleErr}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <AnimatePresence>
                              {scheduleSuccess && (
                                <motion.div 
                                  className="text-green-600 text-sm font-medium"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  {scheduleSuccess}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <div className="flex gap-3 mt-6 items-center justify-center">
                              <Button
                                className="bg-red-500 text-white cursor-pointer"
                                onClick={handleSchedule}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowScheduleDialog(false)}
                                className='cursor-pointer'
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* --- END schedule --- */}

              {/* Edit Mode Action Buttons */}
              <AnimatePresence>
                {editMode && (
                  <motion.div 
                    className="flex flex-row gap-4 pt-6 border-t justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
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

  // Auto-hide success/error messages after 5 seconds (UserProfileDetails)
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);
  useEffect(() => {
    if (err) {
      const timer = setTimeout(() => setErr(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [err]);

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
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fixed Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/home')}
          className="fixed top-14 md:top-24 left-6 h-12 w-12 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
      </motion.div>

      <div className="container mx-auto max-w-4xl pt-20 space-y-6">
        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <User className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">{user.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">User Profile</CardDescription>
                    </div>
                  </div>
                </motion.div>
                <AnimatePresence>
                  {!editMode && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={handleEdit}
                        className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success/Error Messages */}
              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-700">{msg}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{err}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
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
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                    {user.email}
                  </div>
                </motion.div>

                {/* Phone Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
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
                </motion.div>
              </div>

              {/* Edit Mode Action Buttons */}
              <AnimatePresence>
                {editMode && (
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 pt-6 border-t"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Signup Reason Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-0 bg-white/95 backdrop-blur-sm mt-6">
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
                      <AnimatePresence>
                        {!editMode && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
