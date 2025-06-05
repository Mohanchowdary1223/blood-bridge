"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const HomeComponent = () => {
  const router = useRouter()

  const handleSearchClick = () => {
    router.push('/finddonor')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b bg-white pt-">
      {/* Welcome Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl">
            <span className="text-primary font-bold">Hello</span>{" "}
            <span className="text-black font-bold">User</span>
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
        <div className="grid grid-cols-1 p-0 md:p-0 pl-0 md:pl-40 pr-0 md:pr-40  sm:p-0 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 flex flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-primary mb-3">Find Donors</h3>
            <p className="text-gray-600 mb-4">Search for blood donors in your area</p>
            <button 
              onClick={handleSearchClick}
              className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors"
            >
              Find Donor
            </button>
          </div>
          <div className="bg-white p-6 flex flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-primary mb-3">Donate Blood</h3>
            <p className="text-gray-600 mb-4">Schedule your next blood donation</p>
            <button className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors">
              Schedule
            </button>
          </div>
          <div className="bg-white p-6 flex flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-primary mb-3">Track Impact</h3>
            <p className="text-gray-600 mb-4">View your donation history and impact</p>
            <button className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors">
              View Stats
            </button>
          </div>
          <div className="bg-white p-6 flex flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-primary mb-3">Health Care Guide</h3>
            <p className="text-gray-600 mb-4">Learn how to recover and maintain healthy blood levels</p>
            <button className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors">
              View Guide
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-primary mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
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
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
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
    </div>
  )
}

export default HomeComponent