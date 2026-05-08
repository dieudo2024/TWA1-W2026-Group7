import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/apiClient'
import ProfileAvatarSection from '../components/profile/ProfileAvatarSection'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileInfoSection from '../components/profile/ProfileInfoSection'
import ProfileReviewsSection from '../components/profile/ProfileReviewsSection'

function ProfilePage() {
    const [user, setUser] = useState(null)
    const [reviews, setReviews] = useState([])
    const [isLoadingReviews, setIsLoadingReviews] = useState(true)
    const [reviewsError, setReviewsError] = useState('')
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
            setReviewsError('')
            setIsLoadingReviews(true)

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

                try {
                    const reviewRes = await apiFetch(`/api/reviews?author=${userData._id}`, { method: 'GET' })
                    if (!reviewRes.ok) {
                        const data = await reviewRes.json().catch(() => ({}))
                        throw new Error(data.message || 'Failed to load reviews.')
                    }

                    const reviewData = await reviewRes.json().catch(() => [])
                    if (cancelled) return
                    setReviews(Array.isArray(reviewData) ? reviewData : [])
                } catch (error) {
                    if (!cancelled) {
                        setReviews([])
                        setReviewsError(error?.message || 'Failed to load reviews.')
                    }
                } finally {
                    if (!cancelled) {
                        setIsLoadingReviews(false)
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    setProfileError(error?.message || 'Failed to load profile.')
                    setIsLoadingReviews(false)
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

    if (!user) {
        return (
            <main className="profile-page">
                <ProfileHeader />
                <div className="page-container">
                    <p>Loading...</p>
                    {profileError ? <p style={{ marginTop: '12px', color: '#b91c1c' }}>{profileError}</p> : null}
                </div>
            </main>
        )
    }

    return (
        <main className="profile-page">
            <ProfileHeader />

            <div className="page-container" style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
                <aside style={{ flex: '0 0 350px' }}>
                    <ProfileAvatarSection
                        user={user}
                        apiBase={apiBase}
                        uploading={uploading}
                        onAvatarUpload={handleAvatarUpload}
                    />

                    <ProfileInfoSection
                        user={user}
                        isEditingProfile={isEditingProfile}
                        firstName={firstName}
                        lastName={lastName}
                        savingProfile={savingProfile}
                        profileError={profileError}
                        profileSuccess={profileSuccess}
                        onBeginEdit={beginEditProfile}
                        onCancelEdit={cancelEditProfile}
                        onSave={handleProfileSave}
                        onFirstNameChange={(e) => setFirstName(e.target.value)}
                        onLastNameChange={(e) => setLastName(e.target.value)}
                    />
                </aside>

                <ProfileReviewsSection
                    reviews={reviews}
                    isLoadingReviews={isLoadingReviews}
                    reviewsError={reviewsError}
                />
            </div>
        </main>
    )
}

export default ProfilePage