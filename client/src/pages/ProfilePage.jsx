import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../utils/apiClient'
import LogoutButton from '../components/LogoutButton'

function ProfilePage() {
    const [user, setUser] = useState(null)
    const [reviews, setReviews] = useState([])
    const [uploading, setUploading] = useState(false)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)

    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')
    const [isEditingProfile, setIsEditingProfile] = useState(false)

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    useEffect(() => {
        let cancelled = false

        async function loadProfileAndReviews() {
            setProfileError('')

            try {
                const userRes = await apiFetch('/api/users/me', { method: 'GET' })
                if (!userRes.ok) {
                    const data = await userRes.json().catch(() => ({}))
                    throw new Error(data.message || 'Failed to load profile.')
                }

                const userData = await userRes.json()
                if (cancelled) return

                setUser(userData)
                setFirstName(userData.firstName || '')
                setLastName(userData.lastName || '')

                const reviewRes = await apiFetch(`/api/reviews?author=${userData._id}`, { method: 'GET' })
                if (!reviewRes.ok) {
                    return
                }

                const reviewData = await reviewRes.json().catch(() => [])
                if (cancelled) return
                setReviews(Array.isArray(reviewData) ? reviewData : [])
            } catch (error) {
                if (!cancelled) {
                    setProfileError(error?.message || 'Failed to load profile.')
                }
            }
        }

        loadProfileAndReviews()

        return () => {
            cancelled = true
        }
    }, [])

    const beginEditProfile = () => {
        setProfileError('')
        setProfileSuccess('')
        setFirstName(user?.firstName || '')
        setLastName(user?.lastName || '')
        setIsEditingProfile(true)
    }

    const cancelEditProfile = () => {
        setProfileError('')
        setProfileSuccess('')
        setFirstName(user?.firstName || '')
        setLastName(user?.lastName || '')
        setIsEditingProfile(false)
    }

    const handleProfileSave = async (event) => {
        event.preventDefault()
        setProfileError('')
        setProfileSuccess('')

        const nextFirstName = firstName.trim()
        const nextLastName = lastName.trim()

        if (!nextFirstName || !nextLastName) {
            setProfileError('Please enter both your first and last name.')
            return
        }

        setSavingProfile(true)
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
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.message || 'Unable to update profile.')
            }

            const updated = await response.json()
            setUser(updated)
            setFirstName(updated.firstName || nextFirstName)
            setLastName(updated.lastName || nextLastName)
            setProfileSuccess('Profile updated.')
            setIsEditingProfile(false)
        } catch (error) {
            setProfileError(error?.message || 'Unable to update profile.')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setProfileError('')
        setProfileSuccess('')

        const formData = new FormData()
        formData.append('avatar', file)

        setUploading(true)
        try {
            const response = await apiFetch('/api/auth/profile/avatar', {
                method: 'PATCH',
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.message || 'Unable to upload avatar.')
            }

            const data = await response.json()
            setUser(data)
            setProfileSuccess('Photo updated.')
        } catch (error) {
            setProfileError(error?.message || 'Unable to upload avatar.')
        } finally {
            setUploading(false)
            event.target.value = ''
        }
    }

    const header = (
        <nav className="browse-tabs" style={{ marginBottom: '40px', padding: '10px 20px' }}>
            <div className="browse-tabs-inner" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <Link to="/browse" className="browse-tab-link" style={{ fontWeight: '600' }}>
                        Browse listings
                    </Link>
                </div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', margin: 0, whiteSpace: 'nowrap' }}>Your Profile</h1>
                </div>

                <div style={{ flex: 1, textAlign: 'right' }}>
                    <LogoutButton />
                </div>
            </div>
        </nav>
    )

    if (!user) {
        return (
            <main className="profile-page">
                {header}
                <div className="page-container">
                    <p>Loading...</p>
                    {profileError ? <p style={{ marginTop: '12px', color: '#b91c1c' }}>{profileError}</p> : null}
                </div>
            </main>
        )
    }

    return (
        <main className="profile-page">
            {header}

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
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <label
                                htmlFor="avatar-upload"
                                className="browse-page-button"
                                style={{ cursor: uploading ? 'not-allowed' : 'pointer', padding: '10px 20px' }}
                            >
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="info-section" style={{ padding: '25px', borderRadius: '12px', border: '1px solid #ddd' }}>
                        <p>
                            <strong>Name:</strong> {user.firstName} {user.lastName}
                        </p>
                        <p>
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p>
                            <strong>Role:</strong> {user.role}
                        </p>

                        {!isEditingProfile ? (
                            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center' }}>
                                <button type="button" className="browse-page-button" onClick={beginEditProfile}>
                                    Edit
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleProfileSave} style={{ marginTop: '18px' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#717171' }}>
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
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#717171' }}>
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
                </aside>

                <section style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: '25px' }}>Your Reviews ({reviews.length})</h2>
                    {reviews.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            {reviews.map((review) => (
                                <div key={review._id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#ff385c' }}>{review.rating} ★</span>
                                        <Link
                                            to={`/listings/${review.listing?._id || review.listing}`}
                                            style={{ fontSize: '0.9rem', color: '#484848' }}
                                        >
                                            View Listing
                                        </Link>
                                    </div>
                                    <p style={{ margin: '10px 0' }}>{review.comments}</p>
                                    <small style={{ color: '#717171' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#717171' }}>No reviews yet.</p>
                    )}
                </section>
            </div>
        </main>
    )
}

export default ProfilePage