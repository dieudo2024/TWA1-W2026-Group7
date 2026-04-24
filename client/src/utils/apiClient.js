import { clearAuthSession, getAuthToken } from './authStorage'

function resolveApiUrl(path) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${apiBase}${path}`
}

export async function apiFetch(path, options = {}, config = {}) {
  const { includeAuth = true, clearSessionOn401 = true } = config
  const headers = new Headers(options.headers || {})

  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(resolveApiUrl(path), {
    ...options,
    headers,
  })

  if (response.status === 401 && clearSessionOn401) {
    clearAuthSession()
  }

  return response
}
