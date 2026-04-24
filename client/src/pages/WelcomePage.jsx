import LogoutButton from '../components/LogoutButton'

function WelcomePage() {
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const displayName = user?.name || user?.email || 'Guest'

  return (
    <main className="welcome-page">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <h1 id="welcome-title" className="welcome-title">Welcome, {displayName}!</h1>
        <p className="welcome-subtitle">
          You are now signed in to Airbnb Listing Explorer.
        </p>
        <div className="welcome-actions">
          <LogoutButton />
        </div>
      </section>
    </main>
  )
}

export default WelcomePage
