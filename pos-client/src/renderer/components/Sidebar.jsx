// =====================================================
// BARRA DE NAVEGACIÓN LATERAL
// =====================================================

import React from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/Sidebar.css'

function Sidebar({ currentView, onNavigate }) {
  const { user, logout, isAdmin } = useAuth()
  
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'productos', icon: '📦', label: 'Productos' },
    { id: 'proveedores', icon: '🚚', label: 'Proveedores' },
    { id: 'compras', icon: '🛒', label: 'Compras' },
    { id: 'clientes', icon: '👥', label: 'Clientes' },
    { id: 'ventas', icon: '💰', label: 'Ventas' },
    { id: 'catalogo', icon: '📚', label: 'Catálogo' },
    { id: 'reportes', icon: '📈', label: 'Reportes' },
  ]
  
  // Solo mostrar Usuarios a los administradores
  if (isAdmin()) {
    menuItems.push({ id: 'usuarios', icon: '👤', label: 'Usuarios' })
  }

  const handleLogout = () => {
    if (confirm('¿Estás seguro que querés cerrar sesión?')) {
      logout()
    }
  }

  // Mapeo de roles a nombres legibles
  const roleNames = {
    admin: 'Administrador',
    administrador: 'Administrador',
    cashier: 'Cajero',
    cajero: 'Cajero',
    manager: 'Gerente',
    gerente: 'Gerente',
    viewer: 'Visor',
    visor: 'Visor'
  }

  return (
    <aside className="sidebar">
      {/* Logo y Título */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🛒</div>
        <h2 className="sidebar-title">Sistema POS</h2>
        <p className="sidebar-subtitle">Supermercado</p>
      </div>

      {/* Usuario actual */}
      <div className="sidebar-user">
        <div className="user-avatar">👤</div>
        <div className="user-info">
          <p className="user-name">{user?.full_name || 'Usuario'}</p>
          <p className="user-role">{roleNames[user?.role] || user?.role}</p>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer con logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Cerrar Sesión</span>
        </button>
        <p className="sidebar-version">v0.1.0</p>
      </div>
    </aside>
  )
}

export default Sidebar

