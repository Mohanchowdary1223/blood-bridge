"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Share2, Copy, Droplets } from 'lucide-react';

export default function DonateLaterHome() {
  const [userName, setUserName] = useState('User');
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/` : '';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchClick = () => {
    router.push('/finddonor')
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

        {/* Main Action Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Share & Invite Card */}
            <Card className="group transition-all duration-300 border-0 hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Share & Invite Friends</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Invite others to join our donor community
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button 
                    onClick={handleCopy} 
                    size="sm" 
                    variant="outline"
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                  >
                    <Copy className="w-4 h-4 mr-1" /> 
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  Share this link to invite your friends to register as donors.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* ...Footer stays unchanged... */}
    </div>
  );
}
