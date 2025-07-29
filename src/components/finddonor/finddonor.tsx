"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Copy, Search, Users, MapPin, Droplet,
  Check, Heart, Phone, MoreVertical, AlertTriangle,
  ThumbsUp, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import SimpleBloodLoader from '@/app/loading'  // Your loader component import

interface Donor {
  _id: string;
  userId?: string;
  name: string;
  phone: string;
  bloodType: string;
  city: string;
  state: string;
  country: string;
  isAvailable: boolean | null;
  gender?: string;
}

interface FindDonorPageProps {
  hideNavbarAndTitle?: boolean;
}

const FindDonorPage: React.FC<FindDonorPageProps> = ({ hideNavbarAndTitle }) => {
  const router = useRouter()
  const [filters, setFilters] = useState({
    bloodGroup: '',
    country: '',
    state: '',
    city: ''
  })

  const [searchResults, setSearchResults] = useState<Donor[]>([])
  const [countries, setCountries] = useState<ICountry[]>([])
  const [states, setStates] = useState<IState[]>([])
  const [cities, setCities] = useState<ICity[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  
  // Loading only controlled manually, NOT inside fetchDonors
  const [isLoading, setIsLoading] = useState(false)
  
  const [thanksModalOpen, setThanksModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)
  const [thanksMessage, setThanksMessage] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmittingThanks, setIsSubmittingThanks] = useState(false)
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const reportReasons = [
    'Contact information is wrong',
    'Responded to donate but did not donate',
    'Donor details are incorrect',
    'Inappropriate behavior',
    'Other'
  ]

  const resultsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  useEffect(() => {
    if (filters.country) {
      const countryStates = State.getStatesOfCountry(filters.country)
      setStates(countryStates)
      setFilters(prev => ({ ...prev, state: '', city: '' }))
    }
  }, [filters.country])

  useEffect(() => {
    if (filters.state && filters.country) {
      const stateCities = City.getCitiesOfState(filters.country, filters.state)
      setCities(stateCities)
      setFilters(prev => ({ ...prev, city: '' }))
    }
  }, [filters.state, filters.country])

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setHasSearched(false)
  }

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone)
    setCopySuccess(phone)
    setTimeout(() => setCopySuccess(null), 1200)
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // fetchDonors no longer manages loading state
  const fetchDonors = useCallback(async () => {
    let url = '/api/donors'
    const params = new URLSearchParams()
    if (filters.bloodGroup) params.append('bloodType', filters.bloodGroup)
    if (filters.country) params.append('country', filters.country)
    if (filters.state) params.append('state', filters.state)
    if (filters.city) params.append('city', filters.city)
    if ([...params].length > 0) url += `?${params.toString()}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      setSearchResults(data.donors || [])
    } catch (error) {
      console.error('Failed to fetch donors:', error)
    }
  }, [filters.bloodGroup, filters.country, filters.state, filters.city])


  // Remove this automatic fetching effect:
  // useEffect(() => { fetchDonors() }, [fetchDonors])  <-- REMOVED

  // Only fetch on search, control loading here
  const handleSearch = async () => {
    setIsLoading(true)
    try {
      await fetchDonors()
      setHasSearched(true)
      // Smooth scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (hideNavbarAndTitle) {
      router.push('/')
    } else {
      router.push('/home')
    }
  }

  const handleThanks = (donor: Donor) => {
    setSelectedDonor(donor)
    setThanksModalOpen(true)
  }

  const handleReport = (donor: Donor) => {
    setSelectedDonor(donor)
    setReportModalOpen(true)
  }

  const submitThanks = async () => {
    if (isSubmittingThanks) return
    setIsSubmittingThanks(true)
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const now = new Date()
      const response = await fetch('/api/thanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: selectedDonor?.userId || selectedDonor?._id,
          receiverName: selectedDonor?.name || '',
          message: thanksMessage,
          senderName: currentUser.name || 'Anonymous User',
          senderUserId: currentUser._id || currentUser.userId,
          timestamp: now.toISOString(),
          title: 'Vote of Thanks'
        })
      })
      const result = await response.json()
      if (response.ok) {
        setThanksModalOpen(false)
        setThanksMessage('')
        setSelectedDonor(null)
        showSuccessMessage('Vote of Thanks sent successfully! 🎉')
      } else {
        alert(result.error || 'Failed to send thank you message')
      }
    } catch (error) {
      console.error('Failed to send thanks:', error)
      alert('Failed to send thank you message')
    } finally {
      setIsSubmittingThanks(false)
    }
  }

  const submitReport = async () => {
    if (isSubmittingReport) return
    setIsSubmittingReport(true)
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const now = new Date()
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: selectedDonor?.userId || selectedDonor?._id,
          receiverName: selectedDonor?.name || '',
          reason: reportReason,
          details: reportDetails,
          reporterName: currentUser.name || 'Anonymous User',
          reporterUserId: currentUser._id || currentUser.userId,
          timestamp: now.toISOString(),
          title: reportReason
        })
      })
      const result = await response.json()
      if (response.ok) {
        setReportModalOpen(false)
        setReportReason('')
        setReportDetails('')
        setSelectedDonor(null)
        showSuccessMessage('Report sent successfully! ✅')
      } else {
        alert(result.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Failed to submit report:', error)
      alert('Failed to submit report')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const availableDonors = searchResults.filter(d => d.isAvailable === true)
  const unavailableDonors = searchResults.filter(d => d.isAvailable === false)

  const getLocationString = (donor: Donor): string => {
    const stateName = State.getStateByCodeAndCountry(donor.state, donor.country)?.name
    const countryName = Country.getCountryByCode(donor.country)?.name
    return `${donor.city}, ${stateName}, ${countryName}`
  }

  const DonorTable: React.FC<{ donors: Donor[], title: string, bgColor: string, textColor: string }> = ({
    donors, title, bgColor, textColor
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge className={`${bgColor} ${textColor} hover:opacity-80`}>
          {title}: {donors.length}
        </Badge>
      </div>
      {donors.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="font-semibold text-gray-900">Name</TableHead>
                <TableHead className="font-semibold text-gray-900">Gender</TableHead>
                <TableHead className="font-semibold text-gray-900">Phone</TableHead>
                <TableHead className="font-semibold text-gray-900">Blood Type</TableHead>
                <TableHead className="font-semibold text-gray-900">Location</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">Status</TableHead>
                <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donors.map((donor, index) => (
                <TableRow
                  key={donor._id}
                  className={`hover:bg-gray-50/50 transition-colors ${
                    donor.isAvailable ? 'bg-green-50/30' : 'bg-red-50/20 opacity-75'
                  } ${index % 2 === 0 ? 'bg-white/50' : ''}`}
                >
                  <TableCell className="font-semibold text-gray-900">{donor.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{donor.gender || 'N/A'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm font-medium">{donor.phone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(donor.phone)}
                        className="h-7 w-7 p-0 cursor-pointer hover:bg-blue-100"
                      >
                        {copySuccess === donor.phone ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-500" />
                        )}
                      </Button>
                      {copySuccess === donor.phone && <span className="text-green-600 text-xs font-bold">Copied!</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-red-300 text-red-800 font-bold bg-red-50/50">
                      <Droplet className="w-3 h-3 mr-1" />
                      {donor.bloodType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 break-words">{getLocationString(donor)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${donor.isAvailable ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-100 text-red-800'} font-bold`}>
                      {donor.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleThanks(donor)} className="cursor-pointer">
                          <ThumbsUp className="w-4 h-4 mr-2" /> Vote of Thanks
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReport(donor)} className="cursor-pointer text-red-600">
                          <AlertTriangle className="w-4 h-4 mr-2" /> Report Donor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      {/* Loading overlay */}
      {isLoading && <SimpleBloodLoader message="Searching donors..." />}

      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="fixed top-16 md:top-24 left-2 md:left-2 h-10 md:h-10 w-10 md:w-10 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer rounded-full transition-all duration-300 hover:scale-110 z-50"
        aria-label="Back to Home"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 animate-in slide-in-from-right">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl pt-5 pb-10">
        {!hideNavbarAndTitle && (
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Blood Donors</h1>
            <p className="text-lg text-muted-foreground">Connect with donors in your area and save lives</p>
          </div>
        )}

        {/* Filters Card */}
        <Card className="border-0 bg-white/95 backdrop-blur-sm mb-8">
          <CardHeader className="pb-6 ">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Search className="w-6 h-6 text-blue-500" />
              Search Filters
            </CardTitle>
            <CardDescription className='flex items-center justify-center text-sm text-muted-foreground'>
              Use the filters below to find blood donors in your area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col justify-center items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-x-20 justify-center items-center">
              {/* Blood Group*/}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-red-500" />
                  Blood Group
                </Label>
                <Select value={filters.bloodGroup} onValueChange={(value) => handleFilterChange('bloodGroup', value)}>
                  <SelectTrigger className="h-12  border-gray-200 min-w-50 focus:border-blue-500 cursor-pointer">
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map(group => (
                      <SelectItem key={group} value={group} className="cursor-pointer">{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Country
                </Label>
                <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                  <SelectTrigger className="h-12 border-gray-200 min-w-50 focus:border-blue-500 cursor-pointer">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map(country => (
                      <SelectItem key={country.isoCode} value={country.isoCode} className="cursor-pointer">{country.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">State</Label>
                <Select
                  value={filters.state}
                  onValueChange={(value) => handleFilterChange('state', value)}
                  disabled={!filters.country}
                >
                  <SelectTrigger className="h-12 border-gray-200 min-w-50 focus:border-blue-500 cursor-pointer">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {states.map(state => (
                      <SelectItem key={state.isoCode} value={state.isoCode} className="cursor-pointer">{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">City</Label>
                <Select
                  value={filters.city}
                  onValueChange={(value) => handleFilterChange('city', value)}
                  disabled={!filters.state}
                >
                  <SelectTrigger className="h-12 border-gray-200 min-w-50 focus:border-blue-500 cursor-pointer">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map(city => (
                      <SelectItem key={city.name} value={city.name} className="cursor-pointer">{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 h-12 font-semibold transition-all duration-300 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search Donors
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Donor Note */}
        <Card className="border-0 bg-amber-50/50 backdrop-blur-sm mb-8">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Report Donor Issues</h3>
                <p className="text-sm text-amber-700">
                  If you find any incorrect donor details, contact information issues, or donation-related problems,
                  please use the three-dot menu next to each donor to report the issue. Your reports help us maintain
                  accurate and reliable donor information for everyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div ref={resultsRef}>
          <Card className="border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-blue-500" /> Search Results
              </CardTitle>
              <CardDescription className='flex items-center justify-center text-sm text-muted-foreground'>
                {hasSearched ? `Found ${searchResults.length} donor${searchResults.length !== 1 ? 's' : ''} - Click to copy phone numbers`
                  : "Use the filters above and click search to find donors"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {!hasSearched ? (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Please use the filters above and click search to find donors.</p>
                  </CardContent>
                </Card>
              ) : searchResults.length > 0 ? (
                <div className="space-y-8">
                  {availableDonors.length > 0 && (
                    <DonorTable donors={availableDonors} title="🟢 Available Donors" bgColor="bg-green-100" textColor="text-green-800" />
                  )}
                  {availableDonors.length > 0 && unavailableDonors.length > 0 && <Separator className="my-8" />}
                  {unavailableDonors.length > 0 && (
                    <DonorTable donors={unavailableDonors} title="❌ Unavailable Donors" bgColor="bg-red-100" textColor="text-red-800" />
                  )}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No donors found matching your criteria.</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your filters and search again.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vote of Thanks Modal */}
      <Dialog open={thanksModalOpen} onOpenChange={setThanksModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-600" /> Send Vote of Thanks
            </DialogTitle>
            <DialogDescription>
              Send a thank you message to {selectedDonor?.name} for their willingness to donate blood.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thanks-message">Your Message</Label>
              <Textarea
                id="thanks-message"
                placeholder="Write your thank you message here..."
                value={thanksMessage}
                onChange={(e) => setThanksMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setThanksModalOpen(false)} className="cursor-pointer" disabled={isSubmittingThanks}>
                Cancel
              </Button>
              <Button onClick={submitThanks} disabled={isSubmittingThanks || !thanksMessage.trim()} className="bg-green-600 hover:bg-green-700 cursor-pointer">
                {isSubmittingThanks ? (
                  <span className="flex items-center gap-2">
                    Sending...
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></span>
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Thanks
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Donor Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Report Donor Issue
            </DialogTitle>
            <DialogDescription>
              Report an issue with {selectedDonor?.name}'s information or behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Reason for reporting</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason}>
                {reportReasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason} id={reason} className="cursor-pointer" />
                    <Label htmlFor={reason} className="text-sm cursor-pointer">{reason}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-details">Additional Details (Optional)</Label>
              <Textarea
                id="report-details"
                placeholder="Provide additional details about the issue..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReportModalOpen(false)} className="cursor-pointer" disabled={isSubmittingReport}>
                Cancel
              </Button>
              <Button onClick={submitReport} disabled={isSubmittingReport || !reportReason} className="bg-red-600 hover:bg-red-700 cursor-pointer">
                {isSubmittingReport ? (
                  <span className="flex items-center gap-2">
                    Submitting...
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></span>
                  </span>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FindDonorPage
