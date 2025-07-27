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
import { MoreVertical, Eye, AlertTriangle, Ban, Heart, Search } from 'lucide-react';

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  bloodType: string;
  location: string;
  isAvailable: boolean;
  isBlocked: boolean;
  joinedAt: string;
  numberOfVotes: number;
  numberOfReports: number;
  lastDonation?: string;
  totalDonations: number;
}

// Dummy data for donors
const dummyDonors: Donor[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    age: 28,
    bloodType: 'O+',
    location: 'New York, NY',
    isAvailable: true,
    isBlocked: false,
    joinedAt: '2024-01-15T10:30:00Z',
    numberOfVotes: 15,
    numberOfReports: 0,
    lastDonation: '2024-01-10T08:00:00Z',
    totalDonations: 8
  },
  {
    id: '2',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1234567892',
    age: 45,
    bloodType: 'B+',
    location: 'Chicago, IL',
    isAvailable: false,
    isBlocked: false,
    joinedAt: '2024-01-13T09:15:00Z',
    numberOfVotes: 8,
    numberOfReports: 1,
    lastDonation: '2024-01-05T14:30:00Z',
    totalDonations: 3
  },
  {
    id: '3',
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    phone: '+1234567893',
    age: 22,
    bloodType: 'AB+',
    location: 'Houston, TX',
    isAvailable: true,
    isBlocked: false,
    joinedAt: '2024-01-12T16:45:00Z',
    numberOfVotes: 22,
    numberOfReports: 0,
    lastDonation: '2024-01-08T10:15:00Z',
    totalDonations: 12
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1234567894',
    age: 52,
    bloodType: 'O-',
    location: 'Phoenix, AZ',
    isAvailable: false,
    isBlocked: true,
    joinedAt: '2024-01-11T11:30:00Z',
    numberOfVotes: 5,
    numberOfReports: 3,
    lastDonation: '2023-12-20T09:00:00Z',
    totalDonations: 2
  },
  {
    id: '5',
    name: 'Robert Miller',
    email: 'robert.miller@example.com',
    phone: '+1234567896',
    age: 31,
    bloodType: 'B-',
    location: 'San Antonio, TX',
    isAvailable: true,
    isBlocked: false,
    joinedAt: '2024-01-09T08:10:00Z',
    numberOfVotes: 18,
    numberOfReports: 0,
    lastDonation: '2024-01-12T11:20:00Z',
    totalDonations: 6
  },
  {
    id: '6',
    name: 'Jennifer Taylor',
    email: 'jennifer.taylor@example.com',
    phone: '+1234567897',
    age: 26,
    bloodType: 'AB-',
    location: 'San Diego, CA',
    isAvailable: true,
    isBlocked: false,
    joinedAt: '2024-01-08T17:25:00Z',
    numberOfVotes: 12,
    numberOfReports: 0,
    lastDonation: '2024-01-14T13:45:00Z',
    totalDonations: 4
  },
  {
    id: '7',
    name: 'Christopher Lee',
    email: 'christopher.lee@example.com',
    phone: '+1234567898',
    age: 35,
    bloodType: 'O+',
    location: 'Dallas, TX',
    isAvailable: false,
    isBlocked: false,
    joinedAt: '2024-01-07T12:15:00Z',
    numberOfVotes: 7,
    numberOfReports: 2,
    lastDonation: '2023-12-28T16:30:00Z',
    totalDonations: 1
  },
  {
    id: '8',
    name: 'Amanda White',
    email: 'amanda.white@example.com',
    phone: '+1234567899',
    age: 29,
    bloodType: 'A-',
    location: 'San Jose, CA',
    isAvailable: true,
    isBlocked: false,
    joinedAt: '2024-01-06T09:30:00Z',
    numberOfVotes: 25,
    numberOfReports: 0,
    lastDonation: '2024-01-13T07:45:00Z',
    totalDonations: 15
  },
  {
    id: '9',
    name: 'Mark Johnson',
    email: 'mark.johnson@example.com',
    phone: '+1234567800',
    age: 33,
    bloodType: 'A+',
    location: 'Miami, FL',
    isAvailable: false,
    isBlocked: false,
    joinedAt: '2024-01-05T14:20:00Z',
    numberOfVotes: 10,
    numberOfReports: 1,
    lastDonation: '2024-01-02T12:00:00Z',
    totalDonations: 5
  },
  {
    id: '10',
    name: 'Rachel Green',
    email: 'rachel.green@example.com',
    phone: '+1234567801',
    age: 27,
    bloodType: 'B+',
    location: 'Seattle, WA',
    isAvailable: true,
    isBlocked: false,
    joinedAt: '2024-01-04T11:15:00Z',
    numberOfVotes: 20,
    numberOfReports: 0,
    lastDonation: '2024-01-11T15:30:00Z',
    totalDonations: 9
  }
];

