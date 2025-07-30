'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Menu, X, Info, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-background sticky top-0 z-50 border-b border-border"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Only visible element on mobile */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='flex items-center gap-2'
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center"
            >
              <Droplets className="w-5 h-5 text-white" />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="text-2xl cursor-pointer font-bold text-foreground hover:text-red-600 transition-colors"
            >
              BloodBridge
            </motion.button>
          </motion.div>

          {/* Mobile Menu - Right Side Only */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:hidden relative" 
            ref={menuRef}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-muted"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Compact Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-12 w-48 bg-background border border-border rounded-lg py-2 z-50"
                >
                  <div className="flex flex-col">
                    {[
                      {
                        icon: Info,
                        label: 'About',
                        action: null,
                        href: 'https://mohansunkara.vercel.app/',
                        external: true
                      },
                      {
                        icon: Bot,
                        label: 'Health Assistant',
                        action: () => {
                          router.push('/healthbotai');
                          setIsMenuOpen(false);
                        }
                      },
                      {
                        icon: null,
                        label: 'Sign In',
                        action: () => {
                          router.push('/login');
                          setIsMenuOpen(false);
                        }
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={item.action || undefined}
                            className="justify-start px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-none hover:bg-muted w-full"
                          >
                            {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                            {item.external ? (
                              <a href={item.href} target="_blank" rel="noopener noreferrer">
                                {item.label}
                              </a>
                            ) : (
                              item.label
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                    
                    <motion.div 
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="border-t border-border my-1" 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => {
                            router.push('/register');
                            setIsMenuOpen(false);
                          }}
                          className="mx-2 my-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm cursor-pointer w-[calc(100%-1rem)]"
                        >
                          Save Lives
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Desktop Menu - Unchanged */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex items-center gap-3"
          >
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
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.push('/healthbotai')}
              >
                <Bot className="w-4 h-4 mr-2" />
                Health Assistant
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Sign In
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(239, 68, 68, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push('/register')}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer"
              >
                Save Lives
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default DefaultNavbar;
