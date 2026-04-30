import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../utils/apiClient'

function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState('')

  const locationLabel = useMemo(() => {
    if (!listing?.location) {
      return ''
    }

    return [listing.location.city, listing.location.country].filter(Boolean).join(', ')
  }, [listing])

  useEffect(() => {
    let isActive = true

    async function loadListing() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await apiFetch(`/api/listings/${id}`, { method: 'GET' }, { includeAuth: false })

        if (!response.ok) {
          throw new Error('Unable to load listing details right now.')
        }

        const data = await response.json()

        if (isActive) {
          setListing(data)
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message || 'Unable to load listing details right now.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadListing()

    return () => {
      isActive = false
    }
  }, [id])

  useEffect(() => {
    let isActive = true

    async function loadReviews() {
      setIsLoadingReviews(true)
      setReviewsError('')

      try {
        const response = await apiFetch(`/api/listings/${id}/reviews`, { method: 'GET' }, { includeAuth: false })

        if (!response.ok) {
          throw new Error('Unable to load reviews right now.')
        }

        const data = await response.json()

        if (isActive) {
          setReviews(data)
        }
      } catch (error) {
        if (isActive) {
          setReviewsError(error.message || 'Unable to load reviews right now.')
        }
      } finally {
        if (isActive) {
          setIsLoadingReviews(false)
        }
      }
    }

    loadReviews()

    return () => {
      isActive = false
    }
  }, [id])

  return (
    <main className="listing-detail-page">
      {isLoading ? (
        <section className="listing-detail-hero">
          <Link to="/browse" className="listing-detail-back">Back to browse</Link>
          <h1>Loading listing...</h1>
        </section>
      ) : errorMessage ? (
        <section className="listing-detail-hero">
          <Link to="/browse" className="listing-detail-back">Back to browse</Link>
          <h1>Listing details</h1>
          <p>{errorMessage}</p>
        </section>
      ) : (
        <section className="listing-detail-hero">
          <Link to="/browse" className="listing-detail-back">Back to browse</Link>
          <div className="listing-detail-media">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt={listing.title} />
            ) : (
              <div className="listing-detail-placeholder" aria-hidden="true" />
            )}
          </div>
          <div className="listing-detail-info">
            <h1>{listing.title}</h1>
            {locationLabel && <p className="listing-detail-location">{locationLabel}</p>}
            <p className="listing-detail-price">${listing.pricePerNight} per night</p>
            <p className="listing-detail-guests">Sleeps up to {listing.maxGuests} guests</p>
            <p className="listing-detail-description">{listing.description}</p>
            {listing.amenities?.length ? (
              <div className="listing-detail-amenities">
                <h2>Amenities</h2>
                <ul>
                  {listing.amenities.map((amenity) => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="listing-detail-reviews">
              <h2>Reviews</h2>
              {isLoadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviewsError ? (
                <p>{reviewsError}</p>
              ) : reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                <ul>
                  {reviews.map((review) => (
                    <li key={review._id} className="listing-review">
                      <div className="listing-review-header">
                        <p className="listing-review-name">{review.reviewerName || 'Guest'}</p>
                        <p className="listing-review-meta">
                          {review.rating ? `${review.rating.toFixed(1)} stars` : 'No rating'}
                          {review.date ? ` · ${new Date(review.date).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      {review.comments ? (
                        <p className="listing-review-comment">{review.comments}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default ListingDetailPage
