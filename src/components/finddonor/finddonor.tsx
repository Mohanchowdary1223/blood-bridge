"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaCopy } from 'react-icons/fa'

interface Donor {
  _id: string;
  name: string;
  phone: string;
  bloodType: string;
  city: string;
  state: string;
  country: string;
  isAvailable: boolean | null;
}

interface FindDonorPageProps {
  hideNavbarAndTitle?: boolean;
}

const FindDonorPage = ({ hideNavbarAndTitle }: FindDonorPageProps) => {
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
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

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

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopySuccess(phone);
    setTimeout(() => setCopySuccess(null), 1200);
  };

  const fetchDonors = useCallback(async () => {
    let url = '/api/donors';
    const params = new URLSearchParams();
    if (filters.bloodGroup) params.append('bloodType', filters.bloodGroup);
    if (filters.country) params.append('country', filters.country);
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);
    if ([...params].length > 0) url += `?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    setSearchResults(data.donors || []);
  }, [filters.bloodGroup, filters.country, filters.state, filters.city]);

  // Fetch all donors on mount
  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const handleSearch = async () => {
    await fetchDonors();
    setHasSearched(true);
  }

  const handleBack = () => {
    if (hideNavbarAndTitle) {
      router.push('/')
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen mb-10 bg-gradient-to-b from-gray-50 to-white pt-10 flex flex-col items-center justify-center">
      {/* Fixed Back Button */}
      <button
        onClick={handleBack}
        className="fixed left-1 md:left-4 top-18 md:top-28 md:transform md:-translate-y-1/2 bg-white p-3 cursor-pointer rounded-full shadow-lg hover:bg-gray-50 transition-colors z-50"
        aria-label="Back"
      >
        <FaArrowLeft className="text-gray-600 text-xl" />
      </button>
      <div className="container mx-auto px-4 max-w-4xl">
        {!hideNavbarAndTitle && (
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">Find Blood Donors</h1>
        )}
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Group Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={filters.bloodGroup}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary cursor-pointer"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary cursor-pointer"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary cursor-pointer"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary cursor-pointer"
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
                className="bg-primary cursor-pointer text-white px-8 py-3 rounded-full hover:bg-primary/80 transition-all duration-200 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  (() => {
                    const available = searchResults.filter(d => d.isAvailable === true);
                    const unavailable = searchResults.filter(d => d.isAvailable === false);
                    return <>
                      <div className="mb-2 text-green-700 font-semibold">Available Donors: {available.length}</div>
                      {available.map(donor => (
                        <div key={donor._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{donor.name}</h3>
                              <div className="flex items-center gap-2">
                                <p className="text-gray-600 mb-0">Phone: {donor.phone}</p>
                                <button
                                  className="ml-2 text-primary hover:text-primary/80 focus:outline-none cursor-pointer"
                                  title="Copy phone number"
                                  onClick={() => handleCopy(donor.phone)}
                                >
                                  <FaCopy /> 
                                </button>
                                {copySuccess === donor.phone && (
                                  <span className="ml-1 text-green-600 text-xs">Copied!</span>
                                )}
                              </div>
                              <p className="text-gray-600">Blood Group: {donor.bloodType}</p>
                              <p className="text-gray-600">
                                {donor.city}, {State.getStateByCodeAndCountry(donor.state, donor.country)?.name}, {Country.getCountryByCode(donor.country)?.name}
                              </p>
                            </div>
                            <div>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {unavailable.length > 0 && (
                        <>
                          <div className="mt-6 mb-2 text-red-700 font-semibold">Unavailable Donors: {unavailable.length}</div>
                          {unavailable.map(donor => (
                            <div key={donor._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow opacity-70">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800">{donor.name}</h3>
                                  <div className="flex items-center gap-2">
                                    <p className="text-gray-600 mb-0">Phone: {donor.phone}</p>
                                    <button
                                      className="ml-2 cursor-pointer text-primary hover:text-primary/80 focus:outline-none"
                                      title="Copy phone number"
                                      onClick={() => handleCopy(donor.phone)}
                                    >
                                      <FaCopy />
                                    </button>
                                    {copySuccess === donor.phone && (
                                      <span className="ml-1 text-green-600 text-xs">Copied!</span>
                                    )}
                                  </div>
                                  <p className="text-gray-600">Blood Group: {donor.bloodType}</p>
                                  <p className="text-gray-600">
                                    {donor.city}, {State.getStateByCodeAndCountry(donor.state, donor.country)?.name}, {Country.getCountryByCode(donor.country)?.name}
                                  </p>
                                </div>
                                <div>
                                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Unavailable
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </>;
                  })()
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
  )
} 

export default FindDonorPage
