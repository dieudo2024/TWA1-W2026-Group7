import ProfileReviewCard from './ProfileReviewCard'

function ProfileReviewsSection({ reviews, isLoadingReviews, reviewsError }) {
    return (
        <section style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '25px' }}>
                Your Reviews ({isLoadingReviews ? '…' : reviews.length})
            </h2>

            {isLoadingReviews ? (
                <p style={{ color: '#ffffff' }}>Loading reviews...</p>
            ) : reviewsError ? (
                <p style={{ color: '#b91c1c' }}>{reviewsError}</p>
            ) : reviews.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {reviews.map((review) => (
                        <ProfileReviewCard key={review._id} review={review} />
                    ))}
                </div>
            ) : (
                <p style={{ color: '#717171' }}>No reviews yet.</p>
            )}
        </section>
    )
}

export default ProfileReviewsSection
