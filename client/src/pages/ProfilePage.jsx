import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient';
import LogoutButton from '../components/LogoutButton';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]); 
    const [uploading, setUploading] = useState(false);

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        async function loadProfileAndReviews() {
            const userRes = await apiFetch('/api/auth/me', { method: 'GET' });
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData);

                // This calls the new GET route we added to reviews.js
                const reviewRes = await apiFetch(`/api/reviews?author=${userData._id}`, { method: 'GET' });
                if (reviewRes.ok) {
                    const reviewData = await reviewRes.json();
                    setReviews(reviewData);
                }
            }
        }
        loadProfileAndReviews();
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        const response = await fetch(`${apiBase}/api/auth/profile/avatar`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            setUser(data);
        }
        setUploading(false);
    };

    if (!user) return <div className="page-container"><p>Loading...</p></div>;

    return (
        <main className="profile-page">
            <nav className="browse-tabs" style={{ marginBottom: '40px', padding: '10px 20px' }}>
                <div className="browse-tabs-inner" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <Link to="/browse" className="browse-tab-link" style={{ fontWeight: '600' }}>Browse listings</Link>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Your Profile</h1>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <div className="page-container" style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
                
                <aside style={{ flex: '0 0 350px' }}>
                    <div className="avatar-section" style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <img 
                            src={user.avatarUrl ? `${apiBase}${user.avatarUrl}` : '/default-avatar.png'} 
                            alt="Avatar" 
                            width="160" 
                            height="160"
                            style={{ borderRadius: '50%', objectFit: 'cover', border: '4px solid #f7f7f7', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <div style={{ marginTop: '20px' }}>
                            <input type="file" id="avatar-upload" onChange={handleAvatarUpload} disabled={uploading} style={{ display: 'none' }} />
                            <label htmlFor="avatar-upload" className="browse-page-button" style={{ cursor: 'pointer', padding: '10px 20px' }}>
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </label>
                        </div>
                    </div>

                    <div className="info-section" style={{ padding: '25px', borderRadius: '12px', border: '1px solid #ddd' }}>
                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                    </div>
                </aside>

                <section style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: '25px' }}>Your Reviews ({reviews.length})</h2>
                    {reviews.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            {reviews.map((review) => (
                                <div key={review._id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold', color: '#ff385c' }}>{review.rating} ★</span>
                                        {/* Link updated to use 'listing' property from backend populate */}
                                        <Link to={`/listings/${review.listing?._id || review.listing}`} style={{ fontSize: '0.9rem', color: '#484848' }}>
                                            View Listing
                                        </Link>
                                    </div>
                                    {/* Changed from .comment to .comments to match your backend */}
                                    <p style={{ margin: '10px 0' }}>{review.comments}</p>
                                    <small style={{ color: '#717171' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#717171' }}>You haven't written any reviews yet.</p>
                    )}
                </section>
            </div>
        </main>
    );
}

export default ProfilePage;