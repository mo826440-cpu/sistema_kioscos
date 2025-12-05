// =====================================================
// CLIENTES - Gestión de Clientes
// =====================================================

import React, { useState, useEffect } from 'react'
import '../styles/Clientes.css'

function Clientes() {
  // Estados
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('activo') // 'activo', 'inactivo', 'todos'
  
  const [showModal, setShowModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [clienteForm, setClienteForm] = useState({
    nombreCliente: '',
    contacto: '',
    descripcion: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(100)

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {
    loadClientes()
  }, [filterEstado])

  const loadClientes = async () => {
    try {
      const data = await window.api.getAllClientes(filterEstado)
      setClientes(data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      showMessage('Error al cargar clientes', 'error')
    }
  }

  // =====================================================
  // FUNCIONES DE MODAL
  // =====================================================

  const openModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente)
      setClienteForm({
        nombreCliente: cliente.nombreCliente,
        contacto: cliente.contacto || '',
        descripcion: cliente.descripcion || ''
      })
    } else {
      setEditingCliente(null)
      setClienteForm({
        nombreCliente: '',
        contacto: '',
        descripcion: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCliente(null)
  }

  const handleSaveCliente = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingCliente) {
        result = await window.api.updateCliente(editingCliente.idCliente, clienteForm)
      } else {
        result = await window.api.createCliente(clienteForm)
      }

      if (result.success) {
        showMessage(
          editingCliente ? '✅ Cliente actualizado' : '✅ Cliente creado',
          'success'
        )
        closeModal()
        loadClientes()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al guardar cliente', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEstado = async (cliente) => {
    const accion = cliente.estado === 'activo' ? 'desactivar' : 'activar'
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} el cliente "${cliente.nombreCliente}"?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await window.api.toggleClienteEstado(cliente.idCliente)
      if (result.success) {
        showMessage(`✅ ${result.message}`, 'success')
        loadClientes()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al cambiar estado del cliente', 'error')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  // Filtrar clientes por búsqueda
  const filteredClientes = clientes.filter(cli =>
    cli.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cli.contacto && cli.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Paginación
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClientes = itemsPerPage >= filteredClientes.length 
    ? filteredClientes 
    : filteredClientes.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <div>
          <h1>👥 Clientes</h1>
          <p>
            Gestión de clientes ({filteredClientes.length} de {clientes.length})
            {totalPages > 1 && (
              <span> · Página {currentPage} de {totalPages}</span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          + Nuevo Cliente
        </button>
      </div>

      {/* Mensaje de feedback */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div className="clientes-filters">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o contacto..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="filter-select"
          value={filterEstado}
          onChange={(e) => {
            setFilterEstado(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
        
        <select
          className="filter-select"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value))
            setCurrentPage(1)
          }}
        >
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
          <option value="200">200 por página</option>
          <option value={clientes.length}>Todos</option>
        </select>
      </div>

      {/* Contenido */}
      <div className="clientes-content">
        {filteredClientes.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchTerm 
                ? 'No hay clientes que coincidan con la búsqueda' 
                : 'No hay clientes registrados'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th style={{width: '50px'}}>ID</th>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Descripción</th>
                    <th style={{width: '120px'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClientes.map(cli => (
                    <tr key={cli.idCliente}>
                      <td className="text-center">{cli.idCliente}</td>
                      <td className="cliente-nombre">
                        {cli.nombreCliente}
                        {cli.estado === 'inactivo' && (
                          <span className="estado-badge estado-inactivo">Inactivo</span>
                        )}
                      </td>
                      <td>{cli.contacto || '-'}</td>
                      <td className="descripcion-col">
                        {cli.descripcion || '-'}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-icon-edit"
                            onClick={() => openModal(cli)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className={`btn-icon-edit ${cli.estado === 'activo' ? 'btn-icon-toggle-off' : 'btn-icon-toggle-on'}`}
                            onClick={() => handleToggleEstado(cli)}
                            title={cli.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            {cli.estado === 'activo' ? '🔴' : '🟢'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <>
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Anterior
                  </button>

                  <div className="pagination-numbers">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                      ) : (
                        <button
                          key={page}
                          className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente →
                  </button>
                </div>

                <div className="pagination-info">
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSaveCliente}>
              <div className="form-group">
                <label>Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={clienteForm.nombreCliente}
                  onChange={(e) => setClienteForm({
                    ...clienteForm,
                    nombreCliente: e.target.value
                  })}
                  placeholder="Ej: Juan Pérez"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Contacto</label>
                <input
                  type="text"
                  value={clienteForm.contacto}
                  onChange={(e) => setClienteForm({
                    ...clienteForm,
                    contacto: e.target.value
                  })}
                  placeholder="Teléfono, email, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  value={clienteForm.descripcion}
                  onChange={(e) => setClienteForm({
                    ...clienteForm,
                    descripcion: e.target.value
                  })}
                  placeholder="Información adicional del cliente..."
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clientes
