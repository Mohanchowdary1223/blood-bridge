"use client"
import React, { useState, useEffect } from 'react'
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city'
import { useRouter } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa'

interface Donor {
  id: number;
  name: string;
  phoneNumber: string;
  bloodGroup: string;
  city: string;
  state: string;
  country: string;
  isAvailable: boolean;
}

// Dummy data for donors
const dummyDonors: Donor[] = [
  {
    id: 1,
    name: "Ravi Kumar",
    phoneNumber: "+91 98765 43210",
    bloodGroup: "A+",
    city: "Kakinada",
    state: "AP",
    country: "IN",
    isAvailable: true
  },
  {
    id: 2,
    name: "Priya Sharma",
    phoneNumber: "+91 87654 32109",
    bloodGroup: "O+",
    city: "Rajahmundry",
    state: "AP",
    country: "IN",
    isAvailable: true
  },
  {
    id: 3,
    name: "Suresh Reddy",
    phoneNumber: "+91 76543 21098",
    bloodGroup: "B+",
    city: "East Godavari",
    state: "AP",
    country: "IN",
    isAvailable: false
  },
  {
    id: 4,
    name: "Lakshmi Devi",
    phoneNumber: "+91 65432 10987",
    bloodGroup: "AB+",
    city: "East Godavari",
    state: "AP",
    country: "IN",
    isAvailable: true
  },
  {
    id: 5,
    name: "Krishna Prasad",
    phoneNumber: "+91 54321 09876",
    bloodGroup: "A-",
    city: "Kakinada",
    state: "AP",
    country: "IN",
    isAvailable: false
  },
  {
    id: 6,
    name: "Prasad",
    phoneNumber: "+91 54321 09876",
    bloodGroup: "A-",
    city: "Kakinada",
    state: "AP",
    country: "IN",
    isAvailable: false
  },
  {
    id: 7,
    name: "Krishna",
    phoneNumber: "+91 54321 09876",
    bloodGroup: "A-",
    city: "Kakinada",
    state: "AP",
    country: "IN",
    isAvailable: true
  }
]

const FindDonorPage = () => {
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

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setHasSearched(false)
  }

  const handleSearch = () => {
    // Get registered donors from localStorage
    const registeredDonor = localStorage.getItem('donor')
    const allDonors = [...dummyDonors]
    
    if (registeredDonor) {
      const donor = JSON.parse(registeredDonor)
      allDonors.push({
        id: donor.id,
        name: donor.fullName,
        phoneNumber: donor.phone,
        bloodGroup: donor.bloodType,
        city: donor.city,
        state: donor.state,
        country: donor.country,
        isAvailable: true
      })
    }

    // Filter the donors based on selected filters
    let filteredResults = allDonors

    if (filters.bloodGroup) {
      filteredResults = filteredResults.filter(donor => donor.bloodGroup === filters.bloodGroup)
    }
    if (filters.country) {
      filteredResults = filteredResults.filter(donor => donor.country === filters.country)
    }
    if (filters.state) {
      filteredResults = filteredResults.filter(donor => donor.state === filters.state)
    }
    if (filters.city) {
      filteredResults = filteredResults.filter(donor => donor.city === filters.city)
    }

    // Sort results: available donors first, then unavailable
    filteredResults.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1
      if (!a.isAvailable && b.isAvailable) return 1
      return 0
    })

    setSearchResults(filteredResults)
    setHasSearched(true)
  }

  const handleBack = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b bg-white pt-10">
      {/* Fixed Back Button */}
      <button
        onClick={handleBack}
        className="fixed left-4 transform -translate-y-1/2 bg-white p-3 cursor-pointer rounded-full shadow-lg hover:bg-gray-50 transition-colors z-50"
        aria-label="Back to home"
      >
        <FaArrowLeft className="text-gray-600 text-xl" />
      </button>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">Find Blood Donors</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Group Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={filters.bloodGroup}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <select
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">State</label>
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleSearch}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/80 transition-colors"
              >
                Search Donors
              </button>
            </div>

            {/* Results Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Results</h2>
              <div className="space-y-4">
                {!hasSearched ? (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-gray-600">Please use the filters above and click search to find donors.</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(donor => (
                    <div key={donor.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{donor.name}</h3>
                          <p className="text-gray-600">Phone: {donor.phoneNumber}</p>
                          <p className="text-gray-600">Blood Group: {donor.bloodGroup}</p>
                          <p className="text-gray-600">
                            {donor.city}, {State.getStateByCodeAndCountry(donor.state, donor.country)?.name}, {Country.getCountryByCode(donor.country)?.name}
                          </p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            donor.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {donor.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-gray-600">No results found. Please try different filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FindDonorPage
