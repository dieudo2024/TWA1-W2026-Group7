import { useState } from 'react'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  role: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

function isAdult(dateValue) {
  if (!dateValue) return false
  const dob = new Date(dateValue)
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  const dayDiff = today.getDate() - dob.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return age - 1 >= 18
  }

  return age >= 18
}

function validate(values) {
  const errors = {}

  if (!values.firstName.trim()) errors.firstName = 'First name is required.'
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.'

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!/^\+?[0-9\s-]{10,15}$/.test(values.phone)) {
    errors.phone = 'Phone must be 10 to 15 digits.'
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.'
  } else if (!isAdult(values.dateOfBirth)) {
    errors.dateOfBirth = 'You must be at least 18 years old.'
  }

  if (!values.role) errors.role = 'Please select an account type.'

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(values.password)
  ) {
    errors.password = 'Use 8+ chars with upper, lower, number, and symbol.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and privacy policy.'
  }

  return errors
}

function RegisterForm() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const onChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setApiMessage('')

    if (Object.keys(nextErrors).length === 0) {
      const submitRegistration = async () => {
        try {
          setSubmitting(true)
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
          const response = await fetch(`${apiBase}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
          })

          const payload = await response.json()

          if (!response.ok) {
            setSubmitted(false)
            setApiMessage(payload.message || 'Registration failed. Please try again.')
            return
          }

          setSubmitted(true)
          setApiMessage(payload.message || 'Registration successful.')
          setForm(initialForm)
        } catch (error) {
          setSubmitted(false)
          setApiMessage('Unable to reach the server. Please try again.')
        } finally {
          setSubmitting(false)
        }
      }

      submitRegistration()
    } else {
      setSubmitted(false)
    }
  }

  return (
    <form className="register-form" noValidate onSubmit={onSubmit}>
      {submitted && (
        <p className="success-banner" role="status">
          {apiMessage || 'Registration successful.'}
        </p>
      )}

      {!submitted && apiMessage && (
        <p className="field-error" role="alert">{apiMessage}</p>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label" htmlFor="firstName">First name</label>
          <input
            id="firstName"
            className="form-input"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={onChange}
          />
          {errors.firstName && <p className="field-error">{errors.firstName}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            className="form-input"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={onChange}
          />
          {errors.lastName && <p className="field-error">{errors.lastName}</p>}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="phone">Phone number</label>
          <input
            id="phone"
            className="form-input"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={onChange}
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="dateOfBirth">Date of birth</label>
          <input
            id="dateOfBirth"
            className="form-input"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={onChange}
          />
          {errors.dateOfBirth && <p className="field-error">{errors.dateOfBirth}</p>}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label" htmlFor="role">Account type</label>
          <select
            id="role"
            className="form-select"
            name="role"
            value={form.role}
            onChange={onChange}
          >
            <option value="">Select one</option>
            <option value="guest">Guest</option>
            <option value="host">Host</option>
          </select>
          {errors.role && <p className="field-error">{errors.role}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="password-input-wrap">
            <input
              id="password"
              className="form-input"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
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

        <div className="form-field">
          <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
          <div className="password-input-wrap">
            <input
              id="confirmPassword"
              className="form-input"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={onChange}
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="terms-row">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          checked={form.acceptTerms}
          onChange={onChange}
        />
        <label htmlFor="acceptTerms">
          I agree to the Terms of Service and Privacy Policy.
        </label>
      </div>
      {errors.acceptTerms && <p className="field-error">{errors.acceptTerms}</p>}

      <button className="submit-button" type="submit" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}

export default RegisterForm
