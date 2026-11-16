
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react'

const AuthContext = createContext(null)
const REFRESH_URL = '/api/auth/refresh/'

// Prevent multiple requests from refreshing the token simultaneously.
let refreshPromise = null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem('access')
  )

  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem('refresh')
  )

  const login = useCallback((userData, access, refresh) => {
    if (!access || !refresh) {
      throw new Error('Login response must contain access and refresh tokens.')
    }

    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)

    setUser(userData)
    setAccessToken(access)
    setRefreshToken(refresh)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user')
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')

    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = (async () => {
      const currentRefreshToken = localStorage.getItem('refresh')

      if (!currentRefreshToken) {
        logout()
        return null
      }

      try {
        const response = await fetch(REFRESH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: currentRefreshToken,
          }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data.access) {
          logout()
          return null
        }

        localStorage.setItem('access', data.access)
        setAccessToken(data.access)

        // Save a rotated refresh token if Django returns one.
        if (data.refresh) {
          localStorage.setItem('refresh', data.refresh)
          setRefreshToken(data.refresh)
        }

        return data.access
      } catch (error) {
        // A network failure is not proof that the refresh token is invalid.
        console.error('Token refresh network error:', error)
        return null
      }
    })()

    try {
      return await refreshPromise
    } finally {
      refreshPromise = null
    }
  }, [logout])

  // Use this function for authenticated API requests throughout the app.
  const apiFetch = useCallback(async (url, options = {}) => {
    const makeRequest = (token) => {
      const headers = new Headers(options.headers || {})

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      // Do not set Content-Type manually for FormData uploads.
      if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has('Content-Type')
      ) {
        headers.set('Content-Type', 'application/json')
      }

      return fetch(url, {
        ...options,
        headers,
      })
    }

    let currentAccessToken = localStorage.getItem('access')
    let response = await makeRequest(currentAccessToken)

    if (response.status !== 401) {
      return response
    }

    // Refresh the expired access token, then retry once.
    const newAccessToken = await refreshAccessToken()

    if (!newAccessToken) {
      return response
    }

    response = await makeRequest(newAccessToken)
    return response
  }, [refreshAccessToken])

  const value = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(user && accessToken),
    login,
    logout,
    refreshAccessToken,
    apiFetch,
  }), [
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    refreshAccessToken,
    apiFetch,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
