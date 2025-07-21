'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AuthNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.clear();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className='flex items-center'>
            <Image
              src="https://img.icons8.com/?size=100&id=26115&format=png&color=000000"
              alt="BloodBridge Logo"
              width={32}
              height={32} />
            <button 
              onClick={() => router.push('/home')}
              className="text-2xl font-bold cursor-pointer text-primary hover:text-primary/80 transition-colors"
            >
              Bridge
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-primary transition-colors px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            <button 
              onClick={() => router.push('/health-instructions')}
              className="flex items-center cursor-pointer gap-2 text-gray-700 hover:text-primary transition-colors px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Health Instructions
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-8 py-2 rounded-full cursor-pointer hover:bg-red-600 transition-all duration-200 text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/50"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <svg 
              className="w-6 h-6 text-gray-600" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4 pb-4`}> 
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/profile')}
              className="flex items-center cursor-pointer justify-center gap-2 text-gray-700 hover:text-primary transition-colors py-2.5 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            <button 
              onClick={() => router.push('/health-instructions')}
              className="flex items-center cursor-pointer justify-center gap-2 text-gray-700 hover:text-primary transition-colors py-2.5 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Health Instructions
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-8 py-2 rounded-full hover:bg-red-600 transition-all duration-200 text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/50 text-center"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar; 