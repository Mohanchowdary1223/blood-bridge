'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Info, Search, Mail, Bot, BarChart3, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Notification {
  status: string;
}

const DonorNavbar = () => {
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('User'); // Default fallback
  const router = useRouter();

  /* ------------------------- Load user details ------------------------- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          if (userData?.name) {
            setUserName(userData.name)
          }
        } catch (error) {
          console.error('Failed to parse user data:', error)
          // Keep default 'User' if parsing fails
        }
      }
    }
  }, [])

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
      
      if (!userId) return;

      try {
        const res = await fetch(`/api/reportvotedata?userId=${userId}`);
        if (!res.ok) return;
        
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          const unreadNotifications = data.notifications.filter(
            (notification: Notification) => notification.status === 'unread'
          );
          setUnreadCount(unreadNotifications.length);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Optional: Set up polling to refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.clear();
      
      // Show success message
      setShowLogoutSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        setShowLogoutSuccess(false);
        router.push('/login');
      }, 1500); // Increased timeout to 1.5 seconds for better UX
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if API call fails
      localStorage.clear();
      router.push('/login');
    }
  };

  return (
    <>
      <nav className="bg-background sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className='flex items-center gap-2'>
              <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <button 
                onClick={() => router.push('/home')}
                className="text-xl cursor-pointer font-bold text-foreground hover:text-red-600 transition-colors"
              >
                BloodBridge
              </button>
            </div>

            {/* Right Side Navigation */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation - Removed Mail Button */}
              <div className="hidden md:flex space-x-2">
                <Button 
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                >
                  <Info className="w-4 h-4 mr-1" />
                  <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/finddonor')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Find Donor
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/trackimpact')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Track Impact
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/healthaibot')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                >
                  <Bot className="w-4 h-4 mr-1" />
                  Health Assistant
                </Button>
              </div>

              {/* Profile Dropdown with Badge */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Unread Count Badge on Avatar - Fixed styling */}
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 max-w-5 text-xs px-1.5 rounded-full bg-white  text-primary font-bold shadow-sm border-2 border-white"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {/* User Name with Unread Count */}
                  <div className="flex flex-col space-y-1 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {userName.charAt(0).toUpperCase() + userName.slice(1)}
                      </p>
                 
                    </div>
                    {unreadCount > 0 && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  {/* Mails - Always visible in dropdown */}
                  <DropdownMenuItem 
                    onClick={() => router.push('/mails')}
                    className="relative cursor-pointer"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Mails
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto h-4 min-w-4 text-[10px] px-1 rounded-full bg-red-500 hover:bg-red-500 text-white font-bold"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  
                  {/* Mobile only - Navigation items in dropdown */}
                  <DropdownMenuItem 
                    className="cursor-pointer md:hidden"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => router.push('/finddonor')}
                    className="cursor-pointer md:hidden"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Find Donor
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => router.push('/trackimpact')}
                    className="cursor-pointer md:hidden"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Track Impact
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => router.push('/healthaibot')}
                    className="cursor-pointer md:hidden"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Health Assistant
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Logout Success Popup - Enhanced */}
      {showLogoutSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/50 backdrop-blur-sm">
          <Card className="p-6 border-0 bg-white max-w-sm w-full mx-4 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Logged Out Successfully!</h3>
              <p className="text-sm text-muted-foreground">Thank you for using BloodBridge. Stay safe!</p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default DonorNavbar;
