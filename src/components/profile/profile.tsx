"use client"

import React, { useState, useEffect } from 'react';
import { IUser as ImportedIUser } from '@/models/User';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaTint, FaCalendar, FaWeight, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

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
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  // Track previous country and state to avoid unnecessary resets
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      // Refresh donor data
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

  // Helper to get country code
  const getCountryCode = (countryIso: string) => {
    if (!countryIso) return '';
    const country = Country.getCountryByCode(countryIso);
    return country ? country.phonecode : '';
  };

  return (
    <>
      {/* Fixed Back Button (like finddonor.tsx) */}
      <button
        onClick={() => router.push('/home')}
        className="fixed left-4 transform -translate-y-1/2 bg-white p-3 cursor-pointer rounded-full shadow-lg hover:bg-gray-50 transition-colors z-50"
        aria-label="Back to home"
      >
        <FaArrowLeft className="text-gray-600 text-xl" />
      </button>
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-8 px-2">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-primary text-center sm:text-left w-full">{user.name}</h2>
            {!editMode && (
              <button
                className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/80 transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
          </div>
          {msg && <div className="text-green-600 mb-2 text-center">{msg}</div>}
          {err && <div className="text-red-600 mb-2 text-center">{err}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <input name="name" value={editData.name} onChange={handleChange} className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50" placeholder="Full Name" />
              ) : (
                <div className="p-3 pl-10">{user.name}</div>
              )}
            </div>
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <input name="email" value={user.email} className="w-full border rounded-lg p-3 pl-10 bg-gray-100" disabled placeholder="Email address" />
              ) : (
                <div className="p-3 pl-10">{user.email}</div>
              )}
            </div>
            {/* Phone */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 left-10 flex items-center text-gray-500 text-sm pl-1 pr-1">
                {donorData?.country && `+${getCountryCode(donorData.country)}`}
              </div>
              {editMode ? (
                <input name="phone" value={editData.phone} onChange={handleChange} className="w-full border rounded-lg p-3 pl-20 focus:ring-2 focus:ring-primary/50" placeholder="Phone Number" />
              ) : (
                <div className="p-3 pl-20">{donorData?.country ? `+${getCountryCode(donorData.country)} ${user.phone}` : user.phone}</div>
              )}
            </div>
            {/* Blood Type */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaTint className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <select name="bloodType" value={editData.bloodType} onChange={handleChange} className="w-full border rounded-lg p-3 pl-10 cursor-pointer focus:ring-2 focus:ring-primary/50">
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
              ) : (
                <div className="p-3 pl-10">{donorData?.bloodType || 'Not specified'}</div>
              )}
            </div>
            {/* Date of Birth */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendar className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <input name="dob" type="date" value={editData.dob} onChange={handleChange} className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50" placeholder="Date of Birth" />
              ) : (
                <div className="p-3 pl-10">{donorData?.dob || 'Not specified'}</div>
              )}
            </div>
            {/* Gender */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <select name="gender" value={editData.gender} onChange={handleChange} className="w-full border rounded-lg p-3 pl-10 cursor-pointer focus:ring-2 focus:ring-primary/50">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="p-3 pl-10">{donorData?.gender || 'Not specified'}</div>
              )}
            </div>
            {/* Weight */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaWeight className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <input name="weight" value={editData.weight} onChange={handleChange} className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50" placeholder="Weight (kg)" />
              ) : (
                <div className="p-3 pl-10">{donorData?.weight || 'Not specified'}</div>
              )}
            </div>
            {/* Height */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaRuler className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <input name="height" value={editData.height} onChange={handleChange} className="w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50" placeholder="Height (cm)" />
              ) : (
                <div className="p-3 pl-10">{donorData?.height || 'Not specified'}</div>
              )}
            </div>
            {/* Country */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <select
                  name="country"
                  value={editData.country}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 pl-10 cursor-pointer focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select country</option>
                  {countries.map(country => (
                    <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 pl-10">{donorData?.country || 'Not specified'}</div>
              )}
            </div>
            {/* State */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <select
                  name="state"
                  value={editData.state}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 pl-10 cursor-pointer focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 pl-10">{donorData?.state || 'Not specified'}</div>
              )}
            </div>
            {/* City */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              {editMode ? (
                <select
                  name="city"
                  value={editData.city}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 pl-10 cursor-pointer focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 pl-10">{donorData?.city || 'Not specified'}</div>
              )}
            </div>
            {/* Available to donate */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Are you currently available to donate blood?</label>
              {editMode ? (
                <div className="flex gap-6 flex-wrap">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isAvailable"
                      value="true"
                      checked={editData.isAvailable === true}
                      onChange={() => setEditData({ ...editData, isAvailable: true })}
                      className="mr-2 accent-primary"
                    />
                    Yes
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isAvailable"
                      value="false"
                      checked={editData.isAvailable === false}
                      onChange={() => setEditData({ ...editData, isAvailable: false })}
                      className="mr-2 accent-primary"
                    />
                    No
                  </label>
                </div>
              ) : (
                <div className={`p-3 font-semibold ${donorData?.isAvailable === true ? 'text-green-600' : donorData?.isAvailable === false ? 'text-red-600' : ''}`}>
                  {donorData?.isAvailable === null ? 'Not selected' : donorData?.isAvailable ? 'Yes' : 'No'}
                </div>
              )}
            </div>
          </div>
          {editMode && (
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center items-center">
              <button
                className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/80 transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-8 py-3 rounded-full hover:bg-gray-400 transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400/50"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
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

  const handleSignupReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newReason = e.target.value;
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
    <>
      {/* Fixed Back Button (like finddonor.tsx) */}
      <button
        onClick={() => router.push('/home')}
        className="fixed left-4 transform -translate-y-1/2 bg-white p-3 cursor-pointer rounded-full shadow-lg hover:bg-gray-50 transition-colors z-50"
        aria-label="Back to home"
      >
        <FaArrowLeft className="text-gray-600 text-xl" />
      </button>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          {!editMode && (
            <button
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 cursor-pointer"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}
        </div>
        {msg && <div className="text-green-600 mb-2">{msg}</div>}
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">Name</label>
            {editMode ? (
              <input name="name" value={editData.name} onChange={handleChange} className="w-full border rounded p-2" />
            ) : (
              <div className="p-2">{user.name}</div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            {editMode ? (
              <input name="email" value={user.email} className="w-full border rounded p-2" disabled />
            ) : (
              <div className="p-2">{user.email}</div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Phone</label>
            {editMode ? (
              <input name="phone" value={editData.phone} onChange={handleChange} className="w-full border rounded p-2" />
            ) : (
              <div className="p-2">{user.phone}</div>
            )}
          </div>
        </div>
        {editMode && (
          <div className="flex gap-4 mt-6">
            <button
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Signup Reason Section */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold mb-4">Signup Information</h3>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Why are you signing in?</label>
          <select
            value={signupReason}
            onChange={handleSignupReasonChange}
            className="w-full border rounded p-2"
            disabled={editMode}
          >
            <option value="">Select reason</option>
            {signupReasons.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {!editMode && (
            <button
              onClick={handleSave}
              className="mt-3 bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update Signup Reason'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};


