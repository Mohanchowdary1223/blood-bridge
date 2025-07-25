"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Search, BarChart3, ArrowUp, Droplets, Activity, Share2, LucideIcon, Copy, Instagram, Mail, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { FaWhatsapp } from 'react-icons/fa'


interface StatCardProps {
  value: string;
  label: string;
}


interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}


const BloodBridgeLanding: React.FC = () => {
  const router = useRouter()
  const [showScroll, setShowScroll] = useState<boolean>(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)


  useEffect(() => {
    const handleScroll = (): void => {
      setShowScroll(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  const handleRegisterClick = (): void => {
    router.push('/register')
  }


  const handleEmergencyClick = (): void => {
    router.push('/signup')
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


  // Instagram share (fixed - no more popup)
  const handleInstagramShare = () => {
    // Simply open Instagram web without trying app protocol
    window.open('https://www.instagram.com/', '_blank');
    // Also copy the link for easy pasting
    handleCopyLink();
  };


  // Email share
  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(`${shareData.text}\n\nCheck it out: ${shareData.url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };



  const StatCard: React.FC<StatCardProps> = ({ value, label }) => (
    <div className="group">
      <div className="text-3xl font-bold text-red-600 mb-2 group-hover:scale-105 transition-transform">
        {value}
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  )


  const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <Card className="border-0  transition-all bg-white group hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
          <Icon className="w-6 h-6 text-red-500" />
        </div>
        <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
    </Card>
  )


  const features: FeatureCardProps[] = [
    {
      icon: Search,
      title: "Find Donors Instantly",
      description: "Locate compatible blood donors near you with our advanced matching system"
    },
    {
      icon: Heart,
      title: "Donate Blood",
      description: "Schedule donations and make immediate impact on lives in your community"
    },
    {
      icon: BarChart3,
      title: "Track Your Impact",
      description: "Monitor donations and see your life-saving impact in real-time"
    }
  ]


  const stats: StatCardProps[] = [
    { value: "50K+", label: "Lives Saved" },
    { value: "25K+", label: "Active Donors" },
    { value: "100+", label: "Cities" }
  ]


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-12 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="inline-flex items-center gap-2 bg-red-50 text-red-600 border-red-200 px-3 py-1 rounded-full text-sm mb-6">
            <Droplets className="w-4 h-4" />
            Trusted by 10,000+ donors
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Save Lives Through
            <span className="block text-red-500">Blood Donation</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join our community of life-savers. Find donors instantly when you need them, 
            and save up to three lives with every donation you make.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-red-500 hover:bg-red-600 px-8 py-3 transition-all cursor-pointer"
              onClick={handleRegisterClick}
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Saving Lives
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-300 hover:border-red-500 px-8 py-3 hover:bg-red-50 transition-all cursor-pointer"
              onClick={handleEmergencyClick}
            >
              <Activity className="w-5 h-5 mr-2" />
              Emergency Blood
            </Button>
          </div>


          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to make a difference</p>
          </div>


          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
              />
            ))}
          </div>
        </div>
      </section>


      {/* Impact Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Every Drop Counts</h2>
          <p className="text-lg text-gray-600 mb-12">
            Every two seconds, someone needs blood. Your donation saves lives.
          </p>


          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-6 rounded-lg hover:bg-red-100 transition-colors">
              <div className="text-2xl font-bold text-red-500 mb-2">36,000+</div>
              <div className="text-gray-600">Units needed daily</div>
            </div>
            <div className="bg-red-50 p-6 rounded-lg hover:bg-red-100 transition-colors">
              <div className="text-2xl font-bold text-red-500 mb-2">1 in 7</div>
              <div className="text-gray-600">Patients need blood</div>
            </div>
            <div className="bg-red-50 p-6 rounded-lg hover:bg-red-100 transition-colors">
              <div className="text-2xl font-bold text-red-500 mb-2">3 Lives</div>
              <div className="text-gray-600">Saved per donation</div>
            </div>
          </div>
        </div>
      </section>


      {/* Share Section with Icon-Only Dropdown */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
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
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands making a difference every day.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-red-500 hover:bg-gray-100 px-8 py-3 transition-all cursor-pointer"
            onClick={handleRegisterClick}
          >
            <Heart className="w-5 h-5 mr-2" />
            Become a Donor
          </Button>
        </div>
      </section>


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
              <div>
                <ul className="space-y-2">
                  <li>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      <a href="https://mohansunkara.vercel.app/" target="_blank" rel="noopener noreferrer">About Us</a>
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="link"
                      onClick={() => router.push('/register')}
                      className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Become a Donor
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="link"
                      onClick={() => router.push('/login')}
                      className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Login
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


      {/* Scroll to Top Button */}
      {showScroll && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full hover:scale-110 transition-all z-50 bg-red-500 hover:bg-red-600 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}


export default BloodBridgeLanding
