import { useMemo, useState } from 'react'

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

  return (
    <main className="browse-page">
      <section className="browse-hero" aria-labelledby="browse-title">
        <div className="browse-hero-inner">
          <p className="browse-eyebrow">Find your next stay</p>
          <h1 id="browse-title" className="browse-title">Browse listings built around your trip.</h1>
          <p className="browse-subtitle">
            Search the full catalog, then set the results with flexible filters.
          </p>
        </div>
      </section>

      <section className="browse-grid" aria-label="Search and filters">
        <form className="browse-card browse-search" onSubmit={handleSubmit}>
          <div className="browse-card-header">
            <h2>Search</h2>
            <p>Start with a location, dates, and a quick keyword.</p>
          </div>
          <div className="browse-form">
            <label className="browse-field">
              <span>Keyword</span>
              <input
                className="browse-input"
                type="text"
                placeholder="Lake house, cabin, skyline..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="browse-field">
              <span>Location</span>
              <input
                className="browse-input"
                type="text"
                placeholder="Montreal, QC"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </label>
            <label className="browse-field">
              <span>Check-in</span>
              <input
                className="browse-input"
                type="date"
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </label>
            <label className="browse-field">
              <span>Check-out</span>
              <input
                className="browse-input"
                type="date"
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </label>
            <label className="browse-field">
              <span>Guests</span>
              <input
                className="browse-input"
                type="number"
                min="1"
                max="16"
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
              />
            </label>
            <button type="submit" className="browse-submit">
              Search listings
            </button>
          </div>
        </form>

        <div className="browse-card browse-filters">
          <div className="browse-card-header">
            <h2>Filters</h2>
            <p>Dial in the vibe with price, rating, and amenities.</p>
          </div>
          <div className="browse-form">
            <label className="browse-field">
              <span>Price range</span>
              <div className="browse-range">
                <input
                  className="browse-input"
                  type="number"
                  min="20"
                  max="500"
                  value={priceMin}
                  onChange={(event) => setPriceMin(Number(event.target.value))}
                />
                <span className="browse-range-sep">to</span>
                <input
                  className="browse-input"
                  type="number"
                  min="20"
                  max="500"
                  value={priceMax}
                  onChange={(event) => setPriceMax(Number(event.target.value))}
                />
              </div>
            </label>
            <label className="browse-field">
              <span>Minimum rating</span>
              <select
                className="browse-input"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
              >
                <option value="4.8">4.8+</option>
                <option value="4.5">4.5+</option>
                <option value="4.2">4.2+</option>
                <option value="4.0">4.0+</option>
              </select>
            </label>
            <label className="browse-field">
              <span>Room type</span>
              <select
                className="browse-input"
                value={selectedRoomType}
                onChange={(event) => setSelectedRoomType(event.target.value)}
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <fieldset className="browse-field browse-amenities">
              <legend>Amenities</legend>
              {amenities.map((amenity) => (
                <label key={amenity} className="browse-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.has(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </fieldset>
          </div>
        </div>
      </section>

      <section className="browse-results" aria-live="polite">
        <div className="browse-results-header">
          <div>
            <h2>Preview results</h2>
            <p>Ready when you are. Hook this up to listings data next.</p>
          </div>
          <div className="browse-chips" aria-label="Active filters">
            {activeFilters.slice(0, 6).map((filter) => (
              <span key={filter} className="browse-chip">{filter}</span>
            ))}
          </div>
        </div>
        <div className="browse-cards">
          {[1, 2, 3].map((item) => (
            <article key={item} className="browse-result-card">
              <div className="browse-result-media" aria-hidden="true" />
              <div className="browse-result-body">
                <p className="browse-result-tag">Featured stay</p>
                <h3>Loft retreat with skyline view</h3>
                <p>2 beds · 1 bath · Superhost · $182/night</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default BrowsePage
