import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('pingup_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrapSession = async () => {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (data.success) {
          setUser(data.user)
        } else {
          handleLogout()
        }
      } catch (error) {
        handleLogout()
      } finally {
        setLoading(false)
      }
    }

    bootstrapSession()
  }, [token])

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken)
    localStorage.setItem('pingup_token', nextToken)
    setUser(nextUser)
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('pingup_token')
  }

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      if (data.success) {
        persistSession(data.token, data.user)
        return { success: true, user: data.user, token: data.token }
      }
      return { success: false, message: data.message }
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return { success: false, message }
    }
  }

  const register = async ({ email, password, full_name, username }) => {
    try {
      const { data } = await api.post('/api/auth/register', {
        email,
        password,
        full_name,
        username,
      })
      if (data.success) {
        persistSession(data.token, data.user)
        return { success: true, user: data.user, token: data.token }
      }
      return { success: false, message: data.message }
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return { success: false, message }
    }
  }

  const getToken = async () => token

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout: handleLogout, getToken, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export const useUser = () => ({ user: useContext(AuthContext)?.user })
