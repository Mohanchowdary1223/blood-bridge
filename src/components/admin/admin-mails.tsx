/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { 
  ArrowLeft, 
  UserX, 
  UserCheck,
  Search,
  MoreHorizontal,
  Eye,
  Shield,
  ShieldOff,
  ArrowUpDown,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Interfaces
interface UnblockRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  date: string;
  blockedReason: string;
  status: 'blocked' | 'unblocked';
}

const UnblockRequestsPage = () => {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<UnblockRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'unblock' | null>(null);
  const [actionUserId, setActionUserId] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [requests, setRequests] = useState<UnblockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real unblock requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/unblock-request');
        const data = await res.json();
        setRequests(data.requests || []);
      } catch (error) {
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Handler functions
  const handleView = (request: UnblockRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleBlock = (userId: string) => {
    setActionType('block');
    setActionUserId(userId);
    setIsAlertDialogOpen(true);
  };

  const handleUnblock = (userId: string) => {
    setActionType('unblock');
    setActionUserId(userId);
    setIsAlertDialogOpen(true);
  };

  const confirmAction = async () => {
    try {
      let res;
      if (actionType === 'unblock') {
        res = await fetch('/api/admin/unblock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: actionUserId }),
        });
      } else if (actionType === 'block') {
        res = await fetch('/api/admin/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: actionUserId }),
        });
      }
      // Optionally, show a notification here if needed
      // e.g., use a different notification system or UI feedback
      // Refresh requests
      const reqRes = await fetch('/api/admin/unblock-request');
      const data = await reqRes.json();
      setRequests(data.requests || []);
    } catch (error) {
      // Optionally, show a notification here if needed
    } finally {
      setIsAlertDialogOpen(false);
      setActionType(null);
      setActionUserId('');
    }
  };

  // Status filter function
  const handleStatusFilter = (status: string) => {
    setSelectedStatusFilter(status);
    if (status === 'all') {
      table.getColumn("status")?.setFilterValue("");
    } else {
      table.getColumn("status")?.setFilterValue(status);
    }
  };

  // Get display text and icon for selected filter
  const getSelectedFilterDisplay = () => {
    switch (selectedStatusFilter) {
      case 'blocked':
        return { icon: <UserX className="w-4 h-4 text-red-500" />, text: 'Blocked' };
      case 'unblocked':
        return { icon: <UserCheck className="w-4 h-4 text-green-500" />, text: 'Unblocked' };
      default:
        return { icon: <AlertTriangle className="w-4 h-4" />, text: 'All Status' };
    }
  };

  // Define columns
  const columns: ColumnDef<UnblockRequest>[] = [
    {
      accessorKey: "userName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            User Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {request.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{request.userName}</div>
              <div className="text-sm text-muted-foreground">{request.userEmail}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message") as string;
        return (
          <div className="max-w-xs">
            <p className="truncate text-sm">
              {message.length > 50 ? `${message.substring(0, 50)}...` : message}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === 'blocked' ? 'destructive' : 'default'}
            className={
              status === 'blocked'
                ? 'bg-red-100 text-red-700 border-red-200'
                : 'bg-green-100 text-green-700 border-green-200'
            }
          >
            {status === 'blocked' ? 'Blocked' : 'Unblocked'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "blockedReason",
      header: "Blocked Reason",
      cell: ({ row }) => {
        const reason = row.getValue("blockedReason") as string;
        return <span className="text-xs text-gray-700">{reason || '-'}</span>;
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="flex flex-col gap-1 text-xs">
            <span>{formatTimestamp(row.getValue("date"))}</span>
            <span className="text-muted-foreground">{date.toLocaleDateString()}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const request = row.original;
        const isBlocked = request.status === 'blocked';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(request)} className='cursor-pointer'>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleUnblock(request.userId)}
                className='cursor-pointer text-green-600'
                disabled={request.status === 'unblocked'}
              >
                <Shield className="w-4 h-4 mr-2" />
                {request.status === 'unblocked' ? 'Already Unblocked' : 'Unblock User'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBlock(request.userId)}
                className="text-red-600 cursor-pointer"
                disabled={request.status === 'blocked'}
              >
                <ShieldOff className="w-4 h-4 mr-2" />
                {request.status === 'blocked' ? 'Already Blocked' : 'Block User'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: requests,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Render table body with loading state
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
              <span>Loading user data...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className="hover:bg-gray-50"
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </TableCell>
      </TableRow>
    );
  };

  const selectedDisplay = getSelectedFilterDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin')}
          className="fixed top-14 md:top-24 left-2 h-12 w-12 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">User</span>{" "}
            <span className="text-foreground">Management</span>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage user accounts and block/unblock access
          </p>
        </div>

        {/* Data Table Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-500" />
              User Accounts
              <Badge variant="secondary">{requests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table Controls */}
            <div className="flex items-center gap-4 py-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or title..."
                  value={(table.getColumn("userName")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.setGlobalFilter(event.target.value)
                  }
                  className="pl-10"
                />
              </div>
              
              {/* Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto cursor-pointer">
                    {selectedDisplay.icon}
                    <span className="ml-2">{selectedDisplay.text}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusFilter('all')} className='cursor-pointer'>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    All Status
                    {selectedStatusFilter === 'all' && (
                      <Badge variant="secondary" className="ml-auto">Selected</Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusFilter('blocked')} className='cursor-pointer'>
                    <UserX className="mr-2 h-4 w-4 text-red-500" />
                    Blocked
                    {selectedStatusFilter === 'blocked' && (
                      <Badge variant="secondary" className="ml-auto">Selected</Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter('unblocked')} className='cursor-pointer'>
                    <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                    Unblocked
                    {selectedStatusFilter === 'unblocked' && (
                      <Badge variant="secondary" className="ml-auto">Selected</Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {renderTableBody()}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-muted-foreground flex-1 text-sm">
                Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} user(s)
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-600" />
                Unblock Request
                <Badge 
                  variant={selectedRequest?.status === 'blocked' ? 'destructive' : 'default'}
                  className={
                    selectedRequest?.status === 'blocked' 
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-green-100 text-green-700 border-green-200'
                  }
                >
                  {selectedRequest?.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                User: {selectedRequest?.userName} • {selectedRequest && formatTimestamp(selectedRequest.date)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {selectedRequest.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-lg">{selectedRequest.userName}</div>
                    <div className="text-sm text-muted-foreground">{selectedRequest.userEmail}</div>
                  </div>
                </div>

                {/* Block Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Request Date</h4>
                    <p className="text-sm">{new Date(selectedRequest.date).toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Blocked Reason</h4>
                    <p className="text-sm">{selectedRequest.blockedReason}</p>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-3">
                  <h4 className="font-medium">Request Message:</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedRequest.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleUnblock(selectedRequest.userId)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={selectedRequest.status === 'unblocked'}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {selectedRequest.status === 'unblocked' ? 'Already Unblocked' : 'Unblock User'}
                  </Button>
                  <Button
                    onClick={() => handleBlock(selectedRequest.userId)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    disabled={selectedRequest.status === 'blocked'}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    {selectedRequest.status === 'blocked' ? 'Already Blocked' : 'Block User'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Alert Dialog */}
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-medium">
                {actionType === 'unblock' ? 'Unblock User' : 'Block User'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                {actionType === 'unblock'
                  ? 'Are you sure you want to unblock this user?'
                  : 'Are you sure you want to block this user?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmAction}
                className={actionType === 'unblock' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {actionType === 'unblock' ? 'Unblock User' : 'Block User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UnblockRequestsPage;
