import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import './App.css'

function App() {
  const hasToken = Boolean(localStorage.getItem('authToken'))

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/welcome"
          element={hasToken ? <WelcomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/"
          element={<Navigate to={hasToken ? '/welcome' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
