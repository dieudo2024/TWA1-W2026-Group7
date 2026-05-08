import { Link } from 'react-router-dom'
import LogoutButton from '../LogoutButton'

function ProfileHeader() {
    return (
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
}

export default ProfileHeader
