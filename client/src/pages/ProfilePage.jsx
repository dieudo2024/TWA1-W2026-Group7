import { useEffect, useStae } from 'react';
import { apiFetch } from '../utils/apiClient';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);

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
        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        const response = await fetch('/api/auth/profile/avatar', {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });

        if (response.ok) {
            const updateUser = await response.json();
            setUser(updatedUser);
        }
        setUploading(false);
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="profile-container">
            <h1>Your Profile</h1>
            <div className="avatar-section">
                <img src={user.avaterUrl || '/default-avatar.png'} alt="Avatar" width="150" />
                <input type="file" onChange={handleAvatarUpload} disabled={uploading} />
            </div>
            <div className="info-section">
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>
        </div>
    );
}

export default ProfilePage;