'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Info, Search, Bot, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

const AuthNavbar = () => {
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
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
                onClick={() => router.push('/home')}
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
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost"
                    onClick={() => router.push('/finddonor')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Find Donor
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost"
                    onClick={() => router.push('/healthaibot')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Health Assistant
                  </Button>
                </motion.div>
              </div>

              {/* Profile Dropdown */}
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
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {userName.charAt(0).toUpperCase() + userName.slice(1)}
                    </p>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
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
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Logout Success Popup - Enhanced */}
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

export default AuthNavbar;
