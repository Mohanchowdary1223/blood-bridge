'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DefaultNavbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className='flex items-center'>
            <Image
              src="https://img.icons8.com/?size=100&id=26115&format=png&color=000000"
              alt="BloodBridge Logo"
              width={30}
              height={30} />
            <button 
              onClick={() => router.push('/')}
              className="text-2xl cursor-pointer font-bold text-primary hover:text-primary/80 transition-colors ml-2"
            >
              Bridge
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>



          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-gray-700 cursor-pointer hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/signup')}
              className="text-gray-700 cursor-pointer hover:text-primary transition-colors"
            >
              Sign Up
            </button>
            <button 
              onClick={() => router.push('/register')}
              className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
            >
              Save Lives
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => {
                  router.push('/login');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-center text-gray-700 hover:text-primary transition-colors mb-2"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  router.push('/signup');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-center text-gray-700 hover:text-primary transition-colors mb-2"
              >
                Sign Up
              </button>
              <button 
                onClick={() => {
                  router.push('/register');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
              >
                Save Lives
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DefaultNavbar; 