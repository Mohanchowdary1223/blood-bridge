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

interface AboveAgeProfileProps {
  user: IUser;
  onUserUpdate: (user: IUser) => void;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  onSignupReasonChange?: (newReason: string) => void;
}

export const AboveAgeProfile: React.FC<AboveAgeProfileProps> = ({ user, onUserUpdate, editMode, setEditMode, onSignupReasonChange }) => {
  const [editData, setEditData] = useState({
    name: user.name,
    phone: user.phone,
    currentAge: user.currentAge || '',
    dateOfBirth: user.dateOfBirth || '',
    signupReason: user.signupReason || 'aboveAge'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      setCurrentAge(age);
    }
  }, [user.dateOfBirth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      dateOfBirth: user.dateOfBirth || '',
      signupReason: user.signupReason || 'aboveAge'
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
        role: user.role
      };
      const res = await fetch('/api/profile/edit-above-age', {
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
          <h2 className="text-2xl font-bold text-purple-600">Above Age Profile</h2>
          {!editMode && (
            <button
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}
        </div>
        {msg && <div className="text-green-600 mb-2">{msg}</div>}
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Age Information</h3>
          <p className="text-purple-700">We understand that age-related factors may prevent blood donation. You can still support our mission by encouraging others to donate.</p>
        </div>
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
            <div className="p-2">{user.email}</div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Phone</label>
            {editMode ? (
              <input name="phone" value={editData.phone} onChange={handleChange} className="w-full border rounded p-2" />
            ) : (
              <div className="p-2">{user.phone}</div>
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
                className="w-full border rounded p-2" 
                min="0" 
                max="120"
              />
            ) : (
              <div className="p-2">{currentAge !== null ? currentAge : 'Not specified'}</div>
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
                className="w-full border rounded p-2" 
              />
            ) : (
              <div className="p-2">{user.dateOfBirth || 'Not specified'}</div>
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
            name="signupReason"
            value={user.signupReason}
            onChange={handleSignupReasonChange}
            className="w-full border rounded p-2"
            disabled={editMode || loading}
          >
            {signupReasons.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}; 