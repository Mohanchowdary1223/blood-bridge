"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { Search, Heart, BarChart3, BookOpen, Clock, CheckCircle, Droplets, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HomeComponentProps {
  hideRecentActivity?: boolean;
}

const HomeComponent: React.FC<HomeComponentProps> = ({ hideRecentActivity = false }) => {
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

  const handleScheduleClick = () => {
    router.push('/schedule-donation')
  }

  const handleStatsClick = () => {
    router.push('/stats')
  }

  const handleGuideClick = () => {
    router.push('/health-instructions')
  }

  const handleShareClick = async () => {
    const shareData = {
      title: 'BloodBridge',
      text: 'Check out BloodBridge, your platform for blood donation and management! Join me in making a difference.',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        console.log('Share successful');
      } catch (error) {
        console.error('Share failed:', error);
        fallbackCopy();
      }
    } else {
      console.log('Web Share API not supported, using fallback');
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert('Link copied to clipboard! You can now paste and share it manually.');
      })
      .catch((error) => {
        console.error('Clipboard copy failed:', error);
        alert('Unable to copy link. Please copy the URL manually: ' + window.location.href);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Hello</span>{" "}
              <span className="text-foreground">{userName.slice(0,1).toUpperCase()}{userName.slice(1)},</span>
            </h2>
          </div>
          <div className="space-y-4">
            <Badge className="bg-red-50 text-red-600 border-red-200 px-4 py-2">
              <Droplets className="w-4 h-4 mr-2" />
              BloodBridge Community
            </Badge>
            <p className= "text-lg text-muted-foreground max-w-2xl mx-auto">
              Your one-stop platform for blood donation and management. Make a difference today.
            </p>
          </div>
        </div>
        
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group transition-all duration-300 border-0  hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Find Donors</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Search for blood donors in your area
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={handleSearchClick}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Find Donor
                </Button>
              </CardContent>
            </Card>

            <Card className="group  transition-all duration-300 border-0 hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Donate Blood</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Schedule your next blood donation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={handleScheduleClick}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Schedule
                </Button>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 border-0 hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Track Impact</CardTitle>
                <CardDescription className="text-muted-foreground">
                  View your donation history and impact
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={handleStatsClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  View Stats
                </Button>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 border-0 hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Health Guide</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Learn recovery and health maintenance tips
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={handleGuideClick}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  View Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Share Section */}
        <div className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-12 h-12 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div className='flex flex-col text-center md:text-left'>
                    <h3 className="text-xl font-semibold text-foreground">Spread the Word</h3>
                    <p className="text-muted-foreground">Help more people discover BloodBridge and save lives together</p>
                  </div>
                </div>
                <Button
                  onClick={handleShareClick}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share with Friends
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {!hideRecentActivity && (
          <Card className="border-0 mb-12">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Stay updated with your latest donation activities and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 ">
                    <p className="font-semibold text-blue-900">Upcoming Donation</p>
                    <p className="text-sm text-blue-700">Your next donation is scheduled for next week</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                    Pending
                  </Badge>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Donation Impact</p>
                    <p className="text-sm text-green-700">Your last donation helped save 3 lives</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                    Completed
                  </Badge>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-purple-900">Health Status</p>
                    <p className="text-sm text-purple-700">You're eligible to donate again in 2 months</p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
                    Good
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">BloodBridge</h3>
              </div>
              <p className="text-muted-foreground">
                Connecting blood donors with those in need, making a difference one donation at a time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    About Us
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Donate Blood
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Find Donor
                  </Button>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Contact Info</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  Email: info@bloodbridge.com
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  Phone: +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  Address: 123 Health Street, Medical City
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BloodBridge. All rights reserved. Made with ❤️ for humanity.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeComponent
