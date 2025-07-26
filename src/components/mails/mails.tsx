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

  // Get userId from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  useEffect(() => {
    if (!userId) {
      console.log('No userId found in localStorage');
      setIsLoading(false);
      return;
    }
    
    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications for userId:', userId);
        setIsLoading(true);
        
        const res = await fetch(`/api/reportvotedata?userId=${userId}`);
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Received data:', data);
        
        if (data.notifications && Array.isArray(data.notifications)) {
          const transformedNotifications = data.notifications.map((n: BackendNotification) => ({
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
          
          console.log('Transformed notifications:', transformedNotifications);
          setNotifications(transformedNotifications);
        } else {
          console.log('No notifications array in response');
          setNotifications([]);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [userId]);

  // Debug logging
  console.log('Current state:', {
    userId,
    notificationsCount: notifications.length,
    isLoading,
    notifications: notifications.slice(0, 2) // First 2 notifications for debugging
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Format notification summary for display
  const formatNotificationSummary = (item: NotificationItem) => {
    // If description contains 'from', extract the name after 'from'
    if (item.type === 'vote' && item.description?.includes('from')) {
      return item.description;
    }
    if (item.type === 'report' && item.description?.includes('from')) {
      return item.description;
    }
    // Fallback: show sender as is (should be user name if backend is correct)
    if (item.type === 'vote') {
      return `Vote of Thanks from ${item.sender}`;
    } else {
      return `Report from ${item.sender}`;
    }
  };

  // API functions
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/reportvotedata', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          updates: { status: 'read' }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const toggleStar = async (notificationId: string, isStarred: boolean) => {
    try {
      const response = await fetch('/api/reportvotedata', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          updates: { isStarred: !isStarred }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update star status');
      }
    } catch (error) {
      console.error('Failed to update star status:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/reportvotedata?notificationId=${notificationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handler functions
  const handleView = (item: NotificationItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
    
    // Mark as read in database
    if (item.status === 'unread') {
      markAsRead(item.id);
    }
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === item.id ? { ...n, status: 'read' as const } : n)
    );
  };

  const handleStar = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      toggleStar(id, notification.isStarred || false);
    }
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n)
    );
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    
    // Update local state
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

  // Define columns for the data table
  const columns: ColumnDef<NotificationItem>[] = [
    {
      accessorKey: "status",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <div 
            className={`w-3 h-3 rounded-full ${
              row.getValue("status") === 'unread' 
                ? 'bg-red-500' 
                : 'bg-gray-300'
            }`}
            title={row.getValue("status") === 'unread' ? 'Unread' : 'Read'}
          />
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <div className="flex items-center justify-center">
            {type === 'vote' ? (
              <ThumbsUp className="w-5 h-5 text-blue-600" />
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
        const isRead = item.status === 'read';
        
        return (
          <div className="cursor-pointer" onClick={() => handleView(item)}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isRead ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
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
        const isRead = row.original.status === 'read';
        
        return (
          <div className={`flex flex-col gap-1 text-xs ${isRead ? 'text-muted-foreground' : 'text-gray-500'}`}>
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
        return row.original.status === 'unread';
      }
      return true;
    },
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
              <span>Loading notifications...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className={`${row.original.status === 'unread' ? 'bg-red-50/30' : ''} hover:bg-gray-50`}
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
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {userId ? 'No notifications found' : 'Please log in to view notifications'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-2">
              Debug: userId = {userId || 'undefined'}
            </p>
          )}
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
          onClick={() => router.push('/home')}
          className="fixed top-14 md:top-24 left-2 md:left-6 h-12 w-12 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Notifications</span>{" "}
            <span className="text-foreground">Center</span>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with votes and reports from your BloodBridge community
          </p>
        </div>

        {/* Data Table Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-500" />
              All Notifications
              <Badge variant="secondary">{notifications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table Controls */}
            <div className="flex items-center gap-4 py-4">
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
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedItem?.type === 'vote' ? (
                  <ThumbsUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bell className="w-5 h-5 text-red-600" />
                )}
                {selectedItem?.title}
                {selectedItem?.isStarred && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current ml-2" />
                )}
              </DialogTitle>
              <DialogDescription>
                From {selectedItem?.sender} • {selectedItem && formatTimestamp(selectedItem.timestamp)}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge 
                  className={`text-xs capitalize ${
                    selectedItem?.type === 'report' 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  {selectedItem?.type}
                </Badge>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {selectedItem?.content || selectedItem?.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NotificationsPage;
