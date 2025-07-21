"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

const HomeComponent = () => {
  const router = useRouter()

  const [userName, setUserName] = useState('User');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.name) setUserName(user.name);
        } catch {}
      }
    }
  }, []);

  const handleSearchClick = () => {
    router.push('/finddonor')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-8 flex flex-col items-center justify-between">
      {/* Welcome Section */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl">
            <span className="text-primary font-bold">Hello</span>{" "}
            <span className="text-black font-bold">{userName}</span>
          </h2>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Welcome to BloodBridge
          </h1>
          <p className="text-lg text-gray-600">
            Your one-stop platform for blood donation and management
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 flex flex-col items-center justify-center rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-primary mb-3">Find Donors</h3>
            <p className="text-gray-600 mb-4">Search for blood donors in your area</p>
            <button 
              onClick={handleSearchClick}
              className="bg-primary cursor-pointer text-white px-8 py-3 rounded-full hover:bg-primary/80 transition-all duration-200 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Find Donor
            </button>
          </div>
          <div className="bg-white p-8 flex flex-col items-center justify-center rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-primary mb-3">Donate Blood</h3>
            <p className="text-gray-600 mb-4">Schedule your next blood donation</p>
            <button className="bg-primary cursor-pointer text-white px-8 py-3 rounded-full hover:bg-primary/80 transition-all duration-200 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50">
              Schedule
            </button>
          </div>
          <div className="bg-white p-8 flex flex-col items-center justify-center rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-primary mb-3">Track Impact</h3>
            <p className="text-gray-600 mb-4">View your donation history and impact</p>
            <button className="bg-primary cursor-pointer text-white px-8 py-3 rounded-full hover:bg-primary/80 transition-all duration-200 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50">
              View Stats
            </button>
          </div>
          <div className="bg-white p-8 flex flex-col items-center justify-center rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-primary mb-3">Health Care Guide</h3>
            <p className="text-gray-600 mb-4">Learn how to recover and maintain healthy blood levels</p>
            <button className="bg-primary cursor-pointer text-white px-8 py-3 rounded-full hover:bg-primary/80 transition-all duration-200 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50">
              View Guide
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold text-primary mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Upcoming Donation</p>
                <p className="text-sm text-gray-600">Your next donation is scheduled for next week</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Donation Impact</p>
                <p className="text-sm text-gray-600">Your last donation helped save 3 lives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-primary text-white py-8 md:py-12 mt-8 w-full">
        <div className="container mx-auto px-2 md:px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-4 md:gap-8 text-center md:text-left">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Blood Bridge</h3>
              <p className="text-white/80 text-xs md:text-base">
                Connecting blood donors with those in need, making a difference one donation at a time.
              </p>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Quick Links</h3>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <button 
                    onClick={() => router.push('/')} 
                    className="text-white/80 hover:text-white cursor-pointer text-xs md:text-base"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/register')} 
                    className="text-white/80 hover:text-white cursor-pointer text-xs md:text-base"
                  >
                    Donate Blood
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/finddonor')} 
                    className="text-white/80 hover:text-white cursor-pointer text-xs md:text-base"
                  >
                    Find Donor
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Contact Info</h3>
              <ul className="space-y-1 md:space-y-2 text-white/80">
                <li className="text-xs md:text-base">Email: info@bloodbridge.com</li>
                <li className="text-xs md:text-base">Phone: +1 (555) 123-4567</li>
                <li className="text-xs md:text-base">Address: 123 Health Street, Medical City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-4 md:mt-8 pt-4 md:pt-8 text-center text-white/60 text-xs md:text-base">
            <p>&copy; {new Date().getFullYear()} Blood Bridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeComponent