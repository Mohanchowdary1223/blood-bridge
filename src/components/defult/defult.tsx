"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { easeInOut, motion } from 'framer-motion'
import { Heart, Search, BarChart3, ArrowUp, Droplets, Activity, Share2, LucideIcon, Copy, Instagram, Mail, Check, Bot, Users, TrendingUp } from 'lucide-react'
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

// Animation variants
import { easeOut } from "framer-motion";

const fadeInUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: easeOut
    } 
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const scaleOnHover = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  }
}

// Blinking Heart Animation Variants
const heartBlinkAnimation = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1]
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

const smallHeartBlinkAnimation = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1]
  },
  transition: {
    duration: 1.2,
    repeat: Infinity,
    ease: "easeInOut"
  }
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

  const handleGuideClick = (): void => {
    router.push('/healthbotai')
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
    <motion.div 
      className="group"
      whileHover="hover"
      variants={scaleOnHover}
    >
      <div className="text-3xl font-bold text-red-600 mb-2 group-hover:scale-105 transition-transform">
        {value}
      </div>
      <div className="text-gray-600">{label}</div>
    </motion.div>
  )

  const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <motion.div
      whileHover="hover"
      variants={scaleOnHover}
    >
      <Card className="border-0  transition-all bg-white group hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
            <Icon className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
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
      description: "Record and monitor your donation history with detailed analytics and impact metrics"
    },
    {
      icon: Bot,
      title: "AI Health Assistant",
      description: "Get personalized health guidance and donation recovery tips from our smart chatbot"
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
      <motion.section 
        className="pt-12 pb-16 px-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariant}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="inline-flex items-center gap-2 bg-red-50 text-red-600 border-red-200 px-3 py-1 rounded-full text-sm mb-6">
              <Droplets className="w-4 h-4" />
              Trusted by 10,000+ donors
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Save Lives Through
            <span className="block text-red-500">Blood Donation</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join our community of life-savers. Find donors instantly when you need them, 
            and save up to three lives with every donation you make.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-red-500 hover:bg-red-600 px-8 py-3 transition-all cursor-pointer"
              onClick={handleRegisterClick}
            >
              <motion.div
                animate={smallHeartBlinkAnimation.animate}
                transition={{ ...smallHeartBlinkAnimation.transition, ease: easeInOut }}
              >
                <Heart className="w-5 h-5 mr-2" />
              </motion.div>
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
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUpVariant}
              >
                <StatCard value={stat.value} label={stat.label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
{/* Features Section */}
<motion.section 
  className="py-16 bg-gray-50"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: false, amount: 0.2 }}
  variants={fadeInUpVariant}
>
  <div className="max-w-6xl mx-auto px-6">
    <motion.div 
      className="text-center mb-12"
      variants={fadeInUpVariant}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
      <p className="text-lg text-gray-600">Simple steps to make a difference</p>
    </motion.div>

    <motion.div 
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          variants={fadeInUpVariant}
        >
          <FeatureCard 
            icon={feature.icon} 
            title={feature.title} 
            description={feature.description} 
          />
        </motion.div>
      ))}
    </motion.div>
  </div>
</motion.section>


      {/* Blood Importance & Statistics Section */}
      <motion.section 
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={fadeInUpVariant}
      >
        <div className="max-w-6xl mx-auto px-6">
          <Card className="border-0 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <motion.div
                  animate={heartBlinkAnimation.animate}
                  transition={{ ...heartBlinkAnimation.transition, ease: easeInOut }}
                >
                  <Heart className="w-8 h-8 text-red-500" />
                </motion.div>
                Blood Donation Impact
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Understanding the critical importance of blood donation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
              >
                {/* Lives Saved */}
                <motion.div 
                  className="text-center p-6 bg-white/70 rounded-xl border border-red-100"
                  variants={fadeInUpVariant}
                  whileHover="hover"
                  style={{ transform: 'scale(1)' }}
                  animate={{ transform: 'scale(1)' }}
                  transition={{ duration: 0.2 }}
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-red-600 mb-2">3</h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Lives Saved</p>
                  <p className="text-xs text-gray-600">Per donation</p>
                </motion.div>

                {/* Blood Demand */}
                <motion.div 
                  className="text-center p-6 bg-white/70 rounded-xl border border-orange-100"
                  variants={fadeInUpVariant}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-orange-600 mb-2">38%</h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Population Eligible</p>
                  <p className="text-xs text-gray-600">To donate blood</p>
                </motion.div>

                {/* Critical Need */}
                <motion.div 
                  className="text-center p-6 bg-white/70 rounded-xl border border-purple-100"
                  variants={fadeInUpVariant}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">5%</h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Actually Donate</p>
                  <p className="text-xs text-gray-600">Of eligible donors</p>
                </motion.div>
              </motion.div>

              {/* Additional Info */}
              <motion.div 
                className="p-6 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={smallHeartBlinkAnimation.animate}
                    transition={{ ...smallHeartBlinkAnimation.transition, ease: easeInOut }}
                  >
                    <Heart className="w-6 h-6 text-red-600" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-gray-800">Why Your Blood Matters</h4>
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
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Share Section with Icon-Only Dropdown */}
      <motion.section 
        className="py-16 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={fadeInUpVariant}
      >
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
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 bg-primary text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={fadeInUpVariant}
      >
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
            <motion.div
              animate={smallHeartBlinkAnimation.animate}
              transition={{ ...smallHeartBlinkAnimation.transition, ease: easeInOut }}
            >
              <Heart className="w-5 h-5 mr-2" />
            </motion.div>
            Become a Donor
          </Button>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="bg-muted mt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={fadeInUpVariant}
      >
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
      </motion.footer>

      {/* Fixed Health Guide Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <Button
          onClick={handleGuideClick}
          size="icon"
          className="fixed bottom-24 right-8 w-14 h-14 rounded-full hover:scale-110 transition-all duration-300 z-50 bg-primary hover:bg-primary/70 cursor-pointer shadow-lg border-2 border-white"
          title="Health Guide"
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      </motion.div>

      {/* Scroll to Top Button */}
      {showScroll && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-8 right-8 rounded-full hover:scale-110 transition-all z-50 bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export default BloodBridgeLanding
