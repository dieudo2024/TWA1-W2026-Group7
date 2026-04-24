import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialForm = {
  email: '',
  password: '',
}

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function LoginForm() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setApiMessage('')

    if (Object.keys(nextErrors).length === 0) {
      const submitLogin = async () => {
        try {
          setSubmitting(true)
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
          const response = await fetch(`${apiBase}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
          })

          const payload = await response.json()

          if (!response.ok) {
            setApiMessage(payload.message || 'Login failed. Please try again.')
            return
          }

          // Store token in localStorage
          localStorage.setItem('authToken', payload.token)
          localStorage.setItem('user', JSON.stringify(payload.user))
          
          setApiMessage('Login successful. Redirecting...')
          setForm(initialForm)
          
          // Redirect to dashboard or home page
          setTimeout(() => {
            navigate('/')
          }, 1000)
        } catch (error) {
          setApiMessage('Unable to reach the server. Please try again.')
        } finally {
          setSubmitting(false)
        }
      }

      submitLogin()
    }
  }

  return (
    <form className="register-form" noValidate onSubmit={onSubmit}>
      {apiMessage && (
        <p 
          className={localStorage.getItem('authToken') ? 'success-banner' : 'field-error'} 
          role={localStorage.getItem('authToken') ? 'status' : 'alert'}
        >
          {apiMessage}
        </p>
      )}

      <div className="form-grid">
        <div className="form-field form-field--full">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="your@email.com"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="password-input-wrap">
            <input
              id="password"
              className="form-input"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
      </div>

      <button className="submit-button" type="submit" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="form-footer">
        Don't have an account? <a href="/register">Sign up here</a>
      </p>
    </form>
  )
}

export default LoginForm
