function ProfileInfoSection({
    user,
    isEditingProfile,
    firstName,
    lastName,
    savingProfile,
    profileError,
    profileSuccess,
    onBeginEdit,
    onCancelEdit,
    onSave,
    onFirstNameChange,
    onLastNameChange,
}) {
    return (
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
                    <button type="button" className="browse-page-button" onClick={onBeginEdit}>
                        Edit
                    </button>
                </div>
            ) : (
                <form onSubmit={onSave} style={{ marginTop: '18px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#717171' }}>
                            First name
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={onFirstNameChange}
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
                            onChange={onLastNameChange}
                            disabled={savingProfile}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button type="submit" className="browse-page-button" disabled={savingProfile}>
                            {savingProfile ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="browse-page-button" onClick={onCancelEdit} disabled={savingProfile}>
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
    )
}

export default ProfileInfoSection
