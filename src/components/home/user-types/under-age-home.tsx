"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Share2, Clock, Droplets, AlertCircle, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

function getEligibilityCountdown(dateOfBirth: string) {
  if (!dateOfBirth) return '';
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const eligibleDate = new Date(dob);
  eligibleDate.setFullYear(eligibleDate.getFullYear() + 18);
  const diff = eligibleDate.getTime() - now.getTime();
  if (diff <= 0) return 'Eligible now!';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days} days, ${hours} hours, ${minutes} minutes`;
}

export default function UnderAgeHome() {
  const [dob, setDob] = useState('');
  const [userName, setUserName] = useState('User');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [timer, setTimer] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.name) setUserName(user.name);
          setDob(user.dateOfBirth || '');
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData && userData.bloodType) {
            setBloodGroup(userData.bloodType);
          }
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (dob) {
      setTimer(getEligibilityCountdown(dob));
      const interval = setInterval(() => setTimer(getEligibilityCountdown(dob)), 60000);
      return () => clearInterval(interval);
    }
  }, [dob]);

  const handleSearchClick = () => {
    router.push('/finddonor')
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

  // Blood compatibility logic - receive only
  interface BloodCompatibility {
    canReceiveFrom: string[];
  }

  const getBloodCompatibility = (bloodType: string): BloodCompatibility | null => {
    const compatibilityMap: Record<string, BloodCompatibility> = {
      'O-': { canReceiveFrom: ['O-'] },
      'O+': { canReceiveFrom: ['O-', 'O+'] },
      'A-': { canReceiveFrom: ['O-', 'A-'] },
      'A+': { canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
      'B-': { canReceiveFrom: ['O-', 'B-'] },
      'B+': { canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
      'AB-': { canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
      'AB+': { canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
    };
    
    return compatibilityMap[bloodType] || null;
  };

  const compatibility = bloodGroup && bloodGroup !== 'Unknown' && bloodGroup !== "I don't know my blood type" 
    ? getBloodCompatibility(bloodGroup) 
    : null;

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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome! You're not quite old enough to donate yet, but you can still help connect with our community.
            </p>
          </div>
        </div>

        {/* Main Action Cards - Now only Find Donors */}
        <div className="mb-12 flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 gap-6 min-w-full md:min-w-2xs">
            <Card className="group transition-all duration-300 border-0 hover:-translate-y-2">
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
          </div>
        </div>

        {/* Blood Compatibility Section */}
        <div className="mb-12">
          {!bloodGroup || bloodGroup === 'Unknown' || bloodGroup === "I don't know my blood type" ? (
            // Card for unknown blood type
            <Card className="border-0 bg-gradient-to-r from-orange-50 to-amber-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className='flex flex-col text-center md:text-left'>
                      <h3 className="text-xl font-semibold text-foreground">Know Your Blood Type</h3>
                      <p className="text-muted-foreground text-md">Update your blood type to see which donors can help you if needed</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/profile')}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Age-focused compatibility information
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Your Blood Type: {bloodGroup}</h3>
                <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                  Future Donor
                </Badge>
              </div>

              {/* Side by Side Layout for Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age & Eligibility Message */}
                <Card className="border-0 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Time Until Eligible</h3>
                      <div className="text-lg font-semibold text-purple-700 mb-2">
                        {timer || 'Loading...'}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        You'll be able to donate blood once you turn 18. Until then, you can help by finding donors and spreading awareness!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Compatible Donors Section */}
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ArrowLeft className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-foreground">Compatible Donors for You</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      If you ever need blood, these types are safe for you to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {compatibility?.canReceiveFrom?.map((type) => (
                        <Badge 
                          key={type} 
                          className="bg-green-100 text-green-700 border-green-200 px-3 py-1"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-3">
                      These blood types are compatible and safe for you to receive
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
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
                    <a href="https://mohansunkara.vercel.app/">About Us</a>
                  </Button>
                </li>
                <li>
                  <Button variant="link"
                    onClick={() => {
                        router.push('/finddonor');
                      }} className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Find Donor
                  </Button>
                </li>
                <li>
                  <Button variant="link" 
                    onClick={() => {
                        router.push('/profile');
                      }} className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Profile 
                  </Button>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Contact Info</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  Email: mohanchowdary963@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  Phone: +91 9182622919
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  Linkedin: <a href="https://www.linkedin.com/in/mohan-chowdary-963" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mohan Sunkara</a>
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
  );
}
