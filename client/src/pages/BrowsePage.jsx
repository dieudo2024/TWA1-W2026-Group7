import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BrowseFilters from '../components/BrowseFilters'
import BrowseHero from '../components/BrowseHero'
import BrowseResults from '../components/BrowseResults'
import BrowseSearchForm from '../components/BrowseSearchForm'
import LogoutButton from '../components/LogoutButton'
import { apiFetch } from '../utils/apiClient'

const amenities = ['Wi-Fi', 'Kitchen', 'Washer', 'Dedicated workspace', 'Free parking']
const PAGE_SIZE = 10

function BrowsePage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [priceMin, setPriceMin] = useState(60)
  const [priceMax, setPriceMax] = useState(260)
  const [rating, setRating] = useState('4.5')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState(new Set(['Wi-Fi', 'Kitchen']))
  const [roomTypes, setRoomTypes] = useState([])
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

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
    setPage(1)
  }, [location, priceMin, priceMax, selectedRoomType, guests])

  useEffect(() => {
    let isActive = true

    async function loadRoomTypes() {
      try {
        const response = await apiFetch('/api/listings/room-types', { method: 'GET' }, { includeAuth: false })

        if (!response.ok) {
          throw new Error('Unable to load room types.')
        }

        const types = await response.json()
        if (isActive) {
          setRoomTypes(Array.isArray(types) ? types : [])
        }
      } catch {
        if (isActive) {
          setRoomTypes([])
        }
      }
    }

    loadRoomTypes()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadListings() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const params = new URLSearchParams()

        if (location) {
          params.set('city', location)
        }

        if (priceMin) {
          params.set('minPrice', String(priceMin))
        }

        if (priceMax) {
          params.set('maxPrice', String(priceMax))
        }

        if (selectedRoomType) {
          params.set('type', selectedRoomType)
        }

        if (guests) {
          params.set('guests', String(guests))
        }

        params.set('page', String(page))

        const queryString = params.toString()
        const response = await apiFetch(`/api/listings${queryString ? `?${queryString}` : ''}`, { method: 'GET' }, { includeAuth: false })

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
        }).filter((item) => Boolean(item.id))

        setResults(nextResults)
        setHasNextPage(Array.isArray(listings) && listings.length === PAGE_SIZE)
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
  }, [location, priceMin, priceMax, selectedRoomType, guests, page])

  return (
    <main className="browse-page">
      <nav className="browse-tabs" aria-label="Browse navigation">
        <div className="browse-tabs-inner">
          <Link to="/browse" className="browse-tab-link" aria-current="page">
            Browse listings
          </Link>
          <LogoutButton />
        </div>
      </nav>
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
      <div className="browse-pagination">
        <button
          type="button"
          className="browse-page-button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </button>
        <span className="browse-page-status">Page {page}</span>
        <button
          type="button"
          className="browse-page-button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!hasNextPage || isLoading}
        >
          Next
        </button>
      </div>
    </main>
  )
}

export default BrowsePage
