/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react'

const AuthContext = createContext(null)

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
    if (!access || !refresh || !userData) {
      throw new Error('The login response is missing account or token details.')
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

  const value = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(user && accessToken),
    login,
    logout,
  }), [user, accessToken, refreshToken, login, logout])

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
