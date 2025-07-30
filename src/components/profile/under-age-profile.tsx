"use client"

import React, { useState, useEffect } from 'react';
import { IUser } from '@/models/User';
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, Edit, Save, X, Info, Timer, Droplet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const signupReasons = [
  { value: 'donateLater', label: 'I will register and donate blood later' },
  { value: 'healthIssue', label: 'Health issue or some bad habit' },
  { value: 'underAge', label: 'Under age (below 18)' },
  { value: 'aboveAge', label: 'Above age (over 65)' }
];

const bloodGroups = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  "I don't know my blood type",
];

interface UnderAgeProfileProps {
  user: IUser;
  onUserUpdate: (user: IUser) => void;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  onSignupReasonChange?: (newReason: string) => void;
}

export const UnderAgeProfile: React.FC<UnderAgeProfileProps> = ({ 
  user, 
  onUserUpdate, 
  editMode, 
  setEditMode, 
  onSignupReasonChange 
}) => {
  const [editData, setEditData] = useState({
    name: user.name,
    phone: user.phone,
    currentAge: user.currentAge || '',
    dateOfBirth: user.dateOfBirth || '',
    bloodType: user.bloodType === 'unknown' ? "I don't know my blood type" : user.bloodType || ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [eligibilityCountdown, setEligibilityCountdown] = useState<string>('');
  const router = useRouter();

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

  const handleBloodTypeChange = (value: string) => {
    setEditData({ ...editData, bloodType: value === 'not-specified' ? '' : value });
  };

  const handleSignupReasonChange = (value: string) => {
    if (value !== user.signupReason && onSignupReasonChange) {
      onSignupReasonChange(value);
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
      bloodType: user.bloodType || ''
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
        signupReason: user.signupReason,
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
      return eligibleDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return 'Not specified';
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
        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm mb-6">
            <CardHeader className="pb-6">
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
                      <p className='text-white text-lg'>{user.name.slice(0,1).toUpperCase()} </p>
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">{user.name.slice(0, 1).toUpperCase()}{user.name.slice(1)}</CardTitle>
                      <CardDescription className="text-muted-foreground">Young Supporter Profile</CardDescription>
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

              {/* Age Information Notice */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <span className="font-semibold">Age Information:</span> You need to be 18 or older to donate blood. 
                    We'll notify you when you become eligible!
                  </AlertDescription>
                </Alert>
              </motion.div>

              {/* Eligibility Countdown */}
              <AnimatePresence>
                {user.dateOfBirth && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card className="border-orange-200 bg-gradient-to-r flex items-center justify-center from-orange-50 to-yellow-50">
                      <CardContent className="p-4">
                        <motion.div 
                          className="flex items-center gap-3 mb-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                        >
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Timer className="w-5 h-5 text-orange-600" />
                          </motion.div>
                          <h3 className="font-semibold text-orange-800">Donation Eligibility</h3>
                        </motion.div>
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 }}
                        >
                          <p className="text-orange-700">
                            <span className="font-medium">Eligible to donate from:</span> {calculateEligibilityDate()}
                          </p>
                          <p className="text-orange-700">
                            <span className="font-medium">Time remaining:</span>{' '}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.7 }}
                              className="inline-block"
                            >
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-mono">
                                {eligibilityCountdown}
                              </Badge>
                            </motion.div>
                          </p>
                        </motion.div>
                      </CardContent>
                    </Card>
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
                  transition={{ duration: 0.3, delay: 0.5 }}
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

                {/* Email Field (Read-only) */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
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
                  transition={{ duration: 0.3, delay: 0.7 }}
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

                {/* Blood Type Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <Label htmlFor="bloodType" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    Blood Group
                  </Label>
                  {editMode ? (
                    <Select
                      value={editData.bloodType || 'not-specified'}
                      onValueChange={handleBloodTypeChange}
                    >
                      <SelectTrigger className="h-12 min-w-full border-gray-200 focus:border-blue-500 cursor-pointer">
                        <SelectValue placeholder="Select your blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-specified">Not specified</SelectItem>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group} value={group} className="cursor-pointer">
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                      {user.bloodType || 'Not specified'}
                    </div>
                  )}
                </motion.div>

                {/* Current Age Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <Label htmlFor="currentAge" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Current Age
                  </Label>
                  {editMode ? (
                    <Input
                      id="currentAge"
                      name="currentAge"
                      type="number"
                      value={editData.currentAge}
                      onChange={handleChange}
                      className="h-12 border-gray-200 focus:border-blue-500"
                      placeholder="Enter your age"
                      min="0"
                      max="120"
                    />
                  ) : (
                    <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                      {currentAge !== null ? (
                        <div className="flex items-center gap-2">
                          <span>{currentAge} years</span>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {currentAge < 18 ? 'Future donor' : 'Eligible now'}
                            </Badge>
                          </motion.div>
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Date of Birth Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  {editMode ? (
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={handleChange}
                      className="h-12 border-gray-200 focus:border-blue-500"
                    />
                  ) : (
                    <div className="h-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                      {user.dateOfBirth ? (
                        new Date(user.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Edit Mode Action Buttons */}
              <AnimatePresence>
                {editMode && (
                  <motion.div 
                    className="flex gap-4 pt-6 border-t justify-center items-center"
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

        {/* Signup Reason Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Signup Information</CardTitle>
              <CardDescription>
                Your reason for joining BloodBridge community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              >
                <Label htmlFor="signupReason" className="text-sm font-medium text-gray-700">
                  Why did you sign up?
                </Label>
                <Select
                  value={user.signupReason}
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
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
