import { Link } from 'react-router-dom'

function ProfileReviewCard({ review }) {
    const listingId = review.listing?._id || review.listing
    const listingTitle = review.listing?.title

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#ff385c' }}>{review.rating} ★</span>
                {listingId ? (
                    <Link
                        to={`/listings/${listingId}`}
                        style={{ fontSize: '0.9rem', color: '#ffffff' }}
                    >
                        View Listing
                    </Link>
                ) : null}
            </div>

            {listingTitle ? (
                <div style={{ marginTop: '12px', marginBottom: '4px', color: '#ffffff', fontWeight: 600 }}>
                    {listingTitle}
                </div>
            ) : null}

            <p style={{ margin: '10px 0', color: '#ffffff' }}>{review.comments}</p>
            <small style={{ color: '#ffffff' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
        </div>
    )
}

export default ProfileReviewCard
