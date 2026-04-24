import LoginForm from '../components/LoginForm'

function LoginPage() {
  return (
    <div className="page-container">
      <h1>Welcome back</h1>
      <p className="page-subtitle">Sign in to your Airbnb account</p>
      <LoginForm />
    </div>
  )
}

export default LoginPage
