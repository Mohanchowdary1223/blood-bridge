/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useState, useEffect } from 'react';
import SimpleBloodLoader from '../ui/SimpleBloodLoader';
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
  ThumbsUp, 
  Bell,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Star,
  ArrowUpDown,
  ChevronDown
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
import { motion, AnimatePresence } from 'framer-motion';

// Move interfaces outside of component
interface BackendNotification {
  _id: string;
  type: 'vote' | 'report';
  title: string;
  description: string;
  sender: string;
  senderAvatar?: string;
  timestamp: string;
  status: 'read' | 'unread';
  priority: 'low' | 'medium' | 'high';
  content?: string;
  isStarred?: boolean;
}
interface NotificationItem {
  id: string;
  type: 'vote' | 'report' | 'admin-warning';
  title: string;
  description: string;
  sender: string;
  senderAvatar?: string;
  timestamp: string;
  status: 'read' | 'unread';
  priority: 'low' | 'medium' | 'high';
  content?: string;
  isStarred?: boolean;
}

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track read status for admin messages from backend
  const [readAdminIds, setReadAdminIds] = useState<string[]>([]);

  // Get userId from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        // Fetch user notifications
        const res = await fetch(`/api/reportvotedata?userId=${userId}`);
        const data = await res.json();
        let notifications: NotificationItem[] = [];
        if (res.ok && data.notifications && Array.isArray(data.notifications)) {
          notifications = data.notifications.map((n: BackendNotification) => ({
            id: n._id,
            type: n.type,
            title: n.title,
            description: n.description,
            sender: n.sender,
            senderAvatar: n.senderAvatar,
            timestamp: n.timestamp,
            status: n.status,
            priority: n.priority,
            content: n.content,
            isStarred: n.isStarred || false
          }));
        }
        // Fetch admin sent reports for this user (with read state)
        const adminRes = await fetch(`/api/admin/sendreports?userId=${userId}`);
        const adminData = await adminRes.json();
        let adminReadIds: string[] = [];
        if (adminRes.ok && adminData.reports && Array.isArray(adminData.reports)) {
          interface AdminReport {
            _id: string;
            message: string;
            sentAt: string;
            read?: boolean;
          }
          const adminNotifications = adminData.reports.map((r: AdminReport) => ({
            id: r._id,
            type: 'admin-warning',
            title: 'Admin Warning',
            description: r.message,
            sender: 'Admin',
            senderAvatar: '',
            timestamp: r.sentAt,
            status: r.read ? 'read' : 'unread',
            priority: 'high',
            content: r.message,
            isStarred: false
          }));
          notifications = [...notifications, ...adminNotifications];
          adminReadIds = adminData.reports.filter((r: AdminReport) => r.read).map((r: AdminReport) => r._id);
        }
        // sort in chronological order descending
        notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(notifications);
        setReadAdminIds(adminReadIds);
      } catch (error) {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatNotificationSummary = (item: NotificationItem) => {
    if (item.type === 'admin-warning') return 'Admin Warning';
    if (item.type === 'vote' && item.description?.includes('from')) {
      return item.description;
    }
    if (item.type === 'report' && item.description?.includes('from')) {
      return item.description;
    }
    if (item.type === 'vote') {
      return `Vote of Thanks from ${item.sender}`;
    } else {
      return `Report from ${item.sender}`;
    }
  };

  // API functions
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/reportvotedata', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          updates: { status: 'read' }
        })
      });
    } catch {}
  };
  const toggleStar = async (notificationId: string, isStarred: boolean) => {
    try {
      await fetch('/api/reportvotedata', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          updates: { isStarred: !isStarred }
        })
      });
    } catch {}
  };
  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/reportvotedata?notificationId=${notificationId}`, {
        method: 'DELETE'
      });
    } catch {}
  };

  // Handler functions
  const handleView = (item: NotificationItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
    if (item.status === 'unread') {
      if (item.type !== 'admin-warning') {
        markAsRead(item.id);
        setNotifications(prev =>
          prev.map(n => n.id === item.id ? { ...n, status: 'read' } : n)
        );
      } else {
        // Mark admin-warning as read in backend
        fetch('/api/admin/readadmin', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, adminReportId: item.id })
        }).then(() => {
          setReadAdminIds(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
          setNotifications(prev => prev.map(n =>
            n.id === item.id ? { ...n, status: 'read' } : n
          ));
        });
      }
    }
  };

  const handleStar = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      toggleStar(id, notification.isStarred || false);
    }
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n)
    );
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Type filter function
  const handleTypeFilter = (type: string) => {
    setSelectedTypeFilter(type);
    if (type === 'all') {
      table.getColumn("type")?.setFilterValue("");
      table.setGlobalFilter("");
    } else if (type === 'starred') {
      table.getColumn("type")?.setFilterValue("");
      table.setGlobalFilter("starred");
    } else if (type === 'unread') {
      table.getColumn("type")?.setFilterValue("");
      table.setGlobalFilter("unread");
    } else {
      table.getColumn("type")?.setFilterValue(type);
      table.setGlobalFilter("");
    }
  };

  // Get display text and icon for selected filter
  const getSelectedFilterDisplay = () => {
    switch (selectedTypeFilter) {
      case 'vote':
        return { text: 'Vote of Thanks', icon: <ThumbsUp className="w-4 h-4 text-blue-600" /> };
      case 'report':
        return { text: 'Reports', icon: <Bell className="w-4 h-4 text-red-600" /> };
      case 'starred':
        return { text: 'Starred', icon: <Star className="w-4 h-4 text-yellow-500" /> };
      case 'unread':
        return { text: 'Unread', icon: <div className="w-4 h-4 bg-red-500 rounded-full" /> };
      default:
        return { text: 'All Types', icon: <Filter className="w-4 h-4" /> };
    }
  };

  // Count unread messages (only user notifications, not admin-warning)
  const unreadCount = notifications.filter(n =>
    n.type !== 'admin-warning' && n.status === 'unread'
  ).length;

  // Define columns for the data table
  const columns: ColumnDef<NotificationItem>[] = [
    {
      accessorKey: "status",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <div 
            className={`w-3 h-3 rounded-full ${
              row.original.type === 'admin-warning'
                ? (!readAdminIds.includes(row.original.id) ? 'bg-red-500' : 'bg-gray-300')
                : row.getValue("status") === 'unread' 
                  ? 'bg-red-500' 
                  : 'bg-gray-300'
            }`}
            title={
              row.original.type === 'admin-warning'
                ? (!readAdminIds.includes(row.original.id) ? 'Unread' : 'Read')
                : row.getValue("status") === 'unread' ? 'Unread' : 'Read'
            }
          />
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <div className="flex items-center justify-center">
            {type === 'vote' ? (
              <ThumbsUp className="w-5 h-5 text-blue-600" />
            ) : type === 'admin-warning' ? (
              <span title="Admin Warning">
                <Bell className="w-5 h-5 text-red-600 animate-shake" />
              </span>
            ) : (
              <Bell className="w-5 h-5 text-red-600" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Notification",
      cell: ({ row }) => {
        const item = row.original;
        const isUnreadAdmin = item.type === 'admin-warning' && !readAdminIds.includes(item.id);
        const isRead = item.status === 'read' && item.type !== 'admin-warning';
        return (
          <div 
            className={`cursor-pointer ${isUnreadAdmin ? 'text-red-700 font-bold' : ''}`}
            onClick={() => handleView(item)}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                item.type === 'admin-warning'
                  ? (!readAdminIds.includes(item.id) ? 'font-bold text-red-700' : 'text-muted-foreground')
                  : isRead
                    ? 'text-muted-foreground'
                    : 'font-semibold text-foreground'
              }`}>
                {formatNotificationSummary(item)}
              </span>
              {item.isStarred && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("timestamp"));
        const isRead = row.original.status === 'read' && row.original.type !== 'admin-warning';
        const isUnreadAdmin = row.original.type === 'admin-warning';
        return (
          <div className={`flex flex-col gap-1 text-xs ${isRead ? 'text-muted-foreground' : isUnreadAdmin ? 'text-red-700' : 'text-gray-500'}`}>
            <span>{formatTimestamp(row.getValue("timestamp"))}</span>
            <span>{date.toLocaleString()}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
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
              <DropdownMenuItem onClick={() => handleView(item)} className='cursor-pointer'>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStar(item.id)} className='cursor-pointer'>
                <Star className={`w-4 h-4 mr-2 ${item.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                {item.isStarred ? 'Unstar' : 'Star'} Message
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(item.id)}
                className="text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: notifications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, columnId, filterValue) => {
      if (filterValue === 'starred') {
        return row.original.isStarred === true;
      }
      if (filterValue === 'unread') {
        // admin-warning is unread if not in readAdminIds
        return (row.original.type === 'admin-warning' ? !readAdminIds.includes(row.original.id) : row.original.status === 'unread');
      }
      return true;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
    },
  });

  // Render table body with loading state
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <SimpleBloodLoader message="Loading notifications..." duration={2000} />
          </TableCell>
        </TableRow>
      );
    }
    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row, index) => {
        const isUnreadAdmin = row.original.type === 'admin-warning' && !readAdminIds.includes(row.original.id);
        return (
          <motion.tr
            key={row.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={
              row.original.type === 'admin-warning'
                ? (isUnreadAdmin ? 'bg-red-50/60 font-semibold' : 'hover:bg-gray-50')
                : row.original.status === 'unread'
                  ? 'bg-red-50/30'
                  : 'hover:bg-gray-50'
            }
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </TableCell>
            ))}
          </motion.tr>
        );
      });
    }
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {userId ? 'No notifications found' : 'Please log in to view notifications'}
            </p>
          </motion.div>
        </TableCell>
      </TableRow>
    );
  };

  const selectedDisplay = getSelectedFilterDisplay();

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Back Button */}
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
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Notifications</span>{" "}
            <span className="text-foreground">Center</span>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with votes and reports from your BloodBridge community
          </p>
        </motion.div>

        {/* Data Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Filter className="w-5 h-5 text-red-500" />
                All Notifications
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Badge variant="secondary">{notifications.length}</Badge>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">Unread: {unreadCount}</Badge>
                  )}
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table Controls */}
              <motion.div 
                className="flex items-center gap-4 py-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Input
                  placeholder="Filter by title..."
                  value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn("title")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
                
                {/* Enhanced Type Filter Dropdown with Starred and Unread */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto cursor-pointer">
                      {selectedDisplay.icon}
                      <span className="ml-2">{selectedDisplay.text}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTypeFilter('all')} className='cursor-pointer'>
                      <Filter className="mr-2 h-4 w-4" />
                      All Types
                      {selectedTypeFilter === 'all' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleTypeFilter('vote')} className='cursor-pointer'>
                      <ThumbsUp className="mr-2 h-4 w-4 text-blue-600" />
                      Vote of Thanks
                      {selectedTypeFilter === 'vote' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTypeFilter('report')} className='cursor-pointer'>
                      <Bell className="mr-2 h-4 w-4 text-red-600" />
                      Reports
                      {selectedTypeFilter === 'report' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTypeFilter('starred')} className='cursor-pointer'>
                      <Star className="mr-2 h-4 w-4 text-yellow-500" />
                      Starred Messages
                      {selectedTypeFilter === 'starred' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTypeFilter('unread')} className='cursor-pointer'>
                      <div className="mr-2 w-4 h-4 bg-red-500 rounded-full" />
                      Unread Messages
                      {selectedTypeFilter === 'unread' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Table */}
              <motion.div 
                className="rounded-md border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup, index) => (
                      <motion.tr 
                        key={headerGroup.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      >
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
                      </motion.tr>
                    ))}
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="wait">
                      {renderTableBody()}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </motion.div>

              {/* Pagination */}
              <motion.div 
                className="flex items-center justify-end space-x-2 py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <div className="text-muted-foreground flex-1 text-sm">
                  Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} notification(s)
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
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* View Dialog */}
        <AnimatePresence>
          {isDialogOpen && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedItem?.type === 'vote' ? (
                        <ThumbsUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Bell className={`w-5 h-5 ${selectedItem?.type === 'admin-warning' ? 'text-red-600 animate-shake' : 'text-red-600'}`} />
                      )}
                      <span className={selectedItem?.type === 'admin-warning' ? "text-red-700 font-bold" : ""}>
                        {selectedItem?.title}
                      </span>
                      {selectedItem?.isStarred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current ml-2" />
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      From {selectedItem?.sender} • {selectedItem && formatTimestamp(selectedItem.timestamp)}
                    </DialogDescription>
                  </DialogHeader>
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Badge 
                        className={`text-xs capitalize ${
                          selectedItem?.type === 'report' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : selectedItem?.type === 'admin-warning'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {selectedItem?.type === 'admin-warning' ? 'admin' : selectedItem?.type}
                      </Badge>
                    </div>
                    <p className={`leading-relaxed ${selectedItem?.type === 'admin-warning' ? "text-red-800 font-bold" : "text-gray-700"}`}>
                      {selectedItem?.content || selectedItem?.description}
                    </p>
                  </motion.div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationsPage;
