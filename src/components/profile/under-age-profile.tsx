"use client"

import React, { useState, useEffect } from 'react';
import { IUser } from '@/models/User';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const signupReasons = [
  { value: 'donateLater', label: 'I will register and donate blood later' },
  { value: 'healthIssue', label: 'Health issue or some bad habit' },
  { value: 'underAge', label: 'Under age (below 18)' },
  { value: 'aboveAge', label: 'Above age (over 65)' }
];

interface UnderAgeProfileProps {
  user: IUser;
  onUserUpdate: (user: IUser) => void;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  onSignupReasonChange?: (newReason: string) => void;
}

export const UnderAgeProfile: React.FC<UnderAgeProfileProps> = ({ user, onUserUpdate, editMode, setEditMode, onSignupReasonChange }) => {
  const [editData, setEditData] = useState({
    name: user.name,
    phone: user.phone,
    currentAge: user.currentAge || '',
    dateOfBirth: user.dateOfBirth || ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [eligibilityCountdown, setEligibilityCountdown] = useState<string>('');
  useEffect(() => {
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      setCurrentAge(age);
      // Calculate eligibility date
      const eligibleDate = new Date(dob);
      eligibleDate.setFullYear(eligibleDate.getFullYear() + 18);
      const diff = eligibleDate.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setEligibilityCountdown(`${days} days, ${hours} hours, ${minutes} minutes`);
      } else {
        setEligibilityCountdown('Eligible now');
      }
    }
  }, [user.dateOfBirth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSignupReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newReason = e.target.value;
    if (newReason !== user.signupReason && onSignupReasonChange) {
      onSignupReasonChange(newReason);
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
      phone: user.phone,
      currentAge: user.currentAge || '',
      dateOfBirth: user.dateOfBirth || ''
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
        signupReason: user.signupReason, // Ensure signupReason is included in payload
        role: user.role
      };
      const res = await fetch('/api/profile/edit-under-age', {
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

  // Calculate when they'll be eligible
  const calculateEligibilityDate = () => {
    if (user.dateOfBirth) {
      const dobDate = new Date(user.dateOfBirth);
      const eligibleDate = new Date(dobDate);
      eligibleDate.setFullYear(eligibleDate.getFullYear() + 18);
      return eligibleDate.toLocaleDateString();
    }
    return 'Not specified';
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
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-8 px-2">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-blue-600 text-center sm:text-left w-full">{user.name}</h2>
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
          <div className="mb-6 p-4 bg-blue-50 rounded-xl flex flex-col justify-center items-center">
            <h3 className="font-semibold text-blue-800 mb-2">Age Information</h3>
            <p className="text-blue-700">You need to be 18 or older to donate blood. We&apos;ll notify you when you become eligible!</p>
            {user.dateOfBirth && (
              <p className="text-blue-600 mt-2">
                <strong>Eligible to donate from:</strong> {calculateEligibilityDate()}
              </p>
            )}
            {user.dateOfBirth && (
              <p className="text-blue-600 mt-2">
                <strong>Eligible to donate in:</strong> <span className="font-semibold">{eligibilityCountdown}</span>
              </p>
            )}
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
              <div className="p-3">{user.email}</div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Phone</label>
              {editMode ? (
                <input name="phone" value={editData.phone} onChange={handleChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary/50" />
              ) : (
                <div className="p-3">{user.phone}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Current Age</label>
              {editMode ? (
                <input 
                  name="currentAge" 
                  type="number" 
                  value={editData.currentAge} 
                  onChange={handleChange} 
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary/50" 
                  min="0" 
                  max="120"
                />
              ) : (
                <div className="p-3">{currentAge !== null ? currentAge : 'Not specified'}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Date of Birth</label>
              {editMode ? (
                <input 
                  name="dateOfBirth" 
                  type="date" 
                  value={editData.dateOfBirth} 
                  onChange={handleChange} 
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary/50" 
                />
              ) : (
                <div className="p-3">{user.dateOfBirth || 'Not specified'}</div>
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
            <h3 className="text-xl font-bold mb-4">Signup Information</h3>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Why are you signing in?</label>
            <select
              value={user.signupReason}
              onChange={handleSignupReasonChange}
              className="w-full border rounded-lg p-3 cursor-pointer focus:ring-2 focus:ring-primary/50"
              disabled={editMode}
            >
              {signupReasons.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}; 