export default function DonorsManagement() {
  const [donors, setDonors] = useState<Donor[]>(dummyDonors);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>(dummyDonors);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [loading] = useState(false);

  // Filter donors based on search and filters
  useEffect(() => {
    let filtered = donors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(donor => donor.isAvailable && !donor.isBlocked);
    } else if (availabilityFilter === 'not-available') {
      filtered = filtered.filter(donor => !donor.isAvailable || donor.isBlocked);
    }

    setFilteredDonors(filtered);
  }, [donors, searchTerm, availabilityFilter]);

  const handleViewDonor = (donor: Donor) => {
    setSelectedDonor(donor);
  };

  const handleSendWarning = (donorId: string) => {
    console.log('Send warning to donor:', donorId);
    // Implement warning functionality
    alert('Warning sent to donor!');
  };

  const handleBlockDonor = (donorId: string) => {
    setDonors(prev =>
      prev.map(donor =>
        donor.id === donorId ? { ...donor, isBlocked: !donor.isBlocked } : donor
      )
    );
    console.log('Toggle block status for donor:', donorId);
  };

  const getAvailabilityStatus = (donor: Donor) => {
    if (donor.isBlocked) {
      return { text: 'Blocked', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (donor.isAvailable) {
      return { text: 'Available', color: 'bg-green-100 text-green-700 border-green-200' };
    } else {
      return { text: 'Not Available', color: 'bg-orange-100 text-orange-700 border-orange-200' };
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
          Donors Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all registered blood donors in the system.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors by name, email, or blood type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Availability Filter */}
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Donors</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="not-available">Not Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Blood Donors ({filteredDonors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Available or Not</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Number of Votes</TableHead>
                <TableHead>Number of Reports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonors.map((donor) => {
                const status = getAvailabilityStatus(donor);
                return (
                  <TableRow key={donor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{donor.name}</p>
                        <p className="text-sm text-muted-foreground">{donor.bloodType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(donor.joinedAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {donor.numberOfVotes}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={
                            donor.numberOfReports > 0 
                              ? "bg-red-50 text-red-700" 
                              : "bg-green-50 text-green-700"
                          }
                        >
                          {donor.numberOfReports}
                        </Badge>
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
                            onClick={() => handleViewDonor(donor)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Data
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSendWarning(donor.id)}
                            className="cursor-pointer text-orange-600 focus:text-orange-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Send Warning
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBlockDonor(donor.id)}
                            className={`cursor-pointer ${
                              donor.isBlocked
                                ? 'text-green-600 focus:text-green-600'
                                : 'text-red-600 focus:text-red-600'
                            }`}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {donor.isBlocked ? 'Unblock Donor' : 'Block Donor'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Donor Details Modal */}
      <Dialog open={!!selectedDonor} onOpenChange={() => setSelectedDonor(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Donor Full Data</DialogTitle>
            <DialogDescription>
              Complete information about {selectedDonor?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedDonor.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedDonor.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedDonor.phone}</p>
                    <p><span className="font-medium">Age:</span> {selectedDonor.age} years</p>
                    <p><span className="font-medium">Blood Type:</span> {selectedDonor.bloodType}</p>
                    <p><span className="font-medium">Location:</span> {selectedDonor.location}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Donor Status</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <Badge className={getAvailabilityStatus(selectedDonor).color}>
                        {getAvailabilityStatus(selectedDonor).text}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Joined:</span> {formatDate(selectedDonor.joinedAt)}</p>
                    <p><span className="font-medium">Total Donations:</span> {selectedDonor.totalDonations}</p>
                    {selectedDonor.lastDonation && (
                      <p><span className="font-medium">Last Donation:</span> {formatDate(selectedDonor.lastDonation)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Community Feedback</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Votes Received:</span>{' '}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {selectedDonor.numberOfVotes}
                      </Badge>
                    </p>
                    <p>
                      <span className="font-medium">Reports:</span>{' '}
                      <Badge 
                        variant="outline" 
                        className={
                          selectedDonor.numberOfReports > 0 
                            ? "bg-red-50 text-red-700" 
                            : "bg-green-50 text-green-700"
                        }
                      >
                        {selectedDonor.numberOfReports}
                      </Badge>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Donation History</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Total Donations:</span> {selectedDonor.totalDonations}</p>
                    <p><span className="font-medium">Average per Month:</span> {(selectedDonor.totalDonations / 6).toFixed(1)}</p>
                    {selectedDonor.lastDonation && (
                      <p><span className="font-medium">Days Since Last:</span> {Math.floor((new Date().getTime() - new Date(selectedDonor.lastDonation).getTime()) / (1000 * 60 * 60 * 24))}</p>
                    )}
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
