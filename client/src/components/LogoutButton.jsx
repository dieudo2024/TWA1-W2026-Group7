import { useNavigate } from 'react-router-dom'
import { clearAuthSession } from '../utils/authStorage'

function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuthSession()
    navigate('/login')
  }

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  )
}

export default LogoutButton
