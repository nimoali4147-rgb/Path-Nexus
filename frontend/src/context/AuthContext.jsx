
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react'

const AuthContext = createContext(null)

const API_URL = '/api/auth/refresh/'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')

    try {
      return savedUser ? JSON.parse(savedUser) : null
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
    const currentRefreshToken = localStorage.getItem('refresh')

    if (!currentRefreshToken) {
      logout()
      return null
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: currentRefreshToken,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.access) {
        throw new Error('Session expired. Please log in again.')
      }

      localStorage.setItem('access', data.access)
      setAccessToken(data.access)

      if (data.refresh) {
        localStorage.setItem('refresh', data.refresh)
        setRefreshToken(data.refresh)
      }

      return data.access

    } catch (error) {
      logout()
      return null
    }
  }, [logout])

  const value = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(user && accessToken),
    login,
    logout,
    refreshAccessToken,
  }), [
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    refreshAccessToken,
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
