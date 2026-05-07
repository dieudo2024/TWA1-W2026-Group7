import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiClient';

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

    if (!user) return <div className="page-container"><p>Loading profile...</p></div>;

    return (
        <div className="page-container">
            <h1>Your Profile</h1>
            <div className="avatar-section" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img 
                    src={user.avatarUrl ? `${apiBase}${user.avatarUrl}` : 'https://via.placeholder.com/150'} 
                    alt="Avatar" 
                    width="150" 
                    height="150"
                    style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff385c' }} 
                />
                <br />
                <input 
                    type="file" 
                    id="avatarInput"
                    onChange={handleAvatarUpload} 
                    disabled={uploading} 
                    style={{ marginTop: '10px' }}
                />
                {uploading && <p>Uploading photo...</p>}
            </div>
            <div className="info-section">
                <p><strong>First Name:</strong> {user.firstName}</p>
                <p><strong>Last Name:</strong> {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>
        </div>
    );
}

export default ProfilePage;