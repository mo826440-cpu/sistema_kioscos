// =====================================================
// PRODUCTOS - Gestión de Productos
// =====================================================

import React, { useState, useEffect } from 'react'
import '../styles/Productos.css'
import { formatCurrency, parseArgentineCurrency } from '../utils/formatters'

function Productos() {
  // Estados
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [filterMarca, setFilterMarca] = useState('todas')
  const [filterStock, setFilterStock] = useState('todos') // 'todos', 'bajo', 'sin'
  const [filterEstado, setFilterEstado] = useState('activo') // 'activo', 'inactivo', 'todos'
  
  const [showModal, setShowModal] = useState(false)
  const [editingProducto, setEditingProducto] = useState(null)
  const [productoForm, setProductoForm] = useState({
    codigoBarras: '',
    nombreProducto: '',
    idCategoria: '',
    idMarca: '',
    precioVenta: '',
    descuento: '0',
    fechaFinalDescuento: '',
    stockActual: '0'
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(100)

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {
    loadCategorias()
    loadMarcas()
  }, [])

  useEffect(() => {
    loadProductos()
  }, [filterEstado])

  const loadProductos = async () => {
    try {
      const data = await window.api.getAllProductos(filterEstado)
      setProductos(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      showMessage('Error al cargar productos', 'error')
    }
  }

  const loadCategorias = async () => {
    try {
      const data = await window.api.getAllCategorias()
      setCategorias(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const loadMarcas = async () => {
    try {
      const data = await window.api.getAllMarcas()
      setMarcas(data)
    } catch (error) {
      console.error('Error al cargar marcas:', error)
    }
  }

  // =====================================================
  // FUNCIONES DE MODAL
  // =====================================================

  const openModal = (producto = null) => {
    if (producto) {
      setEditingProducto(producto)
      setProductoForm({
        codigoBarras: producto.codigoBarras,
        nombreProducto: producto.nombreProducto,
        idCategoria: producto.idCategoria || '',
        idMarca: producto.idMarca || '',
        precioVenta: producto.precioVenta,
        descuento: producto.descuento || '0',
        fechaFinalDescuento: producto.fechaFinalDescuento || '',
        stockActual: producto.stockActual
      })
    } else {
      setEditingProducto(null)
      setProductoForm({
        codigoBarras: '',
        nombreProducto: '',
        idCategoria: '',
        idMarca: '',
        precioVenta: '',
        descuento: '0',
        fechaFinalDescuento: '',
        stockActual: '0'
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProducto(null)
  }

  const handleSaveProducto = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingProducto) {
        result = await window.api.updateProducto(editingProducto.idProducto, productoForm)
      } else {
        result = await window.api.createProducto(productoForm)
      }

      if (result.success) {
        showMessage(
          editingProducto ? '✅ Producto actualizado' : '✅ Producto creado',
          'success'
        )
        closeModal()
        loadProductos()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al guardar producto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEstado = async (producto) => {
    const accion = producto.estado === 'activo' ? 'desactivar' : 'activar'
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} el producto "${producto.nombreProducto}"?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await window.api.toggleProductEstado(producto.idProducto)
      if (result.success) {
        showMessage(`✅ ${result.message}`, 'success')
        loadProductos()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al cambiar estado del producto', 'error')
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

  // Filtrar productos
  const filteredProductos = productos.filter(prod => {
    const matchSearch = 
      prod.codigoBarras.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchCategoria = filterCategoria === 'todas' || prod.idCategoria == filterCategoria
    const matchMarca = filterMarca === 'todas' || prod.idMarca == filterMarca
    
    let matchStock = true
    if (filterStock === 'bajo') matchStock = prod.stockActual > 0 && prod.stockActual <= 10
    if (filterStock === 'sin') matchStock = prod.stockActual === 0
    
    return matchSearch && matchCategoria && matchMarca && matchStock
  })

  // Obtener marcas filtradas por categoría
  const marcasFiltradas = filterCategoria === 'todas' 
    ? marcas 
    : marcas.filter(m => m.idCategoria == filterCategoria)

  // Paginación
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProductos.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategoria, filterMarca, filterStock])

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
    <div className="productos-container">
      <div className="productos-header">
        <div>
          <h1>📦 Productos</h1>
          <p>
            Gestión del catálogo de productos ({filteredProductos.length} de {productos.length})
            {filteredProductos.length > itemsPerPage && (
              <span> · Página {currentPage} de {totalPages}</span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          + Nuevo Producto
        </button>
      </div>

      {/* Mensaje de feedback */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div className="productos-filters">
        <input
          type="text"
          placeholder="🔍 Buscar por código o nombre..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="filter-select"
          value={filterCategoria}
          onChange={(e) => {
            setFilterCategoria(e.target.value)
            setFilterMarca('todas')
          }}
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.idCategoria} value={cat.idCategoria}>
              {cat.nombreCategoria}
            </option>
          ))}
        </select>
        
        <select
          className="filter-select"
          value={filterMarca}
          onChange={(e) => setFilterMarca(e.target.value)}
        >
          <option value="todas">Todas las marcas</option>
          {marcasFiltradas.map(marca => (
            <option key={marca.idMarca} value={marca.idMarca}>
              {marca.nombreMarca}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
        >
          <option value="todos">Todos los stocks</option>
          <option value="bajo">Stock bajo (≤10)</option>
          <option value="sin">Sin stock</option>
        </select>

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
          <option value={productos.length}>Todos</option>
        </select>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista tabla"
          >
            ☰
          </button>
          <button
            className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Vista tarjetas"
          >
            ▦
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="productos-content">
        {filteredProductos.length === 0 ? (
          <div className="empty-state">
            <p>No hay productos {searchTerm && 'que coincidan con la búsqueda'}</p>
          </div>
        ) : viewMode === 'table' ? (
          // VISTA TABLA
          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map(prod => (
                  <tr key={prod.idProducto}>
                    <td><code>{prod.codigoBarras}</code></td>
                    <td>
                      <strong>{prod.nombreProducto}</strong>
                      {prod.descuento > 0 && (
                        <span className="descuento-badge">-{prod.descuento}%</span>
                      )}
                      {prod.estado === 'inactivo' && (
                        <span className="estado-badge estado-inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <span className="categoria-badge">
                        {prod.nombreCategoria || 'Sin categoría'}
                      </span>
                    </td>
                    <td>{prod.nombreMarca || '-'}</td>
                    <td>
                      {prod.descuento > 0 ? (
                        <>
                          <span className="precio-original">{formatCurrency(prod.precioVenta)}</span>
                          <strong className="precio-final"> {formatCurrency(prod.precioFinal)}</strong>
                        </>
                      ) : (
                        <strong>{formatCurrency(prod.precioVenta)}</strong>
                      )}
                    </td>
                    <td>
                      <span className={`stock-badge ${
                        prod.stockActual === 0 ? 'stock-sin' : 
                        prod.stockActual <= 10 ? 'stock-bajo' : 
                        'stock-ok'
                      }`}>
                        {prod.stockActual}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon"
                        onClick={() => openModal(prod)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn-icon ${prod.estado === 'activo' ? 'btn-icon-toggle-off' : 'btn-icon-toggle-on'}`}
                        onClick={() => handleToggleEstado(prod)}
                        title={prod.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      >
                        {prod.estado === 'activo' ? '🔴' : '🟢'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // VISTA TARJETAS
          <div className="productos-grid">
            {currentProducts.map(prod => (
              <div key={prod.idProducto} className="producto-card">
                <div className="card-header">
                  <code className="card-code">{prod.codigoBarras}</code>
                  {prod.descuento > 0 && (
                    <span className="descuento-badge">-{prod.descuento}%</span>
                  )}
                </div>
                <h3 className="card-title">{prod.nombreProducto}</h3>
                <div className="card-details">
                  <div className="detail-row">
                    <span>📁 {prod.nombreCategoria || 'Sin categoría'}</span>
                  </div>
                  <div className="detail-row">
                    <span>🏷️ {prod.nombreMarca || 'Sin marca'}</span>
                  </div>
                  <div className="detail-row">
                    <span>💰 </span>
                    {prod.descuento > 0 ? (
                      <>
                        <span className="precio-original">{formatCurrency(prod.precioVenta)}</span>
                        <strong className="precio-final"> {formatCurrency(prod.precioFinal)}</strong>
                      </>
                    ) : (
                      <strong>{formatCurrency(prod.precioVenta)}</strong>
                    )}
                  </div>
                  <div className="detail-row">
                    <span>📦 </span>
                    <span className={`stock-badge ${
                      prod.stockActual === 0 ? 'stock-sin' : 
                      prod.stockActual <= 10 ? 'stock-bajo' : 
                      'stock-ok'
                    }`}>
                      {prod.stockActual} unidades
                    </span>
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => openModal(prod)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className={prod.estado === 'activo' ? 'btn-danger' : 'btn-success'}
                    onClick={() => handleToggleEstado(prod)}
                  >
                    {prod.estado === 'activo' ? '🔴 Desactivar' : '🟢 Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {filteredProductos.length > 0 && totalPages > 1 && (
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
        )}

        {/* Info de paginación */}
        {filteredProductos.length > 0 && (
          <div className="pagination-info">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} productos
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSaveProducto}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Código de Barras *</label>
                  <input
                    type="text"
                    required
                    value={productoForm.codigoBarras}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      codigoBarras: e.target.value
                    })}
                    placeholder="7790310981011"
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    value={productoForm.nombreProducto}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      nombreProducto: e.target.value
                    })}
                    placeholder="Coca Cola 2.25L"
                  />
                </div>
                
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={productoForm.idCategoria}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      idCategoria: e.target.value,
                      idMarca: '' // Reset marca al cambiar categoría
                    })}
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombreCategoria}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Marca</label>
                  <select
                    value={productoForm.idMarca}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      idMarca: e.target.value
                    })}
                    disabled={!productoForm.idCategoria}
                  >
                    <option value="">Sin marca</option>
                    {marcas
                      .filter(m => !productoForm.idCategoria || m.idCategoria == productoForm.idCategoria)
                      .map(marca => (
                        <option key={marca.idMarca} value={marca.idMarca}>
                          {marca.nombreMarca}
                        </option>
                      ))}
                  </select>
                  {!productoForm.idCategoria && (
                    <small>Selecciona una categoría primero</small>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Precio de Venta *</label>
                  <input
                    type="text"
                    required
                    value={productoForm.precioVenta ? parseFloat(productoForm.precioVenta).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      precioVenta: parseArgentineCurrency(e.target.value)
                    })}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock Actual *</label>
                  <input
                    type="number"
                    required
                    value={productoForm.stockActual}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      stockActual: e.target.value
                    })}
                    placeholder="100"
                  />
                </div>
                
                <div className="form-group">
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={productoForm.descuento}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      descuento: e.target.value
                    })}
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Fecha Final Descuento</label>
                  <input
                    type="date"
                    value={productoForm.fechaFinalDescuento}
                    onChange={(e) => setProductoForm({
                      ...productoForm,
                      fechaFinalDescuento: e.target.value
                    })}
                    disabled={!productoForm.descuento || productoForm.descuento == 0}
                  />
                </div>
              </div>
              
              {productoForm.descuento > 0 && productoForm.precioVenta && (
                <div className="precio-preview">
                  <p>
                    <strong>Precio final:</strong> {formatCurrency(
                      parseFloat(productoForm.precioVenta) * 
                      (1 - parseFloat(productoForm.descuento) / 100)
                    )}
                  </p>
                </div>
              )}
              
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

export default Productos
