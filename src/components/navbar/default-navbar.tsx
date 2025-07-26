'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Menu, X, Info, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DefaultNavbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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
    <nav className="bg-background sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Only visible element on mobile */}
          <div className='flex items-center gap-2'>
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-2xl cursor-pointer font-bold text-foreground hover:text-red-600 transition-colors"
            >
              BloodBridge
            </button>
          </div>

          {/* Mobile Menu - Right Side Only */}
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

            {/* Compact Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-background border border-border rounded-lg py-2 z-50">
                <div className="flex flex-col">

                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/healthbotai');
                      setIsMenuOpen(false);
                    }}
                    className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Health Assistant
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/login');
                      setIsMenuOpen(false);
                    }}
                    className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted"
                  >
                    Sign In
                  </Button>
                  <div className="border-t border-border my-1" />
                  <Button
                    onClick={() => {
                      router.push('/register');
                      setIsMenuOpen(false);
                    }}
                    className="mx-2 my-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm cursor-pointer"
                  >
                    Save Lives
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Menu - Unchanged */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Info className="w-4 h-4 mr-2" />
              <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => router.push('/healthbotai')}
            >
              <Bot className="w-4 h-4 mr-2" />
              Health Assistant
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push('/register')}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer"
            >
              Save Lives
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DefaultNavbar;
