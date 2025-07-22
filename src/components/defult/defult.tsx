"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FaHeart } from 'react-icons/fa'
import SaveLifeImg from '../../../public/save-life.jpg'
import FindDonor from '../../../public/donateblood.jpg'
import TrackImpact from '../../../public/tqimg.jpg'
import { Button } from '../ui/button'

const Default = () => {
  const router = useRouter();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Hero Section */}
      <div className="h-screen flex items-center justify-center px-4 pb-20">
        <div className="text-center animate-fade-in w-full max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-black bg-gradient-to-r  bg-clip-text mb-4 drop-shadow-lg text-center">
            Save Lives Through <span className="text-primary">Blood</span> Donation
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in delay-100 text-center">
            Join our community of life-savers and make a difference today. Every donation counts and can save up to three lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center sm:items-stretch text-center">
            <Button
            variant={"secondary"}
              onClick={() => router.push('/register')}
            >
              <FaHeart className="text-primary animate-pulse" />
              Save Lives
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/emergency-blood')}
            >
              Emergency Blood
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 py-16 max-w-5xl w-full">
        <div className="space-y-24 mb-24">
          {/* Find Donors Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-black text-center md:text-left">Find Donors</h2>
              <p className="text-muted-foreground text-lg">
                Our advanced matching system helps you quickly locate compatible blood donors in your area. Whether you need a specific blood type or have an emergency situation, we connect you with verified donors who are ready to help.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Real-time donor availability tracking</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Advanced blood type matching system</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Emergency response coordination</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[250px] md:h-[350px] rounded-lg overflow-hidden">
              <Image
                src={FindDonor}
                alt="Find Donors"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Save Lives Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[200px] md:h-[300px] rounded-lg overflow-hidden">
              <Image
                src={SaveLifeImg}
                alt="Save Lives"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-3xl font-bold text-black text-left">Save Lives</h2>
              <p className="text-muted-foreground text-lg">
                Your blood donation can make an immediate impact on someone&apos;s life. Join our life-saving mission and become part of a community dedicated to helping others in their time of need.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>One donation can save up to three lives</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Regular donation opportunities</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Community impact tracking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Track Impact Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-black text-left">Track Impact</h2>
              <p className="text-muted-foreground text-lg">
                Monitor your donation history and see the real impact of your contributions. Our platform provides detailed insights into how your donations are making a difference in your community.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Personal donation dashboard</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Impact statistics and milestones</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>Community recognition program</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[200px] md:h-[300px] rounded-3xl overflow-hidden ">
              <Image
                src={TrackImpact}
                alt="Track Impact"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Importance of Blood Donation Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-black  text-center mb-12 animate-fade-in">Why Blood Donation Matters</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-black flex justify-center items-center">The Critical Need</h3>
              <p className="text-muted-foreground text-lg">
                Every two seconds, someone in the world needs blood. Blood transfusions are essential for:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>Emergency surgeries and trauma care</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>Emergency surgeries and trauma care</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>Cancer treatments and chemotherapy</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>Childbirth complications</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>Severe anemia and blood disorders</span>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-black items-center justify-center flex">Blood Requirements</h3>
              <div className="bg-gray-50 p-6 rounded-xl flex flex-col items-center justify-center">
                <h4 className="text-xl font-semibold text-black mb-4">Daily Blood Needs</h4>
                <ul className="space-y-4 ">
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold">36,000+</span>
                    <span className="text-muted-foreground">Units of red blood cells needed daily</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold">7,000+</span>
                    <span className="text-muted-foreground">Units of platelets needed daily</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold">10,000+</span>
                    <span className="text-muted-foreground">Units of plasma needed daily</span>
                  </li>
                </ul>
              </div>
              <p className="text-muted-foreground text-lg mt-4">
                A single car accident victim can require up to 100 units of blood. Your donation can save up to three lives and help maintain a stable blood supply for those in need.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Instructions Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-black mb-6 animate-fade-in">Post-Donation Care</h2>
            <p className="text-muted-foreground text-lg mb-8">
              After your blood donation, we&apos;ll provide you with detailed care instructions to help you recover quickly and safely. Our comprehensive guide includes nutrition tips, activity recommendations, and everything you need to know about post-donation care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-black mb-4">Immediate Care (First 24 Hours)</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Rest for 10-15 minutes after donation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Keep the bandage on for 4-6 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Drink extra fluids (water, juice)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Avoid heavy lifting or exercise</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-black mb-4">Nutrition Guide (2-3 Days)</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Iron-rich foods (red meat, spinach)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Vitamin C foods (citrus fruits)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Folic acid sources (beans, lentils)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Stay hydrated with water</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-black mb-4">Recovery Timeline</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">24 hours: Resume light activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">48 hours: Return to normal routine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">56 days: Eligible for next donation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Monitor for any unusual symptoms</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold text-black mb-4">Important Reminders</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-black mb-3">What to Avoid</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-muted-foreground">Strenuous exercise for 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-muted-foreground">Smoking for 3 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-muted-foreground">Alcohol for 24 hours</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-black mb-3">When to Seek Help</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-muted-foreground">Persistent dizziness or weakness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-muted-foreground">Bleeding from the donation site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-muted-foreground">Unusual pain or discomfort</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">BloodBridge</h3>
              <p className="text-muted-foreground">
                Connecting blood donors with those in need, making a difference one donation at a time.
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

    </div>
  )
}

export default Default