import { createContext, useCallback, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { UNAUTHORIZED_EVENT } from '../api/client'
import { clearToken, getToken, setToken, TOKEN_KEY } from '../lib/storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Keep this tab's session in sync if the token changes (login/logout) in
  // another tab, or if a request comes back 401 because the token expired
  // or no longer belongs to who this tab thinks is logged in.
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === TOKEN_KEY) loadUser()
    }
    function handleUnauthorized() {
      setUser(null)
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [loadUser])

  const login = useCallback(async (credentials) => {
    const { access_token: accessToken } = await authApi.login(credentials)
    setToken(accessToken)
    const currentUser = await authApi.getCurrentUser()
    setUser(currentUser)
    return currentUser
  }, [])

  const register = useCallback(async (data) => {
    await authApi.register(data)
    return login({ email: data.email, password: data.password })
  }, [login])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
