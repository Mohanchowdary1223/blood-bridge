'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { MoreVertical, Eye, AlertTriangle, Ban, FileText } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
}

interface Report {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  message: string;
  createdAt: string;
}

// Dummy data for reports
const dummyReports: Report[] = [
  {
    id: '1',
    sender: { id: 'u1', name: 'John Smith', email: 'john.smith@example.com' },
    receiver: { id: 'u2', name: 'Emily Johnson', email: 'emily.johnson@example.com' },
    title: 'Inappropriate behavior during blood donation',
    message: 'The donor was being rude to medical staff during the donation process.',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    sender: { id: 'u3', name: 'Michael Brown', email: 'michael.brown@example.com' },
    receiver: { id: 'u4', name: 'Sarah Davis', email: 'sarah.davis@example.com' },
    title: 'Fake blood type information provided',
    message: 'This user provided incorrect blood type information in their profile.',
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    sender: { id: 'u5', name: 'David Wilson', email: 'david.wilson@example.com' },
    receiver: { id: 'u6', name: 'Lisa Anderson', email: 'lisa.anderson@example.com' },
    title: 'No-show for scheduled donation',
    message: 'The donor did not show up for the scheduled appointment without notice.',
    createdAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    sender: { id: 'u7', name: 'Jennifer Taylor', email: 'jennifer.taylor@example.com' },
    receiver: { id: 'u8', name: 'Robert Miller', email: 'robert.miller@example.com' },
    title: 'Harassment through messages',
    message: 'This user has been sending inappropriate messages through the platform.',
    createdAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    sender: { id: 'u9', name: 'Christopher Lee', email: 'christopher.lee@example.com' },
    receiver: { id: 'u10', name: 'Amanda White', email: 'amanda.white@example.com' },
    title: 'Profile contains false medical information',
    message: 'The user has provided false medical history in their donor profile.',
    createdAt: '2024-01-11T11:30:00Z'
  },
  {
    id: '6',
    sender: { id: 'u11', name: 'Matthew Garcia', email: 'matthew.garcia@example.com' },
    receiver: { id: 'u12', name: 'Jessica Martinez', email: 'jessica.martinez@example.com' },
    title: 'Inappropriate language in chat',
    message: 'The user used offensive language during communication with other donors.',
    createdAt: '2024-01-10T13:20:00Z'
  },
  {
    id: '7',
    sender: { id: 'u13', name: 'Daniel Rodriguez', email: 'daniel.rodriguez@example.com' },
    receiver: { id: 'u14', name: 'Ashley Thompson', email: 'ashley.thompson@example.com' },
    title: 'Suspected spam account',
    message: 'This account shows suspicious activity and might be a spam account.',
    createdAt: '2024-01-09T08:10:00Z'
  },
  {
    id: '8',
    sender: { id: 'u15', name: 'James Clark', email: 'james.clark@example.com' },
    receiver: { id: 'u16', name: 'Megan Lewis', email: 'megan.lewis@example.com' },
    title: 'Sharing personal contact information',
    message: 'The user is sharing personal phone numbers and addresses in public messages.',
    createdAt: '2024-01-08T17:25:00Z'
  }
];

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>(dummyReports);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleViewMessage = (report: Report) => {
    // Handle view message action
    console.log('View message:', report);
    // You can implement a modal or navigate to detailed view
  };

  const handleSendWarning = (report: Report) => {
    // Handle send warning action
    console.log('Send warning to:', report.sender);
    // You can implement warning functionality
  };

  const handleBlockUser = (report: Report) => {
    // Handle block user action
    console.log('Block user:', report.sender);
    // You can implement user blocking functionality
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      {/* Welcome Section - Simplified */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, Admin!
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all system reports and user activities from your central dashboard.
        </p>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.sender.name}</p>
                      <p className="text-sm text-muted-foreground">{report.sender.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.receiver.name}</p>
                      <p className="text-sm text-muted-foreground">{report.receiver.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium max-w-xs truncate" title={report.title}>
                      {report.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatDate(report.createdAt)}</p>
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
                          onClick={() => handleViewMessage(report)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSendWarning(report)}
                          className="cursor-pointer text-orange-600 focus:text-orange-600"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Send Warning
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleBlockUser(report)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Block User
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
    </div>
  );
}
