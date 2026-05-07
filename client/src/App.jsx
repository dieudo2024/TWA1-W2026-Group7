import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import BrowsePage from './pages/BrowsePage'
import ListingDetailPage from './pages/ListingDetailPage'
import ProfilePage from './pages/ProfilePage'
import { getAuthToken, subscribeToAuthChanges } from './utils/authStorage'
import './App.css'

function RequireAuth({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestOnly({ isAuthenticated, children }) {
  return isAuthenticated ? <Navigate to="/welcome" replace /> : children
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()))

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextValue) => {
      setIsAuthenticated(nextValue)
    })

    return unsubscribe
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/register"
          element={(
            <GuestOnly isAuthenticated={isAuthenticated}>
              <RegisterPage />
            </GuestOnly>
          )}
        />
        <Route
          path="/login"
          element={(
            <GuestOnly isAuthenticated={isAuthenticated}>
              <LoginPage />
            </GuestOnly>
          )}
        />
        <Route
          path="/welcome"
          element={(
            <RequireAuth isAuthenticated={isAuthenticated}>
              <WelcomePage />
            </RequireAuth>
          )}
        />
        <Route
          path="/browse"
          element={(
            <RequireAuth isAuthenticated={isAuthenticated}>
              <BrowsePage />
            </RequireAuth>
          )}
        />
        <Route
          path="/listings/:id"
          element={(
            <RequireAuth isAuthenticated={isAuthenticated}>
              <ListingDetailPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/profile"
          element={(
            <RequireAuth isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </RequireAuth>
          )}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/welcome' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
