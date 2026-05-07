import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient';
import LogoutButton from '../components/LogoutButton';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]); 
    const [uploading, setUploading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);

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

    const handleProfileSave = async (event) => {
        event.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        const nextFirstName = firstName.trim();
        const nextLastName = lastName.trim();

        if (!nextFirstName || !nextLastName) {
            setProfileError('Please enter both your first and last name.');
            return;
        }

        setSavingProfile(true);
        try {
            const response = await apiFetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: nextFirstName,
                    lastName: nextLastName,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Unable to update profile.');
            }

            const updated = await response.json();
            setUser(updated);
            setFirstName(updated.firstName || nextFirstName);
            setLastName(updated.lastName || nextLastName);
            setProfileSuccess('Profile updated.');
            setIsEditingProfile(false);
        } catch (error) {
            setProfileError(error.message || 'Unable to update profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    const beginEditProfile = () => {
        setProfileError('');
        setProfileSuccess('');
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
        setIsEditingProfile(true);
    };

    const cancelEditProfile = () => {
        setProfileError('');
        setProfileSuccess('');
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
        setIsEditingProfile(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        const response = await apiFetch('/api/auth/profile/avatar', {
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
            {/* UPDATED HEADER LAYOUT */}
            <nav className="browse-tabs" style={{ marginBottom: '40px', padding: '10px 20px' }}>
                <div className="browse-tabs-inner" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%' 
                }}>
                    {/* Left Section: Browse Link */}
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <Link to="/browse" className="browse-tab-link" style={{ fontWeight: '600' }}>
                            Browse listings
                        </Link>
                    </div>

                    {/* Middle Section: Centered Title */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.5rem', margin: 0, whiteSpace: 'nowrap' }}>
                            Your Profile
                        </h1>
                    </div>
                    
                    {/* Right Section: Logout Button */}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <div className="page-container" style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
                <aside style={{ flex: '0 0 350px' }}>
                <div className="avatar-section" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img
                        src={user.avatarUrl ? `${apiBase}${user.avatarUrl}` : '/default-avatar.png'} 
                        alt="Avatar"
                        width="160"
                        height="160"
                        style={{
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #f7f7f7',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                    <div style={{ marginTop: '20px' }}>
                        <label htmlFor="avatar-upload" className="browse-page-button" style={{ cursor: 'pointer', padding: '10px 20px' }}>
                            {uploading ? 'Uploading...' : 'Change Photo'}
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                        <div style={{ marginTop: '20px' }}>
                            <input type="file" id="avatar-upload" onChange={handleAvatarUpload} disabled={uploading} style={{ display: 'none' }} />
                            <label htmlFor="avatar-upload" className="browse-page-button" style={{ cursor: 'pointer', padding: '10px 20px' }}>
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="info-section" style={{
                    backgroundColor: '#17151f',
                    padding: '30px',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    maxWidth: '500px',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ color: '#717171', fontSize: '0.9rem', display: 'block' }}>Full Name</span>
                        <strong style={{ fontSize: '1.1rem' }}>{user.firstName} {user.lastName}</strong>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ color: '#717171', fontSize: '0.9rem', display: 'block' }}>Email Address</span>
                    <strong style={{ fontSize: '1.1rem' }}>{user.email}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#717171', fontSize: '0.9rem', display: 'block' }}>Role</span>
                        <strong style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>{user.role}</strong>
                    </div>

                    {!isEditingProfile ? (
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                            <button type="button" className="browse-page-button" onClick={beginEditProfile}>
                                Edit
                            </button>
                </aside>

                <section style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: '25px' }}>Your Reviews ({reviews.length})</h2>
                    {reviews.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            {reviews.map((review) => (
                                <div key={review._id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold', color: '#ff385c' }}>{review.rating} ?</span>
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
                        <form onSubmit={handleProfileSave} style={{ marginTop: '24px', textAlign: 'left' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', color: '#717171', fontSize: '0.9rem' }}>
                                    First name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={savingProfile}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', color: '#717171', fontSize: '0.9rem' }}>
                                    Last name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={savingProfile}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <button type="submit" className="browse-page-button" disabled={savingProfile}>
                                    {savingProfile ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" className="browse-page-button" onClick={cancelEditProfile} disabled={savingProfile}>
                                    Cancel
                                </button>
                            </div>

                            {profileError ? (
                                <p style={{ marginTop: '12px', color: '#b91c1c', textAlign: 'center' }}>{profileError}</p>
                            ) : null}
                            {profileSuccess ? (
                                <p style={{ marginTop: '12px', color: '#15803d', textAlign: 'center' }}>{profileSuccess}</p>
                            ) : null}
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}

export default ProfilePage;