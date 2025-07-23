"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Search, Share2, Droplets } from 'lucide-react';

export default function HealthIssueHome() {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('User');
  const router = useRouter();
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/register` : '';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchClick = () => {
    router.push('/finddonor')
  }

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
              While you may not be able to donate right now, you can still help save lives by connecting others with donors.
            </p>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="mb-12 flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
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

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
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
