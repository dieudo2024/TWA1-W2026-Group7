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
}