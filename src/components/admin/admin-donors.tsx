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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MoreVertical, 
  Eye, 
  AlertTriangle, 
  Ban, 
  Heart, 
  Search, 
  CheckCircle, 
  Send, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  Activity,
  MessageSquare,
  ThumbsUp,
  Clock
} from 'lucide-react';

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
  role: string;
  userId: string;
}

type BackendDonor = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentAge?: number;
  age?: number;
  bloodType?: string;
  blood_type?: string;
  city?: string;
  location?: string;
  isAvailable?: boolean;
  isBlocked?: boolean;
  createdAt?: string;
  joinedAt?: string;
  lastDonation?: string;
  totalDonations?: number;
  role?: string;
  userId?: string;
};

interface Notification {
  donorId?: string;
  userId?: string;
  type: 'vote' | 'report';
  message?: string;
  content?: string;
  description?: string;
  createdAt?: string;
  reporterName?: string;
  voterName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function DonorsManagement() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [loading] = useState(false);

  // Block confirmation dialog states
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [donorToBlock, setDonorToBlock] = useState<Donor | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  // Success confirmation dialog states
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [blockedDonorName, setBlockedDonorName] = useState('');

  // State for showing reports and votes
  const [donorReports, setDonorReports] = useState<Notification[]>([]);
  const [donorVotes, setDonorVotes] = useState<Notification[]>([]);

