import RegisterForm from '../components/RegisterForm'

function RegisterPage() {
  return (
    <main className="register-page">
      <section className="register-card" aria-labelledby="register-title">
        <header className="register-header">
          <h1 id="register-title" className="register-title">Create Your Account</h1>
          <p className="register-subtitle">
            Register to explore listings, save favorites, and post reviews.
          </p>
        </header>
        <RegisterForm />
      </section>
    </main>
  )
}

export default RegisterPage
