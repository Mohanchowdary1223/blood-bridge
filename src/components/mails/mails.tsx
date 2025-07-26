"use client"
import React, { useState } from 'react';
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
  Clock,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  
  // New state for selected type filter
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Sample data with only vote and report types
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'vote',
      title: 'Best Blood Donor Award Voting',
      description: 'Vote for the most impactful blood donor in your community',
      sender: 'BloodBridge Community',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'unread',
      priority: 'high',
      content: 'We are excited to announce our annual Best Blood Donor Award voting is now open! Your participation helps us recognize outstanding donors who have made significant contributions to saving lives.',
      isStarred: false
    },
    {
      id: '2',
      type: 'report',
      title: 'Inappropriate Behavior Report',
      description: 'Report about donor conduct during blood drive',
      sender: 'Anonymous User',
      timestamp: '2024-01-13T09:00:00Z',
      status: 'read',
      priority: 'high',
      content: 'I want to report inappropriate behavior from a donor during the blood drive at City Hospital. The person was being disruptive and making other donors uncomfortable.',
      isStarred: true
    },
    {
      id: '3',
      type: 'report',
      title: 'System Bug Report',
      description: 'Technical issue with donation scheduling system',
      sender: 'John Smith',
      timestamp: '2024-01-10T08:15:00Z',
      status: 'read',
      priority: 'medium',
      content: 'There seems to be a bug in the donation scheduling system. When I try to book an appointment, the calendar shows incorrect available dates.',
      isStarred: false
    },
    {
      id: '4',
      type: 'vote',
      title: 'Community Policy Changes',
      description: 'Vote on proposed changes to donation policies',
      sender: 'Policy Committee',
      timestamp: '2024-01-08T14:20:00Z',
      status: 'unread',
      priority: 'low',
      content: 'We are proposing several policy changes to improve the donation process and need community feedback through voting.',
      isStarred: true
    },
    {
      id: '5',
      type: 'report',
      title: 'Blood Drive Location Issue',
      description: 'Report about accessibility problems at donation center',
      sender: 'Community Member',
      timestamp: '2024-01-07T14:30:00Z',
      status: 'unread',
      priority: 'medium',
      content: 'The blood drive location at City Center has accessibility issues that prevent wheelchair users from donating comfortably.',
      isStarred: false
    },
    {
      id: '6',
      type: 'vote',
      title: 'New Donation Guidelines',
      description: 'Vote on updated donation safety guidelines',
      sender: 'Medical Committee',
      timestamp: '2024-01-05T12:00:00Z',
      status: 'read',
      priority: 'high',
      content: 'We need your input on new safety guidelines for blood donation procedures to ensure the highest standards of donor care.',
      isStarred: false
    }
  ]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleView = (item: NotificationItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === item.id ? { ...n, status: 'read' as const } : n)
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleStar = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n)
    );
  };

  // Updated handle type filter function to include star filter
  const handleTypeFilter = (type: string) => {
    setSelectedTypeFilter(type);
    if (type === 'all') {
      table.getColumn("type")?.setFilterValue("");
      // Clear any custom filter
      table.setGlobalFilter("");
    } else if (type === 'starred') {
      // For starred messages, we need to use a custom filter
      table.getColumn("type")?.setFilterValue("");
      table.setGlobalFilter("starred");
    } else {
      table.getColumn("type")?.setFilterValue(type);
      table.setGlobalFilter("");
    }
  };

  // Get display text and icon for selected filter
  const getSelectedFilterDisplay = () => {
    switch (selectedTypeFilter) {
      case 'vote':
        return { text: 'Votes', icon: <ThumbsUp className="w-4 h-4 text-blue-600" /> };
      case 'report':
        return { text: 'Reports', icon: <Bell className="w-4 h-4 text-red-600" /> };
      case 'starred':
        return { text: 'Starred', icon: <Star className="w-4 h-4 text-yellow-500" /> };
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
      accessorKey: "sender",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            From
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="cursor-pointer" onClick={() => handleView(item)}>
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-6 h-6">
                <AvatarImage src={item.senderAvatar} />
                <AvatarFallback className="text-xs bg-red-100 text-red-600">
                  {item.sender.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className={`text-sm font-medium ${item.status === 'unread' ? 'font-semibold' : ''}`}>
                {item.sender}
              </span>
              {item.isStarred && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-xs ml-8">
              {item.description}
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
        return (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-3 h-3" />
            {formatTimestamp(row.getValue("timestamp"))}
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
    // Add global filter function for starred messages
    globalFilterFn: (row, columnId, filterValue) => {
      if (filterValue === 'starred') {
        return row.original.isStarred === true;
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
                placeholder="Filter by sender..."
                value={(table.getColumn("sender")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("sender")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              
              {/* Enhanced Type Filter Dropdown with Starred */}
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
                    Votes
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
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications found</p>
                      </TableCell>
                    </TableRow>
                  )}
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
                {selectedItem?.content}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NotificationsPage;
