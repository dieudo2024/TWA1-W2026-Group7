const AUTH_TOKEN_KEY = 'authToken'
const USER_KEY = 'user'
const AUTH_CHANGED_EVENT = 'auth-changed'

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }

  emitAuthChanged()
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  emitAuthChanged()
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function subscribeToAuthChanges(callback) {
  const handler = () => callback(Boolean(getAuthToken()))

  window.addEventListener('storage', handler)
  window.addEventListener(AUTH_CHANGED_EVENT, handler)

  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(AUTH_CHANGED_EVENT, handler)
  }
}
