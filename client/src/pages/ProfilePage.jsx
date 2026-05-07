import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiClient';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);

    // This helps the frontend find the images stored on your server
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        async function loadProfile() {
            const response = await apiFetch('/api/auth/me', { method: 'GET' });
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
        // Note: We use the full URL here because apiFetch is set up for JSON, 
        // and file uploads (FormData) need special handling.
        const response = await fetch(`${apiBase}/api/auth/profile/avatar`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            setUser(data); // Updated state with the new image path
        }
        setUploading(false);
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="page-container">
            <h1>Your Profile</h1>
            <div className="avatar-section">
                {/* We combine apiBase + avatarUrl so the browser can find the image file */}
                <img 
                    src={user.avatarUrl ? `${apiBase}${user.avatarUrl}` : '/default-avatar.png'} 
                    alt="Avatar" 
                    width="150" 
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
                <br />
                <input type="file" onChange={handleAvatarUpload} disabled={uploading} />
                {uploading && <p>Uploading...</p>}
            </div>
            <div className="info-section">
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>
        </div>
    );
}

export default ProfilePage;