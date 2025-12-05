// =====================================================
// PROVEEDORES - Gestión de Proveedores
// =====================================================

import React, { useState, useEffect } from 'react'
import '../styles/Proveedores.css'

function Proveedores() {
  // Estados
  const [proveedores, setProveedores] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showModal, setShowModal] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState(null)
  const [proveedorForm, setProveedorForm] = useState({
    nombreProveedor: '',
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
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const data = await window.api.getAllProveedores()
      setProveedores(data)
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
      showMessage('Error al cargar proveedores', 'error')
    }
  }

  // =====================================================
  // FUNCIONES DE MODAL
  // =====================================================

  const openModal = (proveedor = null) => {
    if (proveedor) {
      setEditingProveedor(proveedor)
      setProveedorForm({
        nombreProveedor: proveedor.nombreProveedor,
        contacto: proveedor.contacto || '',
        descripcion: proveedor.descripcion || ''
      })
    } else {
      setEditingProveedor(null)
      setProveedorForm({
        nombreProveedor: '',
        contacto: '',
        descripcion: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProveedor(null)
  }

  const handleSaveProveedor = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingProveedor) {
        result = await window.api.updateProveedor(editingProveedor.idProveedor, proveedorForm)
      } else {
        result = await window.api.createProveedor(proveedorForm)
      }

      if (result.success) {
        showMessage(
          editingProveedor ? '✅ Proveedor actualizado' : '✅ Proveedor creado',
          'success'
        )
        closeModal()
        loadProveedores()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al guardar proveedor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProveedor = async (proveedor) => {
    if (!confirm(`¿Eliminar el proveedor "${proveedor.nombreProveedor}"?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await window.api.deleteProveedor(proveedor.idProveedor)
      if (result.success) {
        showMessage('✅ Proveedor eliminado', 'success')
        loadProveedores()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al eliminar proveedor', 'error')
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

  // Filtrar proveedores por búsqueda
  const filteredProveedores = proveedores.filter(prov =>
    prov.nombreProveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prov.contacto && prov.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Paginación
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProveedores = itemsPerPage >= filteredProveedores.length 
    ? filteredProveedores 
    : filteredProveedores.slice(startIndex, endIndex)

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
    <div className="proveedores-container">
      <div className="proveedores-header">
        <div>
          <h1>🚚 Proveedores</h1>
          <p>
            Gestión de proveedores ({filteredProveedores.length} de {proveedores.length})
            {totalPages > 1 && (
              <span> · Página {currentPage} de {totalPages}</span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          + Nuevo Proveedor
        </button>
      </div>

      {/* Mensaje de feedback */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div className="proveedores-filters">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o contacto..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
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
          <option value={proveedores.length}>Todos</option>
        </select>
      </div>

      {/* Contenido */}
      <div className="proveedores-content">
        {filteredProveedores.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchTerm 
                ? 'No hay proveedores que coincidan con la búsqueda' 
                : 'No hay proveedores registrados'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="proveedores-table">
                <thead>
                  <tr>
                    <th style={{width: '50px'}}>ID</th>
                    <th>Proveedor</th>
                    <th>Contacto</th>
                    <th>Descripción</th>
                    <th style={{width: '120px'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProveedores.map(prov => (
                    <tr key={prov.idProveedor}>
                      <td className="text-center">{prov.idProveedor}</td>
                      <td className="proveedor-nombre">{prov.nombreProveedor}</td>
                      <td>{prov.contacto || '-'}</td>
                      <td className="descripcion-col">
                        {prov.descripcion || '-'}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-icon-edit"
                            onClick={() => openModal(prov)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon-delete"
                            onClick={() => handleDeleteProveedor(prov)}
                            title="Eliminar"
                          >
                            🗑️
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
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProveedores.length)} de {filteredProveedores.length} proveedores
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
              <h2>{editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSaveProveedor}>
              <div className="form-group">
                <label>Nombre del Proveedor *</label>
                <input
                  type="text"
                  required
                  value={proveedorForm.nombreProveedor}
                  onChange={(e) => setProveedorForm({
                    ...proveedorForm,
                    nombreProveedor: e.target.value
                  })}
                  placeholder="Ej: Distribuidora Norte"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Contacto</label>
                <input
                  type="text"
                  value={proveedorForm.contacto}
                  onChange={(e) => setProveedorForm({
                    ...proveedorForm,
                    contacto: e.target.value
                  })}
                  placeholder="Teléfono, email, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  value={proveedorForm.descripcion}
                  onChange={(e) => setProveedorForm({
                    ...proveedorForm,
                    descripcion: e.target.value
                  })}
                  placeholder="Información adicional del proveedor..."
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

export default Proveedores