  // Warning dialog states
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [selectedDonorForWarning, setSelectedDonorForWarning] = useState<Donor | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSendingWarning, setIsSendingWarning] = useState(false);

  // Warning success dialog states
  const [isWarningSuccessDialogOpen, setIsWarningSuccessDialogOpen] = useState(false);
  const [warnedDonorName, setWarnedDonorName] = useState('');

  // Fetch all donors and their vote/report counts from masternotifications
  useEffect(() => {
    async function fetchDonorsAndNotifications() {
      try {
        const donorsRes = await fetch('/api/donors');
        if (!donorsRes.ok) throw new Error('Failed to fetch donors');
        const donorsData = await donorsRes.json();
        const mappedDonors: Donor[] = Array.isArray(donorsData.donors)
          ? (donorsData.donors as BackendDonor[]).map((d) => ({
              id: d._id,
              name: d.name,
              email: d.email,
              phone: d.phone,
              age: d.currentAge || d.age || 0,
              bloodType: d.bloodType || d.blood_type || '',
              location: d.city || d.location || '',
              isAvailable: d.isAvailable ?? true,
              isBlocked: d.isBlocked ?? false,
              joinedAt: d.createdAt || d.joinedAt || '',
              numberOfVotes: 0,
              numberOfReports: 0,
              lastDonation: d.lastDonation || '',
              totalDonations: d.totalDonations || 0,
              role: d.role || 'donor',
              userId: d.userId || d._id
            }))
          : [];

        // Fetch masternotifications for votes/reports
        const notifRes = await fetch('/api/admin/masternotifications');
        if (!notifRes.ok) throw new Error('Failed to fetch notifications');
        const notifData = await notifRes.json();
        if (Array.isArray(notifData.notifications)) {
          mappedDonors.forEach((donor) => {
            const votes = notifData.notifications.filter((n: Notification) => {
              return n.receiver === donor.userId && n.type === 'vote';
            }).length;
            const reports = notifData.notifications.filter((n: Notification) => {
              return n.receiver === donor.userId && n.type === 'report';
            }).length;
            donor.numberOfVotes = votes;
            donor.numberOfReports = reports;
          });
        }
        setDonors(mappedDonors);
        setFilteredDonors(mappedDonors);
      } catch (err) {
        console.error('Error fetching donors:', err);
        setDonors([]);
        setFilteredDonors([]);
      }
    }
    fetchDonorsAndNotifications();
  }, []);

  // Filter donors based on search and filters (exclude blocked donors)
  useEffect(() => {
    let filtered = donors.filter(donor => donor.role !== 'blocked');
    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(donor => donor.isAvailable);
    } else if (availabilityFilter === 'not-available') {
      filtered = filtered.filter(donor => !donor.isAvailable);
    }
    setFilteredDonors(filtered);
  }, [donors, searchTerm, availabilityFilter]);

  const handleViewDonor = async (donor: Donor) => {
    setSelectedDonor(donor);
    
    // Fetch reports and votes for this donor
    try {
      const notifRes = await fetch('/api/admin/masternotifications');
      if (!notifRes.ok) throw new Error('Failed to fetch notifications');
      const notifData = await notifRes.json();
      if (Array.isArray(notifData.notifications)) {
        const reports = notifData.notifications.filter((n: Notification) => {
          return n.receiver === donor.userId && n.type === 'report';
        });
        const votes = notifData.notifications.filter((n: Notification) => {
          return n.receiver === donor.userId && n.type === 'vote';
        });
        setDonorReports(reports);
        setDonorVotes(votes);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setDonorReports([]);
      setDonorVotes([]);
    }
  };

  const handleSendWarning = (donor: Donor) => {
    setSelectedDonorForWarning(donor);
    setWarningMessage(`Dear ${donor.name},

We have noticed multiple reports regarding your activities and behavior on our blood donation platform. This serves as an official warning.

Please ensure that you comply with our community guidelines and maintain appropriate conduct while using our services.

Continued violations may result in account suspension or permanent ban.

Best regards,
Blood Donation Platform Admin Team`);
    setIsWarningDialogOpen(true);
  };

  const handleConfirmWarning = async () => {
    if (!selectedDonorForWarning || !warningMessage.trim()) return;
    setIsSendingWarning(true);
    try {
      const response = await fetch('/api/admin/sendreport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedDonorForWarning.userId || selectedDonorForWarning.id,
          message: warningMessage
        })
      });
      if (!response.ok) throw new Error('Failed to send warning');
      setWarnedDonorName(selectedDonorForWarning.name);
      setIsWarningDialogOpen(false);
      setSelectedDonorForWarning(null);
      setWarningMessage('');
      setIsWarningSuccessDialogOpen(true);
    } catch (error) {
      console.error('Warning send error:', error);
      alert('Failed to send warning. Please try again.');
    } finally {
      setIsSendingWarning(false);
    }
  };

  const handleBlockClick = (donor: Donor) => {
    // Prevent blocking admins
    if (donor.role === 'admin') {
      alert('You cannot block an admin user.');
      return;
    }
    setDonorToBlock(donor);
    setIsBlockDialogOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!donorToBlock) return;
    // Use donorToBlock.userId if available, fallback to donorToBlock.id
    const blockId = donorToBlock.userId || donorToBlock.id;
    if (!blockId) {
      alert('Invalid donor ID.');
      return;
    }
    // Prevent blocking admins (extra safety)
    if (donorToBlock.role === 'admin') {
      alert('You cannot block an admin user.');
      return;
    }
    setIsBlocking(true);
    try {
      const response = await fetch('/api/admin/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: blockId })
      });
      if (!response.ok) throw new Error('Failed to block donor');

      setDonors(prev =>
        prev.map(donor =>
          donor.id === donorToBlock.id ? { ...donor, isBlocked: true } : donor
        )
      );
      setBlockedDonorName(donorToBlock.name);
      setIsBlockDialogOpen(false);
      setDonorToBlock(null);
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Failed to block donor:', error);
      alert('Failed to block donor. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  // Helper functions
  const getAvailabilityStatus = (donor: Donor) => {
    if (donor.isAvailable) {
      return { text: 'Available', color: 'bg-green-100 text-green-800' };
    } else {
      return { text: 'Not Available', color: 'bg-red-100 text-red-800' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day  : 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Donors Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all blood donors on the platform.
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors by name, email, or blood type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Active Donors</SelectItem>
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
            Active Blood Donors ({filteredDonors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Available or Not</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Number of Reports</TableHead>
                <TableHead>Number of Votes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonors.map((donor) => {
                const status = getAvailabilityStatus(donor);
                return (
                  <TableRow key={donor.id} className="cursor-pointer hover:bg-muted/50">
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
                      <span className="text-sm">{formatJoinDate(donor.joinedAt)}</span>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {donor.numberOfVotes}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDonor(donor)}
                            className="cursor-pointer hover:bg-muted"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Data
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSendWarning(donor)}
                            className="cursor-pointer text-orange-600 focus:text-orange-600 hover:bg-orange-50"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Send Warning
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBlockClick(donor)}
                            className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50"
                            disabled={donor.role === 'admin'}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {donor.role === 'admin' ? 'Cannot Block Admin' : 'Block Donor'}
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

      {/* Full Screen Donor Details Dialog */}
      <Dialog open={!!selectedDonor} onOpenChange={() => setSelectedDonor(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 m-0 border-0">
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center  justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    {selectedDonor?.name}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Complete donor profile and activity overview
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Content */}
            {selectedDonor && (
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="overview" className="h-full flex flex-col">
                  <div className="px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                      <TabsTrigger value="overview" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="reports" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Reports ({donorReports.length})
                      </TabsTrigger>
                      <TabsTrigger value="votes" className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        Votes ({donorVotes.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[75vh]">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Personal Information Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Full Name</p>
                              <p className="font-medium text-lg">{selectedDonor.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium text-lg">{selectedDonor.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium text-lg">{selectedDonor.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Age</p>
                              <p className="font-medium text-lg">{selectedDonor.age} years</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="font-medium text-lg">{selectedDonor.location}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Medical Information Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Droplets className="w-5 h-5" />
                            Medical Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center gap-3">
                            <Droplets className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Blood Type</p>
                              <Badge variant="outline" className="font-medium text-xl px-4 py-2">
                                {selectedDonor.bloodType}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Availability Status</p>
                              <Badge className={`${getAvailabilityStatus(selectedDonor).color} px-4 py-2`}>
                                {getAvailabilityStatus(selectedDonor).text}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Heart className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Donations</p>
                              <p className="font-medium text-3xl">{selectedDonor.totalDonations}</p>
                            </div>
                          </div>
                          {selectedDonor.lastDonation && (
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Last Donation</p>
                                <p className="font-medium text-lg">{formatJoinDate(selectedDonor.lastDonation)}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Platform Activity Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Platform Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Member Since</p>
                              <p className="font-medium text-lg">{formatJoinDate(selectedDonor.joinedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Votes Received</p>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 px-4 py-2">
                                {selectedDonor.numberOfVotes}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Reports</p>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  selectedDonor.numberOfReports > 0 
                                    ? "bg-red-50 text-red-700" 
                                    : "bg-green-50 text-green-700"
                                } px-4 py-2`}
                              >
                                {selectedDonor.numberOfReports}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Avg. Donations/Month</p>
                              <p className="font-medium text-lg">{(selectedDonor.totalDonations / 6).toFixed(1)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Additional Statistics Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Detailed Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center gap-3">
                            <Heart className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Days Since Joining</p>
                              <p className="font-medium text-lg">
                                {Math.floor((new Date().getTime() - new Date(selectedDonor.joinedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Account Status</p>
                              <Badge variant="outline" className="bg-green-50 text-green-700 px-4 py-2">
                                {selectedDonor.isBlocked ? 'Blocked' : 'Active'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">User Role</p>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 px-4 py-2 capitalize">
                                {selectedDonor.role}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Droplets className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Donation Frequency</p>
                              <p className="font-medium text-lg">
                                {selectedDonor.totalDonations > 0 ? 'Regular Donor' : 'New Donor'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-6 pt-8 border-t items-center justify-center">
                      <Button
                        onClick={() => handleSendWarning(selectedDonor)}
                        variant="outline"
                        className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 px-6 py-3"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Send Warning
                      </Button>
                      <Button
                        onClick={() => handleBlockClick(selectedDonor)}
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 px-6 py-3"
                        disabled={selectedDonor.role === 'admin'}
                      >
                        <Ban className="w-4 h-4" />
                        {selectedDonor.role === 'admin' ? 'Cannot Block Admin' : 'Block Donor'}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Reports Tab */}
                  <TabsContent value="reports" className="flex-1 overflow-y-auto p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          All Reports ({donorReports.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {donorReports.length === 0 ? (
                          <div className="text-center py-12">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No reports found for this donor.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {donorReports.map((report, idx) => (
                              <div key={idx} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="bg-red-50 text-red-700">
                                        Report #{idx + 1}
                                      </Badge>
                                      {report.createdAt && (
                                        <span className="text-sm text-muted-foreground">
                                          {formatDate(report.createdAt)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                      {report.message || report.content || report.description || 'No message provided'}
                                    </p>
                                    {report.reporterName && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Reported by: {report.reporterName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Votes Tab */}
                  <TabsContent value="votes" className="flex-1 overflow-y-auto p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ThumbsUp className="w-5 h-5" />
                          All Votes ({donorVotes.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {donorVotes.length === 0 ? (
                          <div className="text-center py-12">
                            <ThumbsUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No votes found for this donor.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {donorVotes.map((vote, idx) => (
                              <div key={idx} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        Vote #{idx + 1}
                                      </Badge>
                                      {vote.createdAt && (
                                        <span className="text-sm text-muted-foreground">
                                          {formatDate(vote.createdAt)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                      {vote.message || vote.content || vote.description || 'Positive feedback received'}
                                    </p>
                                    {vote.voterName && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Voted by: {vote.voterName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Send Warning to Donor
            </DialogTitle>
          </DialogHeader>
          
          {selectedDonorForWarning && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Sending warning to:</h4>
                <div className="space-y-1">
                  <p><strong>Name:</strong> {selectedDonorForWarning.name}</p>
                  <p><strong>Email:</strong> {selectedDonorForWarning.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warning-message" className="cursor-pointer">Warning Message</Label>
                <Textarea
                  id="warning-message"
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Enter your warning message..."
                  className="min-h-[200px] cursor-text"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsWarningDialogOpen(false);
                setSelectedDonorForWarning(null);
                setWarningMessage('');
              }}
              disabled={isSendingWarning}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWarning}
              disabled={!warningMessage.trim() || isSendingWarning}
              className="cursor-pointer bg-orange-600 hover:bg-orange-700"
            >
              {isSendingWarning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Warning
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Success Dialog - COMPLETELY FIXED FOR HYDRATION ERROR */}
      <Dialog open={isWarningSuccessDialogOpen} onOpenChange={setIsWarningSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <DialogTitle className="text-orange-600">
                Warning Sent Successfully
              </DialogTitle>
              <div className="text-center text-muted-foreground text-sm">
                <p>The warning has been successfully sent to <strong>{warnedDonorName}</strong>.</p>
                <br />
                <p>The following actions have been taken:</p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Move the list and additional content outside of DialogDescription */}
          <div className="px-6 pb-4">
            <ul className="list-disc list-inside space-y-1 text-left text-sm">
              <li>Donor has been notified via email or in-app message</li>
              <li>Warning stored in admin records</li>
              <li>Further violations may result in account suspension</li>
            </ul>
            
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mt-4">
              <p className="text-orange-800 text-sm">
                You can monitor this donor for further actions if needed.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => {
                setIsWarningSuccessDialogOpen(false);
                setWarnedDonorName('');
              }}
              className="cursor-pointer bg-orange-600 hover:bg-orange-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" />
              Confirm Block Donor
            </AlertDialogTitle>
            {donorToBlock && (
              <>
                <AlertDialogDescription>
                  Are you sure you want to block <strong>{donorToBlock.name}</strong>?<br /><br />This action will:
                </AlertDialogDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Prevent them from logging into their account</li>
                  <li>Remove them from active donor searches</li>
                  <li>Cancel any scheduled donations</li>
                  <li>Move them to the blocked users list</li>
                </ul>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
                  <p className="text-red-800 text-sm font-medium">
                    <strong>Note:</strong> Once blocked, this donor will no longer appear in the active donors list. 
                    You can manage blocked users from the "Blocked Users" section.
                  </p>
                </div>
              </>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              disabled={isBlocking}
              className="cursor-pointer bg-red-600 hover:bg-red-700"
            >
              {isBlocking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Blocking...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Yes, Block Donor
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
                Donor Blocked Successfully
              </DialogTitle>
              <div className="text-center text-muted-foreground text-sm">
                <p><strong>{blockedDonorName}</strong> has been successfully blocked and removed from the active donors list.</p>
                <br />
                <p>The donor will no longer be able to:</p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Move the list and additional content outside of DialogDescription */}
          <div className="px-6 pb-4">
            <ul className="list-disc list-inside space-y-1 text-left text-sm">
              <li>Access their account</li>
              <li>Schedule new donations</li>
              <li>Appear in donor searches</li>
              <li>Communicate with other users</li>
            </ul>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
              <p className="text-blue-800 text-sm">
                You can manage this user from the <strong>"Blocked Users"</strong> section if needed.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => {
                setIsSuccessDialogOpen(false);
                setBlockedDonorName('');
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
