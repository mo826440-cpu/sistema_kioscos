// =====================================================
// COMPONENTE LOGIN
// =====================================================

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('Por favor ingresá usuario y contraseña')
      return
    }

    setLoading(true)

    const result = await login(username, password)

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión')
      setLoading(false)
    }
    // Si es exitoso, el contexto redirigirá automáticamente
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-icon">🛒</div>
          <h1>Sistema POS</h1>
          <p>Supermercado</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresá tu usuario"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresá tu contraseña"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <p>👤 Usuario por defecto: <strong>admin</strong></p>
          <p>🔑 Contraseña por defecto: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  )
}

