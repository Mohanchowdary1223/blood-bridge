"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DonorProfileDetails, UserProfileDetails } from '@/components/profile/profile';
import { DonateLaterProfile } from '@/components/profile/donate-later-profile';
import { HealthIssueProfile } from '@/components/profile/health-issue-profile';
import { UnderAgeProfile } from '@/components/profile/under-age-profile';
import { AboveAgeProfile } from '@/components/profile/above-age-profile';
import { IUser } from '@/models/User';
import { getProfileType } from '@/lib/profile-utils';

const ProfilePage = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSignupReason, setPendingSignupReason] = useState('');
  const [pendingDateOfBirth, setPendingDateOfBirth] = useState('');
  const [pendingCurrentAge, setPendingCurrentAge] = useState<number | null>(null);
  const [eligibilityCountdown, setEligibilityCountdown] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.id && !parsed._id) parsed._id = parsed.id;
      setUser(parsed);
    }
  }, [router]);

  const handleUserUpdate = (updatedUser: IUser) => {
    setUser(updatedUser);
    setEditMode(false);
  };



  const handleSignupReasonChange = (newReason: string) => {
    if (newReason === 'underAge' || newReason === 'aboveAge') {
      setPendingSignupReason(newReason);
      setShowConfirmModal(true);
    } else {
      updateSignupReason(newReason);
    }
  };

  // Calculate age and eligibility countdown
  useEffect(() => {
    if (pendingSignupReason === 'underAge' && pendingDateOfBirth) {
      const dob = new Date(pendingDateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      setPendingCurrentAge(age);
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
    } else if (pendingSignupReason === 'aboveAge' && pendingDateOfBirth) {
      const dob = new Date(pendingDateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      setPendingCurrentAge(age);
      setEligibilityCountdown('');
    } else {
      setPendingCurrentAge(null);
      setEligibilityCountdown('');
    }
  }, [pendingSignupReason, pendingDateOfBirth]);

  const updateSignupReason = async (reason: string, dateOfBirth?: string) => {
    setLoading(true);
    try {
      const updatePayload: Record<string, unknown> = {
        userId: user!._id,
        name: user!.name,
        phone: user!.phone,
        signupReason: reason,
        role: user!.role
      };

      if (dateOfBirth) {
        updatePayload.dateOfBirth = dateOfBirth;
        // Calculate current age
        const dobDate = new Date(dateOfBirth);
        const now = new Date();
        const age = now.getFullYear() - dobDate.getFullYear();
        const monthDiff = now.getMonth() - dobDate.getMonth();
        const calculatedAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < dobDate.getDate()) 
          ? age - 1 
          : age;
        updatePayload.currentAge = calculatedAge;
        
        // Determine the specific age-based reason
        if (calculatedAge < 18) {
          updatePayload.signupReason = 'underAge';
        } else if (calculatedAge > 65) {
          updatePayload.signupReason = 'aboveAge';
        } else {
          updatePayload.signupReason = 'donateLater';
        }
      }

      const res = await fetch('/api/profile/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setShowConfirmModal(false);
      setPendingSignupReason('');
      setPendingDateOfBirth('');
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReasonChange = () => {
    updateSignupReason(pendingSignupReason);
  };

  const handleCancelAgeChange = () => {
    setShowConfirmModal(false);
    setPendingSignupReason('');
    setPendingDateOfBirth('');
  };

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  // Render appropriate profile component based on user role and signup reason
  const renderProfileComponent = () => {
    const profileType = getProfileType(user);

    switch (profileType) {
      case 'donor':
        return (
          <DonorProfileDetails 
            user={user} 
            onUserUpdate={handleUserUpdate} 
            editMode={editMode} 
            setEditMode={setEditMode} 
          />
        );
      case 'donateLater':
        return (
          <DonateLaterProfile 
            user={user} 
            onUserUpdate={handleUserUpdate} 
            editMode={editMode} 
            setEditMode={setEditMode}
            onSignupReasonChange={handleSignupReasonChange}
          />
        );
      case 'healthIssue':
        return (
          <HealthIssueProfile 
            user={user} 
            onUserUpdate={handleUserUpdate} 
            editMode={editMode} 
            setEditMode={setEditMode}
            onSignupReasonChange={handleSignupReasonChange}
          />
        );
      case 'underAge':
        return (
          <UnderAgeProfile 
            user={user} 
            onUserUpdate={handleUserUpdate} 
            editMode={editMode} 
            setEditMode={setEditMode}
            onSignupReasonChange={handleSignupReasonChange}
          />
        );
      case 'aboveAge':
        return (
          <AboveAgeProfile 
            user={user} 
            onUserUpdate={handleUserUpdate} 
            editMode={editMode} 
            setEditMode={setEditMode}
            onSignupReasonChange={handleSignupReasonChange}
          />
        );
      default:
        return (
          <UserProfileDetails 
            user={user} 
            onUserUpdate={handleUserUpdate} 
            editMode={editMode} 
            setEditMode={setEditMode}
            onSignupReasonChange={handleSignupReasonChange}
          />
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto">
          {renderProfileComponent()}
        </div>
      </div>

      {/* Age Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            {(pendingSignupReason === 'underAge' || pendingSignupReason === 'aboveAge') ? (
              <>
                <h3 className="text-xl font-bold mb-4">Enter Your Date of Birth</h3>
                <p className="mb-4 text-gray-600">
                  Please enter your date of birth. Your current age will be calculated automatically.
                </p>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={pendingDateOfBirth}
                    onChange={(e) => setPendingDateOfBirth(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                {pendingDateOfBirth && (
                  <div className="mb-2 text-blue-700">Current Age: <span className="font-semibold">{pendingCurrentAge ?? ''}</span></div>
                )}
                {pendingSignupReason === 'underAge' && eligibilityCountdown && pendingDateOfBirth && (
                  <div className="mb-2 text-green-700">Eligible to donate in: <span className="font-semibold">{eligibilityCountdown}</span></div>
                )}
                <div className="flex gap-4">
                  <button
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
                    onClick={() => updateSignupReason(pendingSignupReason, pendingDateOfBirth)}
                    disabled={loading || !pendingDateOfBirth}
                  >
                    {loading ? 'Updating...' : 'Save & Update Profile'}
                  </button>
                  <button
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={handleCancelAgeChange}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Confirm Change</h3>
                <p className="mb-4 text-gray-600">
                  Are you sure you want to change your signup reason to &quot;{pendingSignupReason === 'donateLater' ? 'I will register and donate blood later' : 
                    pendingSignupReason === 'healthIssue' ? 'Health issue or some bad habit' :
                    pendingSignupReason === 'underAge' ? 'Under age (below 18)' :
                    pendingSignupReason === 'aboveAge' ? 'Above age (over 65)' : 'Unknown reason'}&quot;?
                </p>
                <div className="flex gap-4">
                  <button
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
                    onClick={handleConfirmReasonChange}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Yes, Change'}
                  </button>
                  <button
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={handleCancelAgeChange}
                    disabled={loading}
                  >
                    No, Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
