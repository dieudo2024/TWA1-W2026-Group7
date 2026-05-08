function ProfileAvatarSection({ user, apiBase, uploading, onAvatarUpload }) {
    return (
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
                    onChange={onAvatarUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    )
}

export default ProfileAvatarSection
