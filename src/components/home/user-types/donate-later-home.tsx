"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search, Heart, Share2, Droplets, ArrowRight, ArrowLeft, User,
  Copy, Instagram, Mail, Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { FaWhatsapp } from 'react-icons/fa'

export default function DonateLaterHome() {
  const [userName, setUserName] = useState('User')
  const [bloodGroup, setBloodGroup] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  /* ------------------------- Load user details ------------------------- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          if (userData?.name) setUserName(userData.name)
          if (userData?.bloodType) setBloodGroup(userData.bloodType)
        } catch {}
      }
    }
  }, [])

  /* --------------------------- Navigation ------------------------------ */
  const handleSearchClick = () => router.push('/finddonor')

  /* ------------------------- Share utilities --------------------------- */
  const shareData = {
    title: 'BloodBridge - Save Lives Through Blood Donation',
    text:
      "Join BloodBridge and help save lives! Every donation can save up to 3 lives. Be a hero in someone's story. You can also find donors near you when needed.",
    url: typeof window !== 'undefined' ? window.location.href : ''
  }

  /* Copy link (keeps dropdown open) */
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url)
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 3_000)
        return
      }
      /* Fallback */
      const ta = document.createElement('textarea')
      ta.value = shareData.url
      ta.style.position = 'fixed'
      ta.style.left = '-99999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 3_000)
    } catch {
      prompt('Copy this link:', shareData.url)
    }
  }

  const handleWhatsAppShare = () => {
    const msg = `${shareData.text}\n\n🔍 Find donors instantly\n❤️ Save up to 3 lives per donation\n🌟 Join our life-saving community\n\n${shareData.url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleInstagramShare = () => {
    window.open('https://www.instagram.com/', '_blank')
    handleCopyLink()
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareData.title)
    const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  /* -------------------- Blood compatibility helpers -------------------- */
  type BloodType = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'
  type CompatibilityInfo = {
    canDonateTo: string[]
    canReceiveFrom: string[]
    donorType: string
    receiverType: string
  }

  const compatibilityMap: Record<BloodType, CompatibilityInfo> = {
    'O-': {
      canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      canReceiveFrom: ['O-'],
      donorType: 'Universal Donor',
      receiverType: 'Limited Receiver'
    },
    'O+': {
      canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
      canReceiveFrom: ['O-', 'O+'],
      donorType: 'Common Donor',
      receiverType: 'Limited Receiver'
    },
    'A-': {
      canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
      canReceiveFrom: ['O-', 'A-'],
      donorType: 'Selective Donor',
      receiverType: 'Limited Receiver'
    },
    'A+': {
      canDonateTo: ['A+', 'AB+'],
      canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
      donorType: 'Selective Donor',
      receiverType: 'Common Receiver'
    },
    'B-': {
      canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
      canReceiveFrom: ['O-', 'B-'],
      donorType: 'Selective Donor',
      receiverType: 'Limited Receiver'
    },
    'B+': {
      canDonateTo: ['B+', 'AB+'],
      canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
      donorType: 'Selective Donor',
      receiverType: 'Common Receiver'
    },
    'AB-': {
      canDonateTo: ['AB-', 'AB+'],
      canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
      donorType: 'Rare Donor',
      receiverType: 'Selective Receiver'
    },
    'AB+': {
      canDonateTo: ['AB+'],
      canReceiveFrom: [
        'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'
      ],
      donorType: 'Rare Donor',
      receiverType: 'Universal Receiver'
    }
  }

  const getBloodCompatibility = (type: string) =>
    compatibilityMap[type as BloodType] ?? null

  const compatibility =
    bloodGroup && !['unknown', "I don't know my blood type"].includes(bloodGroup)
      ? getBloodCompatibility(bloodGroup)
      : null

  /* ------------------------------- UI ---------------------------------- */
  const isUnknown =
    !bloodGroup || ['unknown', "I don't know my blood type"].includes(bloodGroup)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* ---------- hero ---------- */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              Hello
            </span>{' '}
            <span className="text-foreground">
              {userName.charAt(0).toUpperCase() + userName.slice(1)},
            </span>
          </h2>
          <Badge className="bg-red-50 text-red-600 border-red-200 px-4 py-2 mb-4">
            <Droplets className="w-4 h-4 mr-2" />
            BloodBridge Community
          </Badge>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take your time! You can find donors now, register to donate when
            you're ready, or invite friends to join.
          </p>
        </div>

        {/* ---------- main actions ---------- */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Find donors */}
            <Card className="group border-0 hover:-translate-y-2 transition-all">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Find Donors</CardTitle>
                <CardDescription>
                  Search for blood donors in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSearchClick}
                  className="w-full bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
                >
                  Find Donor
                </Button>
              </CardContent>
            </Card>

            {/* Register to donate */}
            <Card className="group border-0 hover:-translate-y-2 transition-all">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Donate Blood</CardTitle>
                <CardDescription>
                  Register to donate blood when you're ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/donorform')}
                  className="w-full bg-red-500 cursor-pointer hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
                >
                  Register to Donate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ---------- compatibility ---------- */}
        <div className="mb-12">
          {isUnknown ? (
            /* ask to update profile */
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 max-w-2xl mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Update Your Profile</CardTitle>
                <CardDescription>
                  Add your blood type to see compatibility information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/profile')}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* show compatibility */
            <>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">
                  Your Blood Type: {bloodGroup}
                </h3>
                <div className="flex justify-center gap-4">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                    {compatibility?.donorType}
                  </Badge>
                  <Badge className="bg-green-50 text-green-600 border-green-200">
                    {compatibility?.receiverType}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* donate to */}
                <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>You Can Donate To</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {compatibility?.canDonateTo.map(type => (
                        <Badge
                          key={type}
                          className="bg-red-100 text-red-700 border-red-200 px-3 py-1"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* receive from */}
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ArrowLeft className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>You Can Receive From</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {compatibility?.canReceiveFrom.map(type => (
                        <Badge
                          key={type}
                          className="bg-green-100 text-green-700 border-green-200 px-3 py-1"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* ---------- share section ---------- */}
        <div className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center flex-col gap-6">
                  <div className="w-16 h-16 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold">Help Us Save More Lives</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Share BloodBridge with your friends and family. Together,
                      we can build a stronger community of life-savers.
                    </p>
                  </div>
                </div>

                {/* dropdown trigger */}
                <DropdownMenu
                  open={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-gradient-to-r cursor-pointer from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-3">
                      <Share2 className="w-5 h-5" />
                      Share BloodBridge
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-auto p-2">
                    {/* row of icons */}
                    <div className="flex gap-2">
                      <DropdownMenuItem
                        onClick={handleWhatsAppShare}
                        className="p-3 hover:bg-gray-100 rounded flex items-center justify-center"
                        aria-label="WhatsApp"
                      >
                        <FaWhatsapp className="w-5 h-5 text-green-600" />
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={handleInstagramShare}
                        className="p-3 hover:bg-gray-100 rounded flex items-center justify-center"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={handleEmailShare}
                        className="p-3 hover:bg-gray-100 rounded flex items-center justify-center"
                        aria-label="Email"
                      >
                        <Mail className="w-5 h-5 text-blue-600" />
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onSelect={e => {
                        e.preventDefault()
                        handleCopyLink()
                      }}
                      className="p-3 hover:bg-gray-100 rounded flex items-center gap-2 justify-center"
                    >
                      {copyStatus === 'copied' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                      <span>
                        {copyStatus === 'copied' ? 'Copied!' : 'Copy Link'}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---------- footer ---------- */}
      <footer className="bg-muted mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">BloodBridge</h3>
              </div>
              <p className="text-muted-foreground">
                Connecting blood donors with those in need, making a difference
                one donation at a time.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground">
                    <a
                      href="https://mohansunkara.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      About
                    </a>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    onClick={() => router.push('/donorform')}
                    className="p-0 h-auto text-muted-foreground cursor-pointer"
                  >
                    Donate Blood
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    onClick={() => router.push('/finddonor')}
                    className="p-0 h-auto text-muted-foreground cursor-pointer"
                  >
                    Find Donor
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    onClick={() => router.push('/profile')}
                    className="p-0 h-auto text-muted-foreground cursor-pointer"
                  >
                    Profile
                  </Button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Contact Info</h3>
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
                  Linkedin:{' '}
                  <a
                    href="https://www.linkedin.com/in/mohan-chowdary-963"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Mohan Sunkara
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} BloodBridge. All rights
              reserved. Made with ❤️ for humanity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
