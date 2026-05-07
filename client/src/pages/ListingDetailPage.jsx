import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../utils/apiClient";
import { getStoredUser } from "../utils/authStorage";

function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [reviewPhotoPreview, setReviewPhotoPreview] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const user = getStoredUser();
  const currentUserId = user?.id;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const locationLabel = useMemo(() => {
    if (!listing?.location) {
      return ''
    }

    return [listing.location.city, listing.location.country]
      .filter(Boolean)
      .join(", ");
  }, [listing]);

  useEffect(() => {
    let isActive = true;

    async function loadListing() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await apiFetch(
          `/api/listings/${id}`,
          { method: "GET" },
          { includeAuth: false },
        );

        if (!response.ok) {
          throw new Error("Unable to load listing details right now.");
        }

        const data = await response.json();

        if (isActive) {
          setListing(data);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error.message || "Unable to load listing details right now.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadListing();

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    let isActive = true;

    async function loadReviews() {
      setIsLoadingReviews(true);
      setReviewsError("");

      try {
        const response = await apiFetch(
          `/api/listings/${id}/reviews`,
          { method: "GET" },
          { includeAuth: false },
        );

        if (!response.ok) {
          throw new Error("Unable to load reviews right now.");
        }

        const data = await response.json();

        if (isActive) {
          setReviews(data);
        }
      } catch (error) {
        if (isActive) {
          setReviewsError(error.message || "Unable to load reviews right now.");
        }
      } finally {
        if (isActive) {
          setIsLoadingReviews(false);
        }
      }
    }

    loadReviews();

    return () => {
      isActive = false;
    };
  }, [id]);

  const userReview = useMemo(() => {
    if (!currentUserId) {
      return null;
    }
    return reviews.find((review) => review.author === currentUserId) || null;
  }, [reviews, currentUserId]);

  useEffect(() => {
    if (userReview) {
      setReviewRating(userReview.rating ?? 5);
      setReviewComments(userReview.comments ?? "");
      setReviewPhoto(null);
      setReviewPhotoPreview("");
    } else {
      setReviewRating(5);
      setReviewComments("");
      setReviewPhoto(null);
      setReviewPhotoPreview("");
    }
  }, [userReview]);

  useEffect(() => {
    if (!reviewPhoto) {
      setReviewPhotoPreview("");
      return undefined;
    }

    const nextPreview = URL.createObjectURL(reviewPhoto);
    setReviewPhotoPreview(nextPreview);

    return () => {
      URL.revokeObjectURL(nextPreview);
    };
  }, [reviewPhoto]);

  const reloadReviews = async () => {
    setIsLoadingReviews(true);
    setReviewsError("");

    try {
      const response = await apiFetch(
        `/api/listings/${id}/reviews`,
        { method: "GET" },
        { includeAuth: false },
      );

      if (!response.ok) {
        throw new Error("Unable to load reviews right now.");
      }

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      setReviewsError(error.message || "Unable to load reviews right now.");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    const trimmedComments = reviewComments.trim();
    if (!trimmedComments) {
      setReviewError("Please enter your review.");
      return;
    }

    setReviewSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("rating", String(reviewRating));
      formData.set("comments", trimmedComments);
      if (reviewPhoto) {
        formData.set("photo", reviewPhoto);
      }

      let response;
      if (userReview?._id) {
        response = await apiFetch(`/api/reviews/${userReview._id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        formData.set("listingId", id);
        response = await apiFetch("/api/reviews", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to save your review.");
      }

      await reloadReviews();
      setReviewPhoto(null);
      setReviewPhotoPreview("");
      setReviewSuccess(userReview ? "Review updated." : "Review posted.");
    } catch (error) {
      setReviewError(error.message || "Unable to save your review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const resolvePhotoUrl = (photoPath) => {
    if (!photoPath) {
      return "";
    }
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }
    return `${apiBase}${photoPath}`;
  };

  const handleReviewDelete = async (reviewId) => {
    setReviewError("");
    setReviewSuccess("");
    setReviewSubmitting(true);

    try {
      const response = await apiFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to delete the review.");
      }

      await reloadReviews();
      setReviewSuccess("Review deleted.");
    } catch (error) {
      setReviewError(error.message || "Unable to delete the review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main className="listing-detail-page">
      {isLoading ? (
        <section className="listing-detail-hero">
          <Link to="/browse" className="listing-detail-back">
            Back to browse
          </Link>
          <h1>Loading listing...</h1>
        </section>
      ) : errorMessage ? (
        <section className="listing-detail-hero">
          <Link to="/browse" className="listing-detail-back">
            Back to browse
          </Link>
          <h1>Listing details</h1>
          <p>{errorMessage}</p>
        </section>
      ) : (
        <section className="listing-detail-hero">
          <Link to="/browse" className="listing-detail-back">
            Back to browse
          </Link>
          <div className="listing-detail-media">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt={listing.title} />
            ) : (
              <div className="listing-detail-placeholder" aria-hidden="true" />
            )}
          </div>
          <div className="listing-detail-info">
            <h1>{listing.title}</h1>
            {locationLabel && (
              <p className="listing-detail-location">{locationLabel}</p>
            )}

            {listing.host ? (
              <div className="listing-detail-host">
                {listing.hostAvatarUrl ? (
                  <img
                    src={listing.hostAvatarUrl}
                    alt={listing.hostName || "Host"}
                  />
                ) : (
                  <div
                    className="listing-detail-host-avatar"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="listing-detail-host-name">
                    {/* If hostName is empty, show "Host" */}
                    Hosted by {listing.hostName || "Host"}
                    {listing.hostIsSuperhost ? " · Superhost" : ""}
                  </p>
                  {listing.hostAbout && (
                    <p className="listing-detail-host-about">
                      {listing.hostAbout}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            <p className="listing-detail-price">
              ${listing.pricePerNight} per night
            </p>
            <p className="listing-detail-guests">
              Sleeps up to {listing.maxGuests} guests
            </p>
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
              {currentUserId ? (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <div className="review-form-row">
                    <label className="review-label">
                      Rating
                      <select
                        className="review-input"
                        value={reviewRating}
                        onChange={(event) => setReviewRating(event.target.value)}
                        disabled={reviewSubmitting}
                      >
                        {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="review-label review-textarea">
                      Your review
                      <textarea
                        className="review-input"
                        rows="3"
                        value={reviewComments}
                        onChange={(event) => setReviewComments(event.target.value)}
                        disabled={reviewSubmitting}
                        placeholder="Share your stay details..."
                      />
                    </label>
                    <label className="review-label">
                      Optional photo
                      <input
                        className="review-input"
                        type="file"
                        accept="image/*"
                        onChange={(event) => setReviewPhoto(event.target.files?.[0] || null)}
                        disabled={reviewSubmitting}
                      />
                    </label>
                  </div>
                  {reviewPhotoPreview ? (
                    <img
                      className="review-photo-preview"
                      src={reviewPhotoPreview}
                      alt="Selected review"
                    />
                  ) : null}
                  <div className="review-actions">
                    <button
                      type="submit"
                      className="review-button"
                      disabled={reviewSubmitting}
                    >
                      {userReview ? "Update review" : "Post review"}
                    </button>
                    {reviewError ? (
                      <p className="review-feedback review-error">{reviewError}</p>
                    ) : null}
                    {reviewSuccess ? (
                      <p className="review-feedback review-success">{reviewSuccess}</p>
                    ) : null}
                  </div>
                </form>
              ) : (
                <div className="review-actions">
                  <p className="review-feedback">Log in to post a review.</p>
                  <Link to="/login" className="review-button">
                    Log in
                  </Link>
                </div>
              )}
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
                        <p className="listing-review-name">
                          {review.reviewerName || "Guest"}
                        </p>
                        <p className="listing-review-meta">
                          {review.rating
                            ? `${review.rating.toFixed(1)} stars`
                            : "No rating"}
                          {review.date
                            ? ` · ${new Date(review.date).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      {review.comments ? (
                        <p className="listing-review-comment">
                          {review.comments}
                        </p>
                      ) : null}
                      {review.photoPath ? (
                        <img
                          className="listing-review-photo"
                          src={resolvePhotoUrl(review.photoPath)}
                          alt="Review"
                          loading="lazy"
                        />
                      ) : null}
                      {review.author === currentUserId ? (
                        <div className="listing-review-actions">
                          <button
                            type="button"
                            className="review-button review-button-ghost"
                            onClick={() => {
                              setReviewRating(review.rating ?? 5);
                              setReviewComments(review.comments ?? "");
                            }}
                            disabled={reviewSubmitting}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="review-button review-button-danger"
                            onClick={() => handleReviewDelete(review._id)}
                            disabled={reviewSubmitting}
                          >
                            Delete
                          </button>
                        </div>
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
  );
}

export default ListingDetailPage;
