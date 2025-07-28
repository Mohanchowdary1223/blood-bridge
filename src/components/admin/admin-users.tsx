/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogDescription,
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
import { MoreVertical, Eye, Ban, Users, Search, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  bloodType: string;
  reasonForSignup: 'donate-later' | 'health-issue' | 'above-age' | 'below-age' | string;
  location: string;
  isBlocked: boolean;
  joinedAt: string;
  role: 'user' | 'donor' | 'admin' | 'blocked';
}

type BackendUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentAge?: number;
  bloodType?: string;
  signupReason?: string;
  city?: string;
  isBlocked?: boolean;
  createdAt?: string;
  role?: 'user' | 'donor' | 'admin' | 'blocked';
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading] = useState(false);

  // Block confirmation dialog states
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  // Success confirmation dialog states
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [blockedUserName, setBlockedUserName] = useState('');

  // Fetch all users from backend and filter
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        // Map backend users to local User type
        const mappedUsers: User[] = Array.isArray(data)
          ? (data as BackendUser[]).map((u) => ({
              id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              age: u.currentAge || 0,
              bloodType: u.bloodType || '',
              reasonForSignup: u.signupReason || '',
              location: u.city || '',
              isBlocked: u.isBlocked || false,
              joinedAt: u.createdAt || '',
              role: u.role || 'user',
            }))
          : [];
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } catch (err) {
        setUsers([]);
        setFilteredUsers([]);
      }
    }
    fetchUsers();
  }, []);

  // Filter users based on search and filters (exclude blocked users and admins)
  useEffect(() => {
    // Only show users whose role is NOT 'donor', 'blocked', or 'admin' (i.e., pure users)
    let filtered = users.filter(user => user.role !== 'donor' && user.role !== 'blocked' && user.role !== 'admin');
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply reason filter - improved logic
    if (reasonFilter !== 'all') {
      filtered = filtered.filter(user => {
        // Normalize the reason for comparison (handle case sensitivity and variations)
        const userReason = user.reasonForSignup?.toLowerCase().trim();
        const filterReason = reasonFilter.toLowerCase().trim();
        
        // Direct match
        if (userReason === filterReason) return true;
        
        // Handle common variations
        switch (filterReason) {
          case 'donate-later':
            return userReason === 'donate-later' || userReason === 'donate later' || userReason === 'donatelater';
          case 'health-issue':
            return userReason === 'health-issue' || userReason === 'health issue' || userReason === 'healthissue';
          case 'above-age':
            return userReason === 'above-age' || userReason === 'above age' || userReason === 'aboveage';
          case 'below-age':
            return userReason === 'below-age' || userReason === 'below age' || userReason === 'belowage';
          default:
            return userReason === filterReason;
        }
      });
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, reasonFilter]);

  const handleViewUser = (user: User) => {
    // Fetch full user data from backend
    fetch(`/api/admin/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        // Map backend user to local User type
        const u = data as BackendUser;
        setSelectedUser({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          age: u.currentAge || 0,
          bloodType: u.bloodType || '',
          reasonForSignup: u.signupReason || '',
          location: u.city || '',
          isBlocked: u.isBlocked || false,
          joinedAt: u.createdAt || '',
          role: u.role || 'user',
        });
      })
      .catch(() => setSelectedUser(user));
  };

  const handleBlockClick = (user: User) => {
    // Prevent blocking admins
    if (user.role === 'admin') {
      alert('You cannot block an admin user.');
      return;
    }
    setUserToBlock(user);
    setIsBlockDialogOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!userToBlock) return;
    // Prevent blocking admins (extra safety)
    if (userToBlock.role === 'admin') {
      alert('You cannot block an admin user.');
      return;
    }
    setIsBlocking(true);
    try {
      const response = await fetch('/api/admin/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToBlock.id })
      });
      if (!response.ok) throw new Error('Failed to block user');

      setUsers(prev =>
        prev.map(user =>
          user.id === userToBlock.id ? { ...user, isBlocked: true, role: 'blocked' } : user
        )
      );
      setBlockedUserName(userToBlock.name);
      setIsBlockDialogOpen(false);
      setUserToBlock(null);
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Failed to block user:', error);
      alert('Failed to block user. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  const getReasonColor = (reason: string) => {
    const normalizedReason = reason?.toLowerCase().trim();
    switch (normalizedReason) {
      case 'donate-later':
      case 'donate later':
      case 'donatelater':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'health-issue':
      case 'health issue':
      case 'healthissue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'above-age':
      case 'above age':
      case 'aboveage':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'below-age':
      case 'below age':
      case 'belowage':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getReasonText = (reason: string) => {
    const normalizedReason = reason?.toLowerCase().trim();
    switch (normalizedReason) {
      case 'donate-later':
      case 'donate later':
      case 'donatelater':
        return 'Donate Later';
      case 'health-issue':
      case 'health issue':
      case 'healthissue':
        return 'Health Issue';
      case 'above-age':
      case 'above age':
      case 'aboveage':
        return 'Above Age';
      case 'below-age':
      case 'below age':
      case 'belowage':
        return 'Below Age';
      default:
        return reason || 'Not Specified';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Users Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all active registered users based on their signup reasons.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Reason Filter */}
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by signup reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Active Users</SelectItem>
                <SelectItem value="donate-later">Donate Later</SelectItem>
                <SelectItem value="health-issue">Health Issue</SelectItem>
                <SelectItem value="above-age">Above Age</SelectItem>
                <SelectItem value="below-age">Below Age</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Users ({filteredUsers.length})
            {reasonFilter !== 'all' && (
              <Badge variant="outline" className="ml-2">
                Filtered by: {getReasonText(reasonFilter)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {reasonFilter !== 'all' 
                  ? `No users found with "${getReasonText(reasonFilter)}" signup reason.`
                  : 'No users found matching your search criteria.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Reason for Signup</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getReasonColor(user.reasonForSignup)}>
                        {getReasonText(user.reasonForSignup)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(user.joinedAt)}</span>
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
                            onClick={() => handleViewUser(user)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Data
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBlockClick(user)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            disabled={user.role === 'admin'}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {user.role === 'admin' ? 'Cannot Block Admin' : 'Block User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Full Data</DialogTitle>
            <DialogDescription>
              Complete information about {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-sm">Name:</span>
                  <p className="text-muted-foreground">{selectedUser.name}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-sm">Email:</span>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-sm">Phone:</span>
                  <p className="text-muted-foreground">{selectedUser.phone}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-sm">Age:</span>
                  <p className="text-muted-foreground">{selectedUser.age} years</p>
                </div>
                
                <div>
                  <span className="font-semibold text-sm">Blood Type:</span>
                  <p className="text-muted-foreground">{selectedUser.bloodType}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-sm">Location:</span>
                  <p className="text-muted-foreground">{selectedUser.location}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-sm">Reason for Signup:</span>
                  <div className="mt-1">
                    <Badge className={getReasonColor(selectedUser.reasonForSignup)}>
                      {getReasonText(selectedUser.reasonForSignup)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" />
              Confirm Block User
            </AlertDialogTitle>
            {userToBlock && (
              <>
                <AlertDialogDescription>
                  Are you sure you want to block <strong>{userToBlock.name}</strong>?<br /><br />This action will:
                </AlertDialogDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Prevent them from logging into their account</li>
                  <li>Restrict access to all platform features</li>
                  <li>Cancel any active sessions</li>
                  <li>Move them to the blocked users list</li>
                </ul>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
                  <p className="text-red-800 text-sm font-medium">
                    <strong>Note:</strong> Once blocked, this user will no longer appear in the active users list. 
                    You can manage blocked users from the "Blocked Users" section.
                  </p>
                </div>
              </>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              disabled={isBlocking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBlocking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Blocking...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Yes, Block User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Confirmation Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-green-600">
                User Blocked Successfully
              </DialogTitle>
              <DialogDescription className="text-center">
                <strong>{blockedUserName}</strong> has been successfully blocked and removed from the active users list.
                <br /><br />
                The user will no longer be able to:
              </DialogDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>Access their account</li>
                <li>Use platform features</li>
                <li>Interact with other users</li>
                <li>Schedule any activities</li>
              </ul>
              <br />
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  You can manage this user from the <strong>"Blocked Users"</strong> section if needed.
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => {
                setIsSuccessDialogOpen(false);
                setBlockedUserName('');
              }}
              className="bg-green-600 hover:bg-green-700"
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
