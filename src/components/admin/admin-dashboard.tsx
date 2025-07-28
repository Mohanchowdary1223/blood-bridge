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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
// Removed unused AlertDialog imports
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, AlertTriangle,  FileText, Send, X, CheckCircle } from 'lucide-react';

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

export default function AdminDashboard() {
  // Remove unused user state
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  // const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  // const [refreshFlag, setRefreshFlag] = useState(false);
  
  // Warning dialog states
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [selectedReportForWarning, setSelectedReportForWarning] = useState<Report | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSendingWarning, setIsSendingWarning] = useState(false);

  // View message dialog states
  const [isViewMessageDialogOpen, setIsViewMessageDialogOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<Report | null>(null);

  // Block confirmation dialog states
  // Removed block/unblock dialog state

  // Success confirmation dialog states
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [blockedUserName, setBlockedUserName] = useState('');

  // Warning success dialog states
  const [isWarningSuccessDialogOpen, setIsWarningSuccessDialogOpen] = useState(false);
  const [warnedUserName, setWarnedUserName] = useState('');

  useEffect(() => {
    setLoading(false);
    // Fetch recent 10 reports from masternotifications
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/admin/masternotifications');
        const data = await res.json();
        if (res.ok && Array.isArray(data.reports)) {
          // Map backend data to Report type
          interface ApiReport {
            _id: string;
            notification: {
              receiverName: string;
              sender: string;
              senderEmail: string;
              receiver: string;
              receiverEmail: string;
              title: string;
              content?: string;
              description?: string;
              timestamp: string;
            };
          }

          const mappedReports = data.reports.map((r: ApiReport) => ({
            id: r._id,
            sender: {
              id: r.notification.sender || '',
              name: r.notification.sender || '',
              email: r.notification.senderEmail || ''
            },
            receiver: {
              id: r.notification.receiver || '',
              name: r.notification.receiverName || '',
              email: r.notification.receiverEmail || ''
            },
            title: r.notification.title,
            message: r.notification.content || r.notification.description,
            createdAt: r.notification.timestamp
          }));
          setReports(mappedReports);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
    };
    fetchReports();
  }, []);

  // No filtering for blocked users
  const filteredReports = reports;

  const handleViewMessage = (report: Report) => {
    setSelectedReportForView(report);
    setIsViewMessageDialogOpen(true);
  };

  const handleSendWarning = (report: Report) => {
    setSelectedReportForWarning(report);
    setWarningMessage(`Dear ${report.receiver.name},

We have noticed multiple reports regarding your activities and behavior on our blood donation platform. This serves as an official warning.

Please ensure that you comply with our community guidelines and maintain appropriate conduct while using our services.

Continued violations may result in account suspension or permanent ban.

Best regards,
Blood Donation Platform Admin Team`);
    setIsWarningDialogOpen(true);
  };

  const handleConfirmWarning = async () => {
    if (!selectedReportForWarning || !warningMessage.trim()) return;

    setIsSendingWarning(true);
    
    try {
      // Store warning in AdminSendReports
      const response = await fetch('/api/admin/sendreport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedReportForWarning.receiver.id,
          message: warningMessage,
          reportId: selectedReportForWarning.id
        })
      });
      if (!response.ok) throw new Error('Failed to send warning');
      
      // Store warned user name for success dialog
      setWarnedUserName(selectedReportForWarning.receiver.name);
      
      // Close warning dialog and reset states
      setIsWarningDialogOpen(false);
      setSelectedReportForWarning(null);
      setWarningMessage('');
      
      // Show warning success dialog
      setIsWarningSuccessDialogOpen(true);
      
    } catch (error) {
      console.error('Failed to send warning:', error);
      alert('Failed to send warning. Please try again.');
    } finally {
      setIsSendingWarning(false);
    }
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
            All Reports ({filteredReports.length})
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
              {filteredReports.map((report) => (
                <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50">
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
                    <p className="font-medium max-w-xs truncate cursor-pointer" title={report.title}>
                      {report.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatDate(report.createdAt)}</p>
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
                          onClick={() => handleViewMessage(report)}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSendWarning(report)}
                          className="cursor-pointer text-orange-600 focus:text-orange-600 hover:bg-orange-50"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Send Warning
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

      {/* View Message Dialog */}
      <Dialog open={isViewMessageDialogOpen} onOpenChange={setIsViewMessageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Eye className="w-5 h-5" />
              Report Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedReportForView && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedReportForView.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Report ID: {selectedReportForView.id}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Reported By:</h4>
                    <div className="space-y-1">
                      <p><strong>Name:</strong> {selectedReportForView.sender.name}</p>
                      <p><strong>Email:</strong> {selectedReportForView.sender.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Reported User:</h4>
                    <div className="space-y-1">
                      <p><strong>Name:</strong> {selectedReportForView.receiver.name}</p>
                      <p><strong>Email:</strong> {selectedReportForView.receiver.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Reported on:</strong> {formatDate(selectedReportForView.createdAt)}
                  </p>
                </div>
              </div>

              {/* Report Message */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Report Message:</h4>
                <div className="bg-white border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedReportForView.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewMessageDialogOpen(false);
                setSelectedReportForView(null);
              }}
              className="cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            {selectedReportForView && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewMessageDialogOpen(false);
                  handleSendWarning(selectedReportForView);
                }}
                className="cursor-pointer text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Send Warning
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Send Warning to User
            </DialogTitle>
          </DialogHeader>
          
          {selectedReportForWarning && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Sending warning to:</h4>
                <div className="space-y-1">
                  <p><strong>Name:</strong> {selectedReportForWarning.receiver.name}</p>
                  <p><strong>Email:</strong> {selectedReportForWarning.receiver.email}</p>
                  <p><strong>Report:</strong> {selectedReportForWarning.title}</p>
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
                setSelectedReportForWarning(null);
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

      {/* Warning Success Dialog - FIXED FOR HYDRATION ERROR */}
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
              <DialogDescription className="text-center" asChild>
                <div>
                  The warning has been successfully sent to <strong>{warnedUserName}</strong>.<br /><br />
                  The following actions have been taken:
                </div>
              </DialogDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>Warning message delivered to user's notifications</li>
                <li>Warning record saved to admin reports</li>
                <li>User has been notified of policy violations</li>
                <li>User activity will be monitored more closely</li>
              </ul>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mt-2">
                <p className="text-orange-800 text-sm">
                  <strong>Note:</strong> If the user continues to violate policies, consider escalating to a permanent block.
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => {
                setIsWarningSuccessDialogOpen(false);
                setWarnedUserName('');
              }}
              className="cursor-pointer bg-orange-600 hover:bg-orange-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <strong>{blockedUserName}</strong> has been successfully blocked and removed from the platform.
              </DialogDescription>
              <div className="text-center mt-2">The following actions have been taken:</div>
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>User account has been suspended</li>
                <li>All reports involving this user are now hidden</li>
                <li>User removed from active searches</li>
                <li>All scheduled activities cancelled</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
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
