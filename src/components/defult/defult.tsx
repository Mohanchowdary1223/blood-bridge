"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Search, BarChart3, ArrowUp, Droplets, Activity, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  const StatCard: React.FC<StatCardProps> = ({ value, label }) => (
    <div className="group">
      <div className="text-3xl font-bold text-red-600 mb-2 group-hover:scale-105 transition-transform">
        {value}
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  )

  const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all bg-white group hover:-translate-y-1">
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
      title: "Find Donors",
      description: "Locate compatible donors instantly with advanced matching"
    },
    {
      icon: Heart,
      title: "Donate Blood",
      description: "Schedule donations and make immediate impact on lives"
    },
    {
      icon: BarChart3,
      title: "Track Impact",
      description: "Monitor donations and see your life-saving impact"
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
            Join our community of life-savers. Every donation can save up to three lives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-red-500 hover:bg-red-600 px-8 py-3 shadow-lg hover:shadow-xl transition-all cursor-pointer"
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

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands making a difference every day.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-red-500 hover:bg-gray-100 px-8 py-3 shadow-lg transition-all cursor-pointer"
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
              <h3 className="text-xl font-bold text-foreground">BloodBridge</h3>
              <p className="text-muted-foreground">
                Connecting donors with those in need, one donation at a time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    Donate Blood
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    Find Donor
                  </button>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Contact Info</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Email: info@bloodbridge.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Health Street, Medical City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BloodBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScroll && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg hover:scale-110 transition-all z-50 bg-red-500 hover:bg-red-600 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

export default BloodBridgeLanding
