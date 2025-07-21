"use client"

import React, { useState, useEffect } from 'react';
import { IUser } from '@/models/User';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

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

export const DonateLaterProfile: React.FC<DonateLaterProfileProps> = ({ user, onUserUpdate, editMode, setEditMode, onSignupReasonChange }) => {
  const [editData, setEditData] = useState({
    name: user.name,
    phone: user.phone
  });
  const [signupReason, setSignupReason] = useState(user.signupReason || 'donateLater');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showSaveLivesModal, setShowSaveLivesModal] = useState(false);
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

  const handleDonorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'isAvailable') {
      setDonorFormData({
        ...donorFormData,
        isAvailable: value === 'true',
      });
      return;
    }
    setDonorFormData({ ...donorFormData, [name]: value });
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
        role: user.role // Include the current role
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

  const handleDonorSubmit = async () => {
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
            <h2 className="text-2xl font-bold text-green-600 text-center sm:text-left w-full">{user.name}</h2>
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
          <div className="mb-6 p-4 bg-green-50 rounded-xl flex items-center justify-center flex-col">
            <h3 className="font-semibold text-green-800 mb-2">Ready to Donate?</h3>
            <p className="text-green-700">You can become a donor anytime! Click &quot;Save Lives&quot; to register as a blood donor.</p>
            <button
              onClick={handleSaveLives}
              className="mt-3 bg-green-600 cursor-pointer text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600/50"
            >
              Save Lives
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium">Name</label>
              {editMode ? (
                <input name="name" value={editData.name} onChange={handleChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary/50" />
              ) : (
                <div className="p-3">{user.name}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Email</label>
              {editMode ? (
                <input name="email" value={user.email} className="w-full border rounded-lg p-3 bg-gray-100" disabled />
              ) : (
                <div className="p-3">{user.email}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Phone</label>
              {editMode ? (
                <input name="phone" value={editData.phone} onChange={handleChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary/50" />
              ) : (
                <div className="p-3">{user.phone}</div>
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
        {/* Signup Reason Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mx-auto">
          <div className='flex items-center justify-center'>
            <h3 className="text-xl font-bold mb-4 ">Signup Information</h3>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Why are you signing in?</label>
            <select
              value={signupReason}
              onChange={handleSignupReasonChange}
              className="w-full border rounded-lg p-3 cursor-pointer focus:ring-2 focus:ring-primary/50"
              disabled={editMode || loading}
            >
              {signupReasons.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Save Lives Modal */}
        {showSaveLivesModal && (
          <div className="fixed inset-0 bg-gradient-to-br from-red-200/80 via-white/80 to-red-400/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-green-600">Become a Blood Donor</h3>
                <button
                  onClick={() => setShowSaveLivesModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              {/* Registration-style form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium">Full Name *</label>
                  <input name="name" value={donorFormData.name} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Email *</label>
                  <input name="email" value={donorFormData.email} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Phone *</label>
                  <div className="flex items-center">
                    <span className="inline-block text-gray-500 text-sm mr-2">{donorFormData.country && `+${getCountryCode(donorFormData.country)}`}</span>
                    <input name="phone" value={donorFormData.phone} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3" required maxLength={10} pattern="\d{10}" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium ">Blood Type *</label>
                  <select name="bloodType" value={donorFormData.bloodType} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3 cursor-pointer" required>
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
                <div>
                  <label className="block text-gray-700 font-medium">Date of Birth *</label>
                  <input name="dob" type="date" value={donorFormData.dob} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Gender *</label>
                  <select name="gender" value={donorFormData.gender} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3 cursor-pointer" required>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Weight (kg) *</label>
                  <input name="weight" type="number" value={donorFormData.weight} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3" placeholder="in kg" min="40" max="150" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Height (cm) *</label>
                  <input name="height" type="number" value={donorFormData.height} onChange={handleDonorFormChange} className="w-full border rounded-lg p-3" placeholder="in cm" min="100" max="250" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium ">Country *</label>
                  <select
                    name="country"
                    value={donorFormData.country}
                    onChange={handleDonorFormChange}
                    className="w-full border rounded-lg p-3 cursor-pointer"
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">State *</label>
                  <select
                    name="state"
                    value={donorFormData.state}
                    onChange={handleDonorFormChange}
                    className="w-full border rounded-lg p-3 cursor-pointer"
                    required
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">City *</label>
                  <select
                    name="city"
                    value={donorFormData.city}
                    onChange={handleDonorFormChange}
                    className="w-full border rounded-lg p-3 cursor-pointer"
                    required
                  >
                    <option value="">Select city</option>
                    {cities.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Are you currently available to donate blood?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isAvailable"
                        value="true"
                        checked={donorFormData.isAvailable === true}
                        onChange={handleDonorFormChange}
                        className="mr-2 accent-primary"
                      />
                      Yes
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isAvailable"
                        value="false"
                        checked={donorFormData.isAvailable === false}
                        onChange={handleDonorFormChange}
                        className="mr-2 accent-primary"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6 justify-center items-center">
                <button
                  className="bg-green-600 text-white cursor-pointer px-6 py-2 rounded-full hover:bg-green-700 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600/50"
                  onClick={handleDonorSubmit}
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register as Donor'}
                </button>
                <button
                  className="bg-gray-300 cursor-pointer text-gray-800 px-6 py-2 rounded-full hover:bg-gray-400 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400/50"
                  onClick={() => setShowSaveLivesModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}; 