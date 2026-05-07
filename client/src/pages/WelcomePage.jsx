import { Link } from 'react-router-dom'
import LogoutButton from '../components/LogoutButton'
import { getStoredUser } from '../utils/authStorage'

function WelcomePage() {
  const user = getStoredUser()
  const displayName = user?.name || user?.email || 'Guest'

  return (
    <main className="welcome-page">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <h1 id="welcome-title" className="welcome-title">Welcome, {displayName}!</h1>
        <p className="welcome-subtitle">
          You are now signed in to Airbnb Listing Explorer.
        </p>
        <div className="welcome-actions">
          <Link to="/browse" className="browse-link">
            Browse listings
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  )
}

export default WelcomePage