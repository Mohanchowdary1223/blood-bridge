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
} from '@/components/ui/dialog';
import { MoreVertical, Eye, Ban, Users, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  bloodType: string;
  reasonForSignup: 'donate-later' | 'health-issue' | 'above-age' | 'below-age';
  location: string;
  isBlocked: boolean;
  joinedAt: string;
}

// Dummy data for users
const dummyUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    age: 28,
    bloodType: 'O+',
    reasonForSignup: 'donate-later',
    location: 'New York, NY',
    isBlocked: false,
    joinedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '+1234567891',
    age: 34,
    bloodType: 'A-',
    reasonForSignup: 'health-issue',
    location: 'Los Angeles, CA',
    isBlocked: false,
    joinedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1234567892',
    age: 45,
    bloodType: 'B+',
    reasonForSignup: 'donate-later',
    location: 'Chicago, IL',
    isBlocked: false,
    joinedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    phone: '+1234567893',
    age: 22,
    bloodType: 'AB+',
    reasonForSignup: 'donate-later',
    location: 'Houston, TX',
    isBlocked: false,
    joinedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1234567894',
    age: 52,
    bloodType: 'O-',
    reasonForSignup: 'above-age',
    location: 'Phoenix, AZ',
    isBlocked: true,
    joinedAt: '2024-01-11T11:30:00Z'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+1234567895',
    age: 39,
    bloodType: 'A+',
    reasonForSignup: 'health-issue',
    location: 'Philadelphia, PA',
    isBlocked: false,
    joinedAt: '2024-01-10T13:20:00Z'
  },
  {
    id: '7',
    name: 'Robert Miller',
    email: 'robert.miller@example.com',
    phone: '+1234567896',
    age: 31,
    bloodType: 'B-',
    reasonForSignup: 'donate-later',
    location: 'San Antonio, TX',
    isBlocked: false,
    joinedAt: '2024-01-09T08:10:00Z'
  },
  {
    id: '8',
    name: 'Jennifer Taylor',
    email: 'jennifer.taylor@example.com',
    phone: '+1234567897',
    age: 26,
    bloodType: 'AB-',
    reasonForSignup: 'donate-later',
    location: 'San Diego, CA',
    isBlocked: false,
    joinedAt: '2024-01-08T17:25:00Z'
  },
  {
    id: '9',
    name: 'Christopher Lee',
    email: 'christopher.lee@example.com',
    phone: '+1234567898',
    age: 17,
    bloodType: 'O+',
    reasonForSignup: 'below-age',
    location: 'Dallas, TX',
    isBlocked: false,
    joinedAt: '2024-01-07T12:15:00Z'
  },
  {
    id: '10',
    name: 'Amanda White',
    email: 'amanda.white@example.com',
    phone: '+1234567899',
    age: 16,
    bloodType: 'A-',
    reasonForSignup: 'below-age',
    location: 'San Jose, CA',
    isBlocked: false,
    joinedAt: '2024-01-06T09:30:00Z'
  },
  {
    id: '11',
    name: 'Mark Johnson',
    email: 'mark.johnson@example.com',
    phone: '+1234567800',
    age: 55,
    bloodType: 'O+',
    reasonForSignup: 'above-age',
    location: 'Miami, FL',
    isBlocked: false,
    joinedAt: '2024-01-05T14:20:00Z'
  },
  {
    id: '12',
    name: 'Rachel Green',
    email: 'rachel.green@example.com',
    phone: '+1234567801',
    age: 29,
    bloodType: 'B+',
    reasonForSignup: 'health-issue',
    location: 'Seattle, WA',
    isBlocked: false,
    joinedAt: '2024-01-04T11:15:00Z'
  }
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(dummyUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading] = useState(false);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Reason filter
    if (reasonFilter !== 'all') {
      filtered = filtered.filter(user => user.reasonForSignup === reasonFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, reasonFilter]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleBlockUser = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
      )
    );
    console.log('Toggle block status for user:', userId);
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'donate-later':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'health-issue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'above-age':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'below-age':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'donate-later':
        return 'Donate Later';
      case 'health-issue':
        return 'Health Issue';
      case 'above-age':
        return 'Above Age';
      case 'below-age':
        return 'Below Age';
      default:
        return reason;
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
          Manage and monitor all registered users based on their signup reasons.
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
                <SelectItem value="all">All Reasons</SelectItem>
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
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                          onClick={() => handleBlockUser(user.id)}
                          className={`cursor-pointer ${
                            user.isBlocked
                              ? 'text-green-600 focus:text-green-600'
                              : 'text-red-600 focus:text-red-600'
                          }`}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {user.isBlocked ? 'Unblock User' : 'Block User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                  <span className="font-semibold text-sm">Blood Type:</span>
                  <p className="text-muted-foreground">{selectedUser.bloodType}</p>
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
    </div>
  );
}
