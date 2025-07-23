"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Share2, Droplets } from 'lucide-react';

export default function DonateLaterHome() {
  const [userName, setUserName] = useState('User');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData && userData.name) {
            setUserName(userData.name);
          }
        } catch {}
      }
    }
  }, []);

  const handleSearchClick = () => {
    router.push('/finddonor')
  };

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
              <span className="text-foreground">
                {userName.slice(0,1).toUpperCase()}{userName.slice(1)},
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            <Badge className="bg-red-50 text-red-600 border-red-200 px-4 py-2">
              <Droplets className="w-4 h-4 mr-2" />
              BloodBridge Community
            </Badge>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take your time! You can find donors now, register to donate when you're ready, or invite friends to join.
            </p>
          </div>
        </div>

        {/* Main Action Cards - Now 2 cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Find Donors Card */}
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

            {/* Donate Blood Card */}
            <Card className="group transition-all duration-300 border-0 hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Donate Blood</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Register to donate blood when you're ready
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => router.push('/donorform')}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Register to Donate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Share Section */}
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
  );
}
