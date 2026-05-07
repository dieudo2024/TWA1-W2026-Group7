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
}