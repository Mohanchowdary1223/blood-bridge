"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Heart,
  Users,
  Droplets,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  Target,
  Award,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface DonationRecord {
  _id: string;
  recipientName: string;
  donationDate: string;
  location: string;
  bloodType: string;
  units: number;
  recipientAge?: number;
  recipientGender?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'scheduled';
}

const TrackImpactPage: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DonationRecord | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NEW: Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DonationRecord | null>(null);

  // NEW: Success notification state
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: '',
    donationDate: '',
    location: '',
    bloodType: '', // always set from user
    units: 1,
    recipientAge: '',
    recipientGender: '',
    notes: ''
  });

  // Success notification helper
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData?._id) {
            setUserId(userData._id);
            if (!/^[a-f\d]{24}$/i.test(userData._id)) {
              console.warn('Warning: userId is not a valid MongoDB ObjectId:', userData._id);
            }
          }
          if (userData?.name) setUserName(userData.name);
          if (userData?.bloodType) {
            setBloodGroup(userData.bloodType);
            setFormData(prev => ({ ...prev, bloodType: userData.bloodType }));
          }
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      } else {
        console.warn('No user found in localStorage');
      }
    }
  }, []);

  const fetchDonations = async (uid: string) => {
    setLoading(true);
    setError('');
    try {
      if (!/^[a-f\d]{24}$/i.test(uid)) {
        setError('User ID is not a valid MongoDB ObjectId. Please log in again.');
        console.error('Invalid userId:', uid);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/donoralltypedata/stackdata?userId=${uid}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch records');
        console.error('API error:', data.error);
        return;
      }
      setDonations(data.records);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
      console.error('Fetch donations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDonations(userId);
  }, [userId]);

  const handleInputChange = (field: string, value: string | number) => {
    // Prevent editing bloodType from the form
    if (field === 'bloodType') return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.recipientName || !formData.donationDate || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }
    if (!userId) {
      setError('User not found. Please log in again.');
      return;
    }
    if (!/^[a-f\d]{24}$/i.test(userId)) {
      setError('User ID is not a valid MongoDB ObjectId. Please log in again.');
      console.error('Invalid userId:', userId);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editingRecord) {
        // Edit
        const res = await fetch('/api/donoralltypedata/stackdata', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingRecord._id,
            userId,
            recipientName: formData.recipientName,
            donationDate: formData.donationDate,
            location: formData.location,
            bloodType: formData.bloodType,
            units: formData.units,
            recipientAge: formData.recipientAge ? parseInt(formData.recipientAge) : undefined,
            recipientGender: formData.recipientGender || undefined,
            notes: formData.notes || undefined,
            status: 'completed',
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to update record');
          console.error('API error:', data.error);
          return;
        }
        showSuccessMessage('Record updated successfully!');
      } else {
        // Add
        const res = await fetch('/api/donoralltypedata/stackdata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            recipientName: formData.recipientName,
            donationDate: formData.donationDate,
            location: formData.location,
            bloodType: formData.bloodType,
            units: formData.units,
            recipientAge: formData.recipientAge ? parseInt(formData.recipientAge) : undefined,
            recipientGender: formData.recipientGender || undefined,
            notes: formData.notes || undefined,
            status: 'completed',
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to add record');
          console.error('API error:', data.error);
          return;
        }
        showSuccessMessage('Record added successfully!');
      }
      setIsDialogOpen(false);
      setEditingRecord(null);
      setFormData({
        recipientName: '',
        donationDate: '',
        location: '',
        bloodType: bloodGroup,
        units: 1,
        recipientAge: '',
        recipientGender: '',
        notes: ''
      });
      if (userId) fetchDonations(userId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save record');
      console.error('Save record error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (donation: DonationRecord) => {
    setEditingRecord(donation);
    setFormData({
      recipientName: donation.recipientName,
      donationDate: donation.donationDate,
      location: donation.location,
      bloodType: bloodGroup, // always use current user blood type
      units: donation.units,
      recipientAge: donation.recipientAge?.toString() || '',
      recipientGender: donation.recipientGender || '',
      notes: donation.notes || ''
    });
    setIsDialogOpen(true);
  };

  // NEW: Handle delete button click (opens confirmation dialog)
  const handleDeleteClick = (donation: DonationRecord) => {
    setRecordToDelete(donation);
    setDeleteDialogOpen(true);
  };

  // NEW: Confirm delete action
  const confirmDelete = async () => {
    if (!recordToDelete || !userId) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/donoralltypedata/stackdata', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordToDelete._id, userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record');

      showSuccessMessage('Record deleted successfully!');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchDonations(userId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Cancel delete action
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const totalDonations = donations.length;
  const totalLivesSaved = donations.reduce((sum: number, d: DonationRecord) => sum + (d.units * 3), 0);
  const totalUnits = donations.reduce((sum: number, d: DonationRecord) => sum + d.units, 0);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Back Button - Fixed Position (same as login page) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/home')}
            className="fixed top-14 md:top-24 left-2 md:left-6 h-12 w-12 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
          </Button>
        </motion.div>

        {/* Success Notification */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              className="fixed top-4 right-4 z-50"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Track Your</span>{" "}
              <span className="text-foreground">Impact</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Record your blood donations and see the lives you've helped save, {userName}
            </p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Badge className="bg-red-50 text-red-600 border-red-200 px-4 py-2">
              <Droplets className="w-4 h-4 mr-2" />
              Blood Type: {bloodGroup}
            </Badge>
          </motion.div>
        </motion.div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{totalDonations}</div>
                    <div className="text-xs sm:text-sm text-red-700">Total Donations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{totalLivesSaved}</div>
                    <div className="text-xs sm:text-sm text-green-700">Lives Potentially Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-sky-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalUnits}</div>
                    <div className="text-xs sm:text-sm text-blue-700">Units Donated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Add New Donation Button */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Donation History</h2>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingRecord(null);
              setFormData({
                recipientName: '',
                donationDate: '',
                location: '',
                bloodType: bloodGroup,
                units: 1,
                recipientAge: '',
                recipientGender: '',
                notes: ''
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-red-500 cursor-pointer hover:bg-red-600 text-white w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Donation Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle>{editingRecord ? 'Edit Donation Record' : 'Add New Donation Record'}</DialogTitle>
                  <DialogDescription>
                    Enter the details of your blood donation to track your impact.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <motion.div 
                    className='space-y-2'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      placeholder="Enter recipient's name"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    />
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      className='space-y-2'
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Label htmlFor="donationDate">Donation Date *</Label>
                      <Input
                        id="donationDate"
                        type="date"
                        value={formData.donationDate}
                        onChange={(e) => handleInputChange('donationDate', e.target.value)}
                      />
                    </motion.div>
                    <motion.div 
                      className='space-y-2'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Label htmlFor="units">Units Donated</Label>
                      <Select value={formData.units.toString()} onValueChange={(value) => handleInputChange('units', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Unit</SelectItem>
                          <SelectItem value="2">2 Units</SelectItem>
                          <SelectItem value="3">3 Units</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  <motion.div 
                    className='space-y-2'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="Hospital/Blood bank name"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      className='space-y-2'
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Input
                        id="bloodType"
                        placeholder="Blood type"
                        value={bloodGroup}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        title="Edit your blood type in your profile page."
                      />
                    </motion.div>
                    <motion.div 
                      className='space-y-2'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Label htmlFor="recipientAge">Recipient Age</Label>
                      <Input
                        id="recipientAge"
                        type="number"
                        placeholder="Age"
                        value={formData.recipientAge}
                        onChange={(e) => handleInputChange('recipientAge', e.target.value)}
                      />
                    </motion.div>
                  </div>

                  <motion.div 
                    className='space-y-2'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label htmlFor="recipientGender">Recipient Gender</Label>
                    <Select value={formData.recipientGender} onValueChange={(value) => handleInputChange('recipientGender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div 
                    className='space-y-2'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the donation..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                    />
                  </motion.div>
                </div>
                <div className='flex justify-center items-center'>
                  <DialogFooter>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-red-500 cursor-pointer hover:bg-red-600"
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      {editingRecord ? 'Update Record' : 'Save Record'}
                    </Button>
                    <Button
                      variant="outline"
                      className='cursor-pointer'
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 mb-6 bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="text-red-600 text-center">{error}</div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Donation Records */}
        <div className="space-y-4 sm:space-y-6 mb-8 lg:mb-12">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0">
                <CardContent className="p-8 sm:p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-500" />
                  <div className="text-lg text-muted-foreground">Loading your donation records...</div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {donations.length === 0 && !loading && !error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0">
                <CardContent className="p-8 sm:p-12 text-center">
                  <motion.div 
                    className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Heart className="w-8 h-8 text-gray-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No donation records yet</h3>
                  <p className="text-gray-600 mb-4">Start tracking your blood donations to see your impact!</p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Donation
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <AnimatePresence>
              {donations.map((donation, index) => (
                <motion.div
                  key={donation._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  layout
                >
                  <Card className="border-0 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                              <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                                {donation.recipientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{donation.recipientName}</h3>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                              >
                                <Badge className="bg-green-50 text-green-600 border-green-200 w-fit">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              </motion.div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {new Date(donation.donationDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{donation.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4 flex-shrink-0" />
                                <span>{donation.units} Unit{donation.units > 1 ? 's' : ''} ({donation.bloodType})</span>
                              </div>
                            </div>

                            {(donation.recipientAge || donation.recipientGender) && (
                              <div className="mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 flex-shrink-0" />
                                  <span>
                                    {donation.recipientGender && `${donation.recipientGender}`}
                                    {donation.recipientAge && `, ${donation.recipientAge} years old`}
                                  </span>
                                </div>
                              </div>
                            )}

                            {donation.notes && (
                              <motion.div 
                                className="mt-3 p-3 bg-gray-50 rounded-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              >
                                <p className="text-sm text-gray-700">{donation.notes}</p>
                              </motion.div>
                            )}

                            <div className="mt-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2, delay: 0.3 }}
                              >
                                <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                                  <Target className="w-3 h-3 mr-1" />
                                  Potentially saved {donation.units * 3} lives
                                </Badge>
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 lg:flex-col lg:gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(donation)}
                              className="flex-1 lg:flex-none cursor-pointer lg:w-full"
                            >
                              <Edit className="w-4 h-4 mr-2 lg:mr-0" />
                              <span className="lg:hidden">Edit</span>
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(donation)}
                              disabled={loading}
                              className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 flex-1 lg:flex-none lg:w-full"
                            >
                              <Trash2 className="w-4 h-4 mr-2 lg:mr-0" />
                              <span className="lg:hidden">Delete</span>
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Achievement Section */}
        <AnimatePresence>
          {donations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50 mb-12">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center">
                    <motion.div 
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Life Saver Achievement!</h3>
                    <p className="text-gray-600 mb-4">
                      You've made {totalDonations} donation{totalDonations > 1 ? 's' : ''} and potentially saved {totalLivesSaved} lives!
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress to next milestone</span>
                        <span>{totalDonations}/5</span>
                      </div>
                      <Progress value={(totalDonations / 5) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NEW: Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Confirm Delete
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this donation record? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              {recordToDelete && (
                <motion.div 
                  className="py-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{recordToDelete.recipientName}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(recordToDelete.donationDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {recordToDelete.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        {recordToDelete.units} Unit{recordToDelete.units > 1 ? 's' : ''} ({recordToDelete.bloodType})
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <DialogFooter>
                <div className='flex items-center justify-center gap-2'>
                  <Button
                    onClick={confirmDelete}
                    disabled={loading}
                    className="bg-red-500 cursor-pointer hover:bg-red-600 text-white"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Delete Record
                  </Button>
                  <Button className='cursor-pointer' variant="outline" onClick={cancelDelete}>
                    Cancel
                  </Button>
                </div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default TrackImpactPage;
