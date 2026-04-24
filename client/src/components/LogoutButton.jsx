import { useNavigate } from 'react-router-dom'

function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  )
}

export default LogoutButton
