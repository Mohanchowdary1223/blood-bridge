"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Share2, Droplets, User, CalendarClock, Heart, ArrowLeft, Copy, Users, TrendingUp, Instagram, Mail, Check, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { FaWhatsapp } from 'react-icons/fa'

export default function AboveAgeHome() {
  const [userName, setUserName] = useState('User');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
          if (userData && userData.bloodType) {
            setBloodGroup(userData.bloodType);
          }
        } catch {}
      }
    }
  }, []);

  const handleSearchClick = () => {
    router.push('/finddonor')
  }

  const handleGuideClick = () => {
    router.push('/healthaibot')
  }

  // Share data
  const shareData = {
    title: 'BloodBridge - Save Lives Through Blood Donation',
    text: 'Join BloodBridge and help save lives! Every donation can save up to 3 lives. Be a hero in someone\'s story. You can also find donors near you when needed.',
    url: typeof window !== 'undefined' ? window.location.href : '',
  };

  // Copy to clipboard function that prevents dropdown closing
  const handleCopyLink = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 3000);
        return;
      }

      // Fallback to execCommand
      const textArea = document.createElement('textarea');
      textArea.value = shareData.url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 3000);
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      // Final fallback - show prompt
      prompt('Copy this link:', shareData.url);
    }
  };

  // Enhanced WhatsApp share with better messaging
  const handleWhatsAppShare = () => {
    const enhancedText = `${shareData.text}\n\n🔍 Find donors instantly\n❤️ Save up to 3 lives per donation\n🌟 Join our life-saving community`;
    const encodedText = encodeURIComponent(`${enhancedText}\n\n${shareData.url}`);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Instagram share
  const handleInstagramShare = () => {
    window.open('https://www.instagram.com/', '_blank');
    handleCopyLink();
  };

  // Email share
  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(`${shareData.text}\n\nCheck it out: ${shareData.url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
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

  // Function to get blood type classification
  const getBloodTypeClassification = (bloodType: string): string => {
    switch (bloodType) {
      case 'O-':
        return 'Universal Donor';
      case 'AB+':
        return 'Universal Receiver';
      case 'O+':
        return 'Common Donor';
      case 'AB-':
        return 'Rare Receiver';
      case 'A-':
      case 'B-':
        return 'Rare Donor';
      case 'A+':
      case 'B+':
        return 'Common Type';
      default:
        return 'Wisdom & Experience';
    }
  };

  const compatibility = bloodGroup && bloodGroup !== 'Unknown' && bloodGroup !== 'unknown' && bloodGroup !== "I don't know my blood type" 
    ? getBloodCompatibility(bloodGroup) 
    : null;

  const isUnknownBloodType = !bloodGroup || bloodGroup === 'Unknown' || bloodGroup === 'unknown' || bloodGroup === "I don't know my blood type";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-10">
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
              Although you may have aged past the donation limit, you can still help save lives by connecting others with donors.
            </p>
          </div>
        </div>

        {/* Main Action Cards - Find Donors and Health Guide */}
        
        <div className="mb-12 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
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

            <Card className="group transition-all duration-300 border-0 hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Health Assistant</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get personalized health guidance and donation recovery tips from our smart chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={handleGuideClick}
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Health Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Blood Compatibility Section */}
        <div className="mb-12">
          {isUnknownBloodType ? (
            // Side by side layout for unknown blood type
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Blood Type: Unknown</h3>
                <Badge className="bg-orange-50 text-orange-600 border-orange-200">
                  Update Required
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Message */}
                <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                        <CalendarClock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">About Age & Donation</h3>
                      <p className="text-muted-foreground">
                        Most blood banks set an upper age limit (often 65-70) for safety reasons. 
                        Your years of wisdom can still help save lives through mentoring others and spreading awareness!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Update Profile Card */}
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-foreground">Update Your Profile</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Add your blood type to see compatibility information and help others find you if needed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Knowing your blood type helps us:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Show compatible donors for you</li>
                        <li>• Display your blood type classification</li>
                        <li>• Help others find you in emergencies</li>
                      </ul>
                      <Button
                        onClick={() => router.push('/profile')}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Update Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Age-focused compatibility information for known blood type
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Your Blood Type: {bloodGroup}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                    Wisdom & Experience
                  </Badge>
                  <Badge className="bg-purple-50 text-purple-600 border-purple-200">
                    {getBloodTypeClassification(bloodGroup)}
                  </Badge>
                </div>
              </div>

              {/* Side by Side Layout for Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Message */}
                <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                        <CalendarClock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">About Age & Donation</h3>
                      <p className="text-muted-foreground">
                        Most blood banks set an upper age limit (often 65-70) for safety reasons. 
                        Your years of wisdom can still help save lives through mentoring others and spreading awareness!
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

        <div className="mb-12">
          <Card className="border-0 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Blood Donation Impact
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Understanding the critical importance of blood donation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lives Saved */}
                <div className="text-center p-6 bg-white/70 rounded-xl border border-red-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-red-600 mb-2">3</h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Lives Saved</p>
                  <p className="text-xs text-gray-600">Per donation</p>
                </div>

                {/* Blood Demand */}
                <div className="text-center p-6 bg-white/70 rounded-xl border border-orange-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-orange-600 mb-2">38%</h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Population Eligible</p>
                  <p className="text-xs text-gray-600">To donate blood</p>
                </div>

                {/* Critical Need */}
                <div className="text-center p-6 bg-white/70 rounded-xl border border-purple-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">5%</h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Actually Donate</p>
                  <p className="text-xs text-gray-600">Of eligible donors</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-red-600" />
                  <h4 className="font-bold text-gray-800">Why Your Blood Matters</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Someone needs blood every 2 seconds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Blood cannot be manufactured artificially</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Red blood cells last only 42 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>One donation helps multiple patients</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Enhanced Share Section with Dropdown Menu */}
        <div className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div className='flex flex-col text-center md:text-left'>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Help Us Save More Lives</h3>
                    <p className="text-gray-600 max-w-md text-sm">
                      Share BloodBridge with your friends and family. Together, we can build a stronger community of life-savers.
                    </p>
                  </div>
                </div>
                
                {/* Share Dropdown Menu with Manual Control */}
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-3"
                    >
                      <Share2 className="w-5 h-5" />
                      Share BloodBridge
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-auto p-2">
                   
                    {/* Social Media Icons Row */}
                    <div className='flex flex-row gap-2'>
                      {/* WhatsApp */}
                      <DropdownMenuItem 
                        onClick={handleWhatsAppShare} 
                        className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                        aria-label="Share via WhatsApp"
                      >
                        <FaWhatsapp className="w-5 h-5 text-green-600" />
                      </DropdownMenuItem>
                      
                      {/* Instagram */}
                      <DropdownMenuItem 
                        onClick={handleInstagramShare} 
                        className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                        aria-label="Share via Instagram"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </DropdownMenuItem>
                      
                      {/* Email */}
                      <DropdownMenuItem 
                        onClick={handleEmailShare} 
                        className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                        aria-label="Share via Email"
                      >
                        <Mail className="w-5 h-5 text-blue-600" />
                      </DropdownMenuItem>
                    </div>
               
                    <DropdownMenuSeparator />
                    
                    {/* Copy Link - Updated to prevent dropdown closing */}
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        handleCopyLink();
                      }}
                      className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2 justify-center"
                    >
                      {copyStatus === 'copied' ? (
                        <Check className="w-5 h-5 text-green-600" /> 
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                      <span>{copyStatus === 'copied' ? 'Copied!' : 'Copy Link'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <div className="grid grid-cols-2 gap-2">
                {/* Left Column */}
                <ul className="space-y-2">
                  <li>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About</a>
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
                </ul>
                
                {/* Right Column */}
                <ul className="space-y-2">
                  <li>
                    <Button variant="link"
                      onClick={() => {
                          router.push('/healthaibot');
                        }} className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      Health Assistant
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

      {/* Fixed Health Guide Button */}
      <Button
        onClick={handleGuideClick}
        size="icon"
        className="fixed bottom-8 right-4 w-12 h-12 rounded-full hover:scale-110 transition-all duration-300 z-50 bg-primary hover:bg-primary/80 cursor-pointer border-2 border-white"
        title="Health Assistant"
      >
        <Bot className="w-10 h-10 text-white" />
      </Button>
    </div>
  );
}
