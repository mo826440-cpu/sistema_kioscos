// =====================================================
// CONTEXTO DE AUTENTICACIÓN
// =====================================================
//
// Maneja el estado global de autenticación del usuario
// Provee funciones para login, logout y verificación de permisos
//
// =====================================================

import { createContext, useContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Al iniciar, verificar si hay sesión guardada
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error al cargar sesión:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  // Login
  const login = async (username, password) => {
    try {
      const authenticatedUser = await window.api.authenticateUser(username, password)
      
      if (authenticatedUser) {
        setUser(authenticatedUser)
        localStorage.setItem('currentUser', JSON.stringify(authenticatedUser))
        return { success: true }
      } else {
        return { success: false, error: 'Usuario o contraseña incorrectos' }
      }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: 'Error al iniciar sesión' }
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  // Verificar si tiene permiso para una sección
  const hasPermission = (section) => {
    if (!user) return false
    
    // Los administradores tienen acceso a todo
    if (user.role === 'admin' || user.role === 'administrador') return true
    
    // Verificar permisos específicos
    if (user.permissions && user.permissions[section]) {
      return true
    }
    
    return false
  }

  // Verificar si es administrador
  const isAdmin = () => {
    return user && (user.role === 'admin' || user.role === 'administrador')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

