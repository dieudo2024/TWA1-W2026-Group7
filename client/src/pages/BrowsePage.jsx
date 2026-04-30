import { useEffect, useMemo, useState } from 'react'
import BrowseFilters from '../components/BrowseFilters'
import BrowseHero from '../components/BrowseHero'
import BrowseResults from '../components/BrowseResults'
import BrowseSearchForm from '../components/BrowseSearchForm'
import { apiFetch } from '../utils/apiClient'

const roomTypes = ['Entire place', 'Private room', 'Shared room', 'Hotel room']
const amenities = ['Wi-Fi', 'Kitchen', 'Washer', 'Dedicated workspace', 'Free parking']

function BrowsePage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [priceMin, setPriceMin] = useState(60)
  const [priceMax, setPriceMax] = useState(260)
  const [rating, setRating] = useState('4.5')
  const [selectedRoomType, setSelectedRoomType] = useState('Entire place')
  const [selectedAmenities, setSelectedAmenities] = useState(new Set(['Wi-Fi', 'Kitchen']))
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const activeFilters = useMemo(() => {
    const amenitiesLabel = Array.from(selectedAmenities).join(', ')

    return [
      location && `Location: ${location}`,
      checkIn && checkOut && `${checkIn} to ${checkOut}`,
      guests && `${guests} guests`,
      `Price: $${priceMin}-$${priceMax}`,
      rating && `Rating ${rating}+`,
      selectedRoomType && selectedRoomType,
      amenitiesLabel && amenitiesLabel,
    ].filter(Boolean)
  }, [
    location,
    checkIn,
    checkOut,
    guests,
    priceMin,
    priceMax,
    rating,
    selectedRoomType,
    selectedAmenities,
  ])

  const toggleAmenity = (name) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  useEffect(() => {
    let isActive = true

    async function loadListings() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await apiFetch('/api/listings', { method: 'GET' }, { includeAuth: false })

        if (!response.ok) {
          throw new Error('Unable to load listings right now.')
        }

        const listings = await response.json()

        if (!isActive) {
          return
        }

        const nextResults = listings.map((listing) => {
          const locationParts = [listing.location?.city, listing.location?.country].filter(Boolean)
          const priceLabel = typeof listing.pricePerNight === 'number'
            ? `$${listing.pricePerNight}/night`
            : 'Price on request'

          return {
            id: listing._id,
            title: listing.title,
            location: locationParts.join(', ') || 'Location unavailable',
            price: priceLabel,
            imageUrl: listing.images?.[0] || '',
            tag: listing.averageRating ? `${listing.averageRating.toFixed(1)} rating` : 'New listing',
          }
        })

        setResults(nextResults)
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message || 'Unable to load listings right now.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadListings()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <main className="browse-page">
      <BrowseHero />

      <section className="browse-grid" aria-label="Search and filters">
        <BrowseSearchForm
          query={query}
          location={location}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onQueryChange={(event) => setQuery(event.target.value)}
          onLocationChange={(event) => setLocation(event.target.value)}
          onCheckInChange={(event) => setCheckIn(event.target.value)}
          onCheckOutChange={(event) => setCheckOut(event.target.value)}
          onGuestsChange={(event) => setGuests(Number(event.target.value))}
          onSubmit={handleSubmit}
        />
        <BrowseFilters
          priceMin={priceMin}
          priceMax={priceMax}
          rating={rating}
          selectedRoomType={selectedRoomType}
          selectedAmenities={selectedAmenities}
          roomTypes={roomTypes}
          amenities={amenities}
          onPriceMinChange={(event) => setPriceMin(Number(event.target.value))}
          onPriceMaxChange={(event) => setPriceMax(Number(event.target.value))}
          onRatingChange={(event) => setRating(event.target.value)}
          onRoomTypeChange={(event) => setSelectedRoomType(event.target.value)}
          onAmenityToggle={toggleAmenity}
        />
      </section>
      <BrowseResults
        activeFilters={activeFilters}
        results={results}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </main>
  )
}

export default BrowsePage
