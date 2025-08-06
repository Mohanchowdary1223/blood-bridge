/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Info, Search, Mail, BarChart3, User, LogOut } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

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

  // Fetch unread notifications count (only user notifications, not admin messages)
  useEffect(() => {
    const fetchUnreadCount = async (): Promise<void> => {
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
            } catch {}
          }
        }
        if (!userId) {
          setIsLoading(false);
          return;
        }
        // Fetch user notifications
        const res = await fetch(`/api/reportvotedata?userId=${userId}`);
        let userUnread = 0;
        if (res.ok) {
          const data = await res.json();
          if (data.notifications && Array.isArray(data.notifications)) {
            userUnread = data.notifications.filter((n: any) => n.status === 'unread').length;
          }
        }
        setUnreadCount(userUnread);
      } catch (error) {
        // error handling
      } finally {
        setIsLoading(false);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(() => {
      if (!isLoading) fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-background sticky top-0 z-50 border-b border-border"
      >
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='flex items-center gap-2'
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center"
              >
                <Droplets className="w-5 h-5 text-white" />
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation('/home')}
                className="text-xl cursor-pointer font-bold text-foreground hover:text-red-600 transition-colors"
              >
                BloodBridge
              </motion.button>
            </motion.div>

            {/* Right Side Navigation */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center space-x-4"
            >
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost"
                    onClick={() => handleNavigation('/finddonor')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                  >
                    <Search className="w-4 h-4 mr-1" />
                    Find Donor
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost"
                    onClick={() => handleNavigation('/trackimpact')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Track Impact
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost"
                    onClick={() => handleNavigation('/healthaibot')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer gap-0"
                  >
                    <Droplets className="w-4 h-4 mr-1" />
                    Health Assistant
                  </Button>
                </motion.div>
              </div>

              {/* Profile Dropdown with Badge */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                      <AnimatePresence>
                        {unreadCount > 0 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-5 max-w-5 text-xs px-1.5 rounded-full bg-red-500 text-white font-bold shadow-sm border-2 border-white"
                            >
                              <motion.span
                                key={unreadCount}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </motion.span>
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {/* User Name with Unread Count */}
                  <div className="flex flex-col space-y-1 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {userName.charAt(0).toUpperCase() + userName.slice(1)}
                      </p>
                    </div>
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs leading-none text-muted-foreground"
                        >
                          {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                        </motion.p>
                      )}
                    </AnimatePresence>
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
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="ml-auto"
                        >
                          <Badge 
                            variant="destructive" 
                            className="h-4 min-w-4 text-[10px] px-1 rounded-full bg-red-500 hover:bg-red-500 text-white font-bold"
                          >
                            <motion.span
                              key={unreadCount}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </motion.span>
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                    <Droplets className="mr-2 h-4 w-4" />
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
            </motion.div>
          </div>
        </div>
      </motion.nav>
      
      {/* Logout Success Popup */}
      <AnimatePresence>
        {showLogoutSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-[100] bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                duration: 0.4 
              }}
            >
              <Card className="p-6 border-0 bg-white max-w-sm w-full mx-4 shadow-lg">
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <LogOut className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg font-semibold text-gray-900 mb-2"
                  >
                    Logged Out Successfully!
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-muted-foreground"
                  >
                    Thank you for using BloodBridge. Stay safe!
                  </motion.p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DonorNavbar;
