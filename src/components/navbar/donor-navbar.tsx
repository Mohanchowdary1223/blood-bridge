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

interface UserData {
  _id?: string;
  id?: string;
  name?: string;
}

const DonorNavbar: React.FC = () => {
  const [showLogoutSuccess, setShowLogoutSuccess] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>('User');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  /* ------------------------- Load user details ------------------------- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData: UserData = JSON.parse(userStr);
          if (userData?.name) {
            setUserName(userData.name);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    }
  }, []);

  // Fetch unread notifications count - FIXED VERSION
  useEffect(() => {
    const fetchUnreadCount = async (): Promise<void> => {
      // Prevent multiple simultaneous requests
      if (isLoading) return;
      
      setIsLoading(true);
      
      try {
        let userId = '';
        
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const userData: UserData = JSON.parse(userStr);
              userId = userData._id || userData.id || '';
            } catch (parseError) {
              console.error('Failed to parse user data for notifications:', parseError);
              setIsLoading(false);
              return;
            }
          }
        }
        
        if (!userId) {
          console.warn('No user ID found, skipping notification fetch');
          setIsLoading(false);
          return;
        }

        console.log('Fetching notifications for user:', userId);
        
        const res = await fetch(`/api/reportvotedata?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('Notification data received:', data);
        
        if (data.notifications && Array.isArray(data.notifications)) {
          const unreadNotifications = data.notifications.filter(
            (notification: Notification) => notification.status === 'unread'
          );
          setUnreadCount(unreadNotifications.length);
          console.log('Unread count updated:', unreadNotifications.length);
        } else {
          console.warn('No notifications array found in response:', data);
          setUnreadCount(0);
        }
        
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        
        // More detailed error logging
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('Network error - check if the API endpoint is accessible');
        } else if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
        
        // Don't update count on error, keep previous value
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchUnreadCount();
    
    // Set up polling - only if not already loading
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchUnreadCount();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array is correct here

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.clear();
      
      setShowLogoutSuccess(true);
      
      setTimeout(() => {
        setShowLogoutSuccess(false);
        router.push('/login');
      }, 1500);
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      router.push('/login');
    }
  };

  const handleNavigation = (path: string): void => {
    router.push(path);
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
                onClick={() => handleNavigation('/home')}
                className="text-xl cursor-pointer font-bold text-foreground hover:text-red-600 transition-colors"
              >
                BloodBridge
              </button>
            </div>

            {/* Right Side Navigation */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-2">
                <Button 
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                >
                  <Info className="w-4 h-4 mr-1" />
                  <a 
                    href="https://mohansunkara.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="no-underline"
                  >
                    About
                  </a>
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => handleNavigation('/finddonor')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Find Donor
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => handleNavigation('/trackimpact')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Track Impact
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => handleNavigation('/healthaibot')}
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
                    {/* Unread Count Badge on Avatar */}
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 max-w-5 text-xs px-1.5 rounded-full bg-red-500 text-white font-bold shadow-sm border-2 border-white"
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
                    onClick={() => handleNavigation('/profile')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  {/* Mails */}
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/mails')}
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
                  
                  {/* Mobile Navigation Items */}
                  <DropdownMenuItem className="cursor-pointer md:hidden">
                    <Info className="mr-2 h-4 w-4" />
                    <a 
                      href="https://mohansunkara.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="no-underline"
                    >
                      About
                    </a>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/finddonor')}
                    className="cursor-pointer md:hidden"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Find Donor
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/trackimpact')}
                    className="cursor-pointer md:hidden"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Track Impact
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/healthaibot')}
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
      
      {/* Logout Success Popup */}
      {showLogoutSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/50 backdrop-blur-sm">
          <Card className="p-6 border-0 bg-white max-w-sm w-full mx-4 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Logged Out Successfully!
              </h3>
              <p className="text-sm text-muted-foreground">
                Thank you for using BloodBridge. Stay safe!
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default DonorNavbar;
