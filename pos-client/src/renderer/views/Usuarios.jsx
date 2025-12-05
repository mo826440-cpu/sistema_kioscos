// =====================================================
// VISTA - GESTIÓN DE USUARIOS
// =====================================================

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/CommonView.css'
import '../styles/Usuarios.css'

export default function Usuarios() {
  const { isAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'cashier'
  })
  const [error, setError] = useState('')

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await window.api.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        password: '',
        full_name: user.full_name,
        role: user.role
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'cashier'
      })
    }
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.full_name) {
      setError('El nombre completo es obligatorio')
      return
    }

    if (!editingUser) {
      // Crear nuevo usuario
      if (!formData.username || !formData.password) {
        setError('Usuario y contraseña son obligatorios')
        return
      }

      if (formData.password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres')
        return
      }

      const result = await window.api.createUser(formData)
      
      if (result.success) {
        alert('✅ Usuario creado exitosamente')
        handleCloseModal()
        loadUsers()
      } else {
        setError(result.error || 'Error al crear usuario')
      }
    } else {
      // Actualizar usuario
      const updateData = {
        full_name: formData.full_name,
        role: formData.role
      }

      // Solo actualizar contraseña si se ingresó una nueva
      if (formData.password) {
        if (formData.password.length < 4) {
          setError('La contraseña debe tener al menos 4 caracteres')
          return
        }
        updateData.password = formData.password
      }

      const result = await window.api.updateUser(editingUser.id, updateData)
      
      if (result.success) {
        alert('✅ Usuario actualizado exitosamente')
        handleCloseModal()
        loadUsers()
      } else {
        setError(result.error || 'Error al actualizar usuario')
      }
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro que querés eliminar este usuario?')) {
      return
    }

    const result = await window.api.deleteUser(userId)
    
    if (result.success) {
      alert('✅ Usuario eliminado exitosamente')
      loadUsers()
    } else {
      alert('❌ ' + (result.error || 'Error al eliminar usuario'))
    }
  }

  const handleToggleActive = async (user) => {
    const result = await window.api.updateUser(user.id, {
      active: !user.active
    })
    
    if (result.success) {
      loadUsers()
    } else {
      alert('❌ Error al cambiar estado del usuario')
    }
  }

  // Mapeo de roles
  const roleNames = {
    admin: 'Administrador',
    cashier: 'Cajero',
    manager: 'Gerente',
    viewer: 'Visor'
  }

  if (loading) {
    return (
      <div className="view-container">
        <p className="placeholder-text">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">👤 Usuarios</h1>
          <p className="view-subtitle">Gestión de usuarios y permisos del sistema</p>
        </div>
        {isAdmin() && (
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            ➕ Nuevo Usuario
          </button>
        )}
      </div>

      <div className="view-content">
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                {isAdmin() && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={!user.active ? 'inactive' : ''}>
                  <td>
                    <strong>{user.username}</strong>
                    {user.id === currentUser?.id && (
                      <span className="badge-you"> (Tú)</span>
                    )}
                  </td>
                  <td>{user.full_name}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {roleNames[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('es-AR')}</td>
                  {isAdmin() && (
                    <td className="actions-cell">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleOpenModal(user)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-toggle"
                        onClick={() => handleToggleActive(user)}
                        title={user.active ? 'Desactivar' : 'Activar'}
                      >
                        {user.active ? '🔒' : '🔓'}
                      </button>
                      {user.id !== 1 && user.id !== currentUser?.id && (
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(user.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="placeholder-text">No hay usuarios registrados</p>
          )}
        </div>
      </div>

      {/* Modal de crear/editar usuario */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!!editingUser}
                  placeholder="Ej: jperez"
                  required
                />
                {editingUser && (
                  <small>El nombre de usuario no se puede cambiar</small>
                )}
              </div>

              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>{editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Mínimo 4 caracteres"
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="cashier">Cajero</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                  <option value="viewer">Visor</option>
                </select>
              </div>

              {error && (
                <div className="error-message">⚠️ {error}</div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
