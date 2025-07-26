'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Menu, X, User, LogOut, Info, Search, Mail, Bot, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const DonorNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.clear();
      setShowLogoutSuccess(true);
      setTimeout(() => {
        setShowLogoutSuccess(false);
        router.push('/login');
      }, 500);
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      router.push('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
            
            {/* Mobile Menu */}
            <div className="md:hidden relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-muted"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-background border border-border rounded-lg py-2 z-50 shadow-lg">
                  <div className="flex flex-col">
                    <Button 
                      variant="ghost"
                      className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        router.push('/finddonor');
                        setIsMenuOpen(false);
                      }}
                      className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Find Donor
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        router.push('/trackimpact');
                        setIsMenuOpen(false);
                      }}
                      className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Track Impact
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        router.push('/healthaibot');
                        setIsMenuOpen(false);
                      }}
                      className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                    >
                      <Bot className="w-4 h-4 mr-1" />
                      Health Assistant
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        router.push('/profile');
                        setIsMenuOpen(false);
                      }}
                      className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                    >
                      <User className="w-4 h-4 mr-1" />
                      Profile
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        router.push('/mails');
                        setIsMenuOpen(false);
                      }}
                      className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Mails
                    </Button>
                    <div className="border-t border-border my-1" />
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700 cursor-pointer rounded-none hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Info className="w-4 h-4 mr-1" />
                <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
              </Button>
              <Button 
                variant="ghost"
                onClick={() => router.push('/finddonor')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Search className="w-4 h-4 mr-1" />
                Find Donor
              </Button>
              <Button 
                variant="ghost"
                onClick={() => router.push('/trackimpact')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Track Impact
              </Button>
              <Button 
                variant="ghost"
                onClick={() => router.push('/healthaibot')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Bot className="w-4 h-4 mr-1" />
                Health Assistant
              </Button>
              <Button 
                variant="ghost"
                onClick={() => router.push('/profile')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Button>
              <Button 
                variant="ghost"
                onClick={() => router.push('/mails')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-1" />
                Mails
              </Button>
              <Button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {showLogoutSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <Card className="p-6 border-0 bg-white max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
