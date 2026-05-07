import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient';
import LogoutButton from '../components/LogoutButton';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        async function loadProfile() {
            const response = await apiFetch('/api/users/me', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        }
        loadProfile();
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        const response = await apiFetch('/api/auth/profile/avatar', {
            method: 'PATCH',
            body: formData,
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

            <div className="page-container">
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
                </div>
            </div>
        </main>
    );
}

export default ProfilePage;