// =====================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// =====================================================
//
// Sistema ERP completo con navegación entre módulos:
// - Dashboard, Productos, Proveedores, Compras
// - Clientes, Ventas (POS), Catálogo, Reportes, Usuarios
//
// =====================================================

import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Dashboard from './views/Dashboard'
import Productos from './views/Productos'
import Proveedores from './views/Proveedores'
import Compras from './views/Compras'
import Clientes from './views/Clientes'
import Ventas from './views/Ventas'
import Catalogo from './views/Catalogo'
import Reportes from './views/Reportes'
import Usuarios from './views/Usuarios'
import './styles/App.css'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  
  // Estado para controlar qué vista se muestra
  const [currentView, setCurrentView] = useState('ventas')

  // Función para cambiar de vista
  const handleNavigate = (viewId) => {
    setCurrentView(viewId)
  }

  // Renderizar la vista actual
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'productos':
        return <Productos />
      case 'proveedores':
        return <Proveedores />
      case 'compras':
        return <Compras />
      case 'clientes':
        return <Clientes />
      case 'ventas':
        return <Ventas />
      case 'catalogo':
        return <Catalogo />
      case 'reportes':
        return <Reportes />
      case 'usuarios':
        return <Usuarios />
      default:
        return <Dashboard />
    }
  }

  // Mostrar pantalla de carga mientras verifica la sesión
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '20px',
        color: '#666'
      }}>
        Cargando...
      </div>
    )
  }

  // Si no está autenticado, mostrar Login
  if (!isAuthenticated) {
    return <Login />
  }

  // Si está autenticado, mostrar la aplicación
  return (
    <div className="app">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

