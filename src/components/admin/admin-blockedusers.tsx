/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, UserX, UserCheck, Calendar, Mail, Phone, MapPin, Users, Heart, CheckCircle } from 'lucide-react';

interface BlockedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  registeredAt: string;
  blockedAt: string;
  blockedReason: string;
  totalReports: number;
  lastActivity: string;
  profilePicture?: string;
}

interface BlockedDonor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  registeredAt: string;
  blockedAt: string;
  blockedReason: string;
  totalReports: number;
  lastActivity: string;
  totalDonations: number;
  lastDonation?: string;
}

export default function BlockedUsersPage() {
  // State declarations
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedDonors, setBlockedDonors] = useState<BlockedDonor[]>([]);
  const [loading, setLoading] = useState(false);

  // View user dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<BlockedDonor | null>(null);

  // Unblock confirmation dialog states
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<BlockedUser | null>(null);
  const [donorToUnblock, setDonorToUnblock] = useState<BlockedDonor | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);

  // Success confirmation dialog states
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [unblockedUserName, setUnblockedUserName] = useState('');
  const [unblockedUserType, setUnblockedUserType] = useState<'user' | 'donor'>('user');

  // Fetch blocked users effect
  useEffect(() => {
    async function fetchBlockedUsers() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/blockedusers');
        const data = await res.json();
        // The API returns { blockedUsers: [...] }
        const users: BlockedUser[] = [];
        const donors: BlockedDonor[] = [];
        if (Array.isArray(data.blockedUsers)) {
          for (const item of data.blockedUsers) {
            // If donor info exists, treat as donor, else as user
            if (item.donor) {
              donors.push({
                id: item.userId,
                name: item.donor.name || item.user?.name || '',
                email: item.donor.email || item.user?.email || '',
                phone: item.donor.phone || item.user?.phone || '',
                bloodType: item.donor.bloodType || '',
                location: item.donor.city || item.donor.location || '',
                registeredAt: item.donor.createdAt || '',
                blockedAt: item.createdAt || '',
                blockedReason: item.reason || '',
                totalReports: 0,
                lastActivity: '',
                totalDonations: item.donor.totalDonations || 0,
                lastDonation: item.donor.lastDonation || '',
              });
            } else if (item.user) {
              users.push({
                id: item.userId,
                name: item.user.name || '',
                email: item.user.email || '',
                phone: item.user.phone || '',
                bloodType: item.user.bloodType || '',
                location: item.user.city || '',
                registeredAt: item.user.createdAt || '',
                blockedAt: item.createdAt || '',
                blockedReason: item.reason || '',
                totalReports: 0,
                lastActivity: '',
              });
            }
          }
        }
        setBlockedUsers(users);
        setBlockedDonors(donors);
      } catch (err) {
        setBlockedUsers([]);
        setBlockedDonors([]);
      }
      setLoading(false);
    }
    fetchBlockedUsers();
  }, []);

  // Handler functions
  const handleViewUser = (user: BlockedUser) => {
    setSelectedUser(user);
    setSelectedDonor(null);
    setIsViewDialogOpen(true);
  };

  const handleViewDonor = (donor: BlockedDonor) => {
    setSelectedDonor(donor);
    setSelectedUser(null);
    setIsViewDialogOpen(true);
  };

  const handleUnblockUserClick = (user: BlockedUser) => {
    setUserToUnblock(user);
    setDonorToUnblock(null);
    setIsUnblockDialogOpen(true);
  };

  const handleUnblockDonorClick = (donor: BlockedDonor) => {
    setDonorToUnblock(donor);
    setUserToUnblock(null);
    setIsUnblockDialogOpen(true);
  };

  const handleConfirmUnblock = async () => {
    const itemToUnblock = userToUnblock || donorToUnblock;
    if (!itemToUnblock) return;

    setIsUnblocking(true);
    try {
      const response = await fetch('/api/admin/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: itemToUnblock.id })
      });
      if (!response.ok) throw new Error('Failed to unblock user/donor');

      // Store unblocked user info for success dialog
      setUnblockedUserName(itemToUnblock.name);
      setUnblockedUserType(userToUnblock ? 'user' : 'donor');

      // Update state to remove unblocked user/donor
      if (userToUnblock) {
        setBlockedUsers(prev => prev.filter(user => user.id !== userToUnblock.id));
      } else if (donorToUnblock) {
        setBlockedDonors(prev => prev.filter(donor => donor.id !== donorToUnblock.id));
      }

      // Close unblock dialog and reset states
      setIsUnblockDialogOpen(false);
      setUserToUnblock(null);
      setDonorToUnblock(null);

      // Show success dialog
      setIsSuccessDialogOpen(true);

    } catch (error) {
      console.error('Failed to unblock user/donor:', error);
      alert('Failed to unblock user/donor. Please try again.');
    } finally {
      setIsUnblocking(false);
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBlockedDuration = (blockedAt: string) => {
    const blocked = new Date(blockedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - blocked.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Render functions
  const renderUserTable = (users: BlockedUser[], onView: (user: BlockedUser) => void, onUnblock: (user: BlockedUser) => void) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>When Blocked</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm font-medium">{getBlockedDuration(user.blockedAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(user.blockedAt)}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onView(user)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onUnblock(user)}
                    className="cursor-pointer text-green-600 focus:text-green-600"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Unblock User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderDonorTable = (donors: BlockedDonor[], onView: (donor: BlockedDonor) => void, onUnblock: (donor: BlockedDonor) => void) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>When Blocked</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {donors.map((donor) => (
          <TableRow key={donor.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">{donor.name}</p>
                  <p className="text-sm text-muted-foreground">{donor.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm font-medium">{getBlockedDuration(donor.blockedAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(donor.blockedAt)}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onView(donor)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onUnblock(donor)}
                    className="cursor-pointer text-green-600 focus:text-green-600"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Unblock Donor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
        <h1 className="text-3xl font-bold text-red-800 mb-2 flex items-center gap-2">
          <UserX className="w-8 h-8" />
          Blocked Users
        </h1>
        <p className="text-red-600">
          Manage users who have been blocked from the platform due to policy violations.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-700">Total Blocked: {blockedUsers.length + blockedDonors.length} users</span>
          </div>
        </div>
      </div>

      {/* Blocked Users Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            All Blocked Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users ({blockedUsers.length})
              </TabsTrigger>
              <TabsTrigger value="donors" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Donors ({blockedDonors.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              {blockedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No blocked users found</p>
                </div>
              ) : (
                renderUserTable(blockedUsers, handleViewUser, handleUnblockUserClick)
              )}
            </TabsContent>
            
            <TabsContent value="donors" className="mt-6">
              {blockedDonors.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No blocked donors found</p>
                </div>
              ) : (
                renderDonorTable(blockedDonors, handleViewDonor, handleUnblockDonorClick)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View User/Donor Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              {selectedUser ? <Users className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
              Blocked {selectedUser ? 'User' : 'Donor'} Details
            </DialogTitle>
          </DialogHeader>
          
          {(selectedUser || selectedDonor) && (
            <div className="space-y-6">
              {/* User/Donor Header */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      {selectedUser ? <Users className="w-6 h-6 text-red-600" /> : <Heart className="w-6 h-6 text-red-600" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">
                        {selectedUser?.name || selectedDonor?.name}
                      </h3>
                      <Badge variant="destructive" className="text-xs">
                        BLOCKED {selectedUser ? 'USER' : 'DONOR'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-red-600">
                    <p>Blocked {getBlockedDuration((selectedUser || selectedDonor)!.blockedAt)}</p>
                    <p>{formatDate((selectedUser || selectedDonor)!.blockedAt)}</p>
                  </div>
                </div>
              </div>

              {/* User/Donor Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{(selectedUser || selectedDonor)!.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{(selectedUser || selectedDonor)!.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-gray-600">{(selectedUser || selectedDonor)!.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Blood Type</p>
                        <p className="text-sm text-gray-600">{(selectedUser || selectedDonor)!.bloodType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Account Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Registered</p>
                        <p className="text-sm text-gray-600">{formatDate((selectedUser || selectedDonor)!.registeredAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Last Activity</p>
                        <p className="text-sm text-gray-600">{formatDate((selectedUser || selectedDonor)!.lastActivity)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Total Reports</p>
                        <p className="text-sm text-gray-600">{(selectedUser || selectedDonor)!.totalReports} reports</p>
                      </div>
                    </div>

                    {/* Donor-specific information */}
                    {selectedDonor && (
                      <>
                        <div className="flex items-center space-x-3">
                          <Heart className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">Total Donations</p>
                            <p className="text-sm text-gray-600">{selectedDonor.totalDonations} donations</p>
                          </div>
                        </div>
                        
                        {selectedDonor.lastDonation && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">Last Donation</p>
                              <p className="text-sm text-gray-600">{formatDate(selectedDonor.lastDonation)}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Block Reason */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Block Reason</h4>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-gray-800">{(selectedUser || selectedDonor)!.blockedReason}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedUser(null);
                setSelectedDonor(null);
              }}
            >
              Close
            </Button>
            {(selectedUser || selectedDonor) && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (selectedUser) {
                    handleUnblockUserClick(selectedUser);
                  } else if (selectedDonor) {
                    handleUnblockDonorClick(selectedDonor);
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Unblock {selectedUser ? 'User' : 'Donor'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Confirm Unblock {userToUnblock ? 'User' : 'Donor'}
            </AlertDialogTitle>
            {(userToUnblock || donorToUnblock) && (
              <>
                <AlertDialogDescription>
                  {`Are you sure you want to unblock ${(userToUnblock || donorToUnblock)!.name}?\n\nThis action will restore their access to the platform and they will be able to:`}
                </AlertDialogDescription>
                <div className="mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Log in to their account</li>
                    {donorToUnblock && <li>Schedule blood donations</li>}
                    <li>Communicate with other users</li>
                    <li>Access all platform features</li>
                  </ul>
                </div>
              </>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnblocking}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnblock}
              disabled={isUnblocking}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUnblocking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Unblocking...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Yes, Unblock {userToUnblock ? 'User' : 'Donor'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Confirmation Dialog - NEW */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-green-600">
                {unblockedUserType === 'user' ? 'User' : 'Donor'} Unblocked Successfully
              </DialogTitle>
              <div className="text-center text-muted-foreground text-sm">
                <p><strong>{unblockedUserName}</strong> has been successfully unblocked and can now access the platform.</p>
                <br />
                <p>The {unblockedUserType} can now:</p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Move the list outside of DialogDescription to avoid hydration errors */}
          <div className="px-6 pb-4">
            <ul className="list-disc list-inside space-y-1 text-left text-sm">
              <li>Log in to their account</li>
              {unblockedUserType === 'donor' && <li>Schedule blood donations</li>}
              <li>Communicate with other users</li>
              <li>Access all platform features</li>
              <li>Appear in search results</li>
            </ul>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-4">
              <p className="text-green-800 text-sm">
                The {unblockedUserType} has been removed from the blocked list and restored to active status.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => {
                setIsSuccessDialogOpen(false);
                setUnblockedUserName('');
                setUnblockedUserType('user');
              }}
              className="cursor-pointer bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
