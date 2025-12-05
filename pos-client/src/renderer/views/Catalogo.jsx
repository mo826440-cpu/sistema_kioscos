// =====================================================
// CATÁLOGO - Gestión de Marcas y Categorías
// =====================================================

import React, { useState, useEffect } from 'react'
import '../styles/Catalogo.css'

function Catalogo() {
  // Estados
  const [activeTab, setActiveTab] = useState('categorias') // 'categorias' | 'marcas'
  
  // Categorías
  const [categorias, setCategorias] = useState([])
  const [searchCategoria, setSearchCategoria] = useState('')
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState(null)
  const [categoriaForm, setCategoriaForm] = useState({
    nombreCategoria: '',
    descripcion: ''
  })
  
  // Marcas
  const [marcas, setMarcas] = useState([])
  const [searchMarca, setSearchMarca] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [showMarcaModal, setShowMarcaModal] = useState(false)
  const [editingMarca, setEditingMarca] = useState(null)
  const [marcaForm, setMarcaForm] = useState({
    nombreMarca: '',
    descripcion: '',
    idCategoria: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {
    loadCategorias()
    loadMarcas()
  }, [])

  const loadCategorias = async () => {
    try {
      const data = await window.api.getAllCategorias()
      setCategorias(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      showMessage('Error al cargar categorías', 'error')
    }
  }

  const loadMarcas = async () => {
    try {
      const data = await window.api.getAllMarcas()
      setMarcas(data)
    } catch (error) {
      console.error('Error al cargar marcas:', error)
      showMessage('Error al cargar marcas', 'error')
    }
  }

  // =====================================================
  // FUNCIONES DE CATEGORÍAS
  // =====================================================

  const openCategoriaModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria)
      setCategoriaForm({
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion || ''
      })
    } else {
      setEditingCategoria(null)
      setCategoriaForm({
        nombreCategoria: '',
        descripcion: ''
      })
    }
    setShowCategoriaModal(true)
  }

  const closeCategoriaModal = () => {
    setShowCategoriaModal(false)
    setEditingCategoria(null)
    setCategoriaForm({
      nombreCategoria: '',
      descripcion: ''
    })
  }

  const handleSaveCategoria = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingCategoria) {
        result = await window.api.updateCategoria(editingCategoria.idCategoria, categoriaForm)
      } else {
        result = await window.api.createCategoria(categoriaForm)
      }

      if (result.success) {
        showMessage(
          editingCategoria ? '✅ Categoría actualizada' : '✅ Categoría creada',
          'success'
        )
        closeCategoriaModal()
        loadCategorias()
        loadMarcas() // Recargar marcas por si cambió el nombre de la categoría
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al guardar categoría', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategoria = async (categoria) => {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombreCategoria}"?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await window.api.deleteCategoria(categoria.idCategoria)
      if (result.success) {
        showMessage('✅ Categoría eliminada', 'success')
        loadCategorias()
        loadMarcas()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al eliminar categoría', 'error')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // FUNCIONES DE MARCAS
  // =====================================================

  const openMarcaModal = (marca = null) => {
    if (marca) {
      setEditingMarca(marca)
      setMarcaForm({
        nombreMarca: marca.nombreMarca,
        descripcion: marca.descripcion || '',
        idCategoria: marca.idCategoria
      })
    } else {
      setEditingMarca(null)
      setMarcaForm({
        nombreMarca: '',
        descripcion: '',
        idCategoria: categorias.length > 0 ? categorias[0].idCategoria : ''
      })
    }
    setShowMarcaModal(true)
  }

  const closeMarcaModal = () => {
    setShowMarcaModal(false)
    setEditingMarca(null)
    setMarcaForm({
      nombreMarca: '',
      descripcion: '',
      idCategoria: ''
    })
  }

  const handleSaveMarca = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (editingMarca) {
        result = await window.api.updateMarca(editingMarca.idMarca, marcaForm)
      } else {
        result = await window.api.createMarca(marcaForm)
      }

      if (result.success) {
        showMessage(
          editingMarca ? '✅ Marca actualizada' : '✅ Marca creada',
          'success'
        )
        closeMarcaModal()
        loadMarcas()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al guardar marca', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMarca = async (marca) => {
    if (!confirm(`¿Eliminar la marca "${marca.nombreMarca}"?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await window.api.deleteMarca(marca.idMarca)
      if (result.success) {
        showMessage('✅ Marca eliminada', 'success')
        loadMarcas()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al eliminar marca', 'error')
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

  // Filtrar categorías por búsqueda
  const filteredCategorias = categorias.filter(cat =>
    cat.nombreCategoria.toLowerCase().includes(searchCategoria.toLowerCase())
  )

  // Filtrar marcas por búsqueda y categoría
  const filteredMarcas = marcas.filter(marca => {
    const matchSearch = marca.nombreMarca.toLowerCase().includes(searchMarca.toLowerCase())
    const matchCategoria = filterCategoria === 'todas' || marca.idCategoria == filterCategoria
    return matchSearch && matchCategoria
  })

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="catalogo-container">
      <div className="catalogo-header">
        <h1>📚 Catálogo</h1>
        <p>Gestión de categorías y marcas de productos</p>
      </div>

      {/* Mensaje de feedback */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="catalogo-tabs">
        <button
          className={`tab ${activeTab === 'categorias' ? 'active' : ''}`}
          onClick={() => setActiveTab('categorias')}
        >
          📁 Categorías ({categorias.length})
        </button>
        <button
          className={`tab ${activeTab === 'marcas' ? 'active' : ''}`}
          onClick={() => setActiveTab('marcas')}
        >
          🏷️ Marcas ({marcas.length})
        </button>
      </div>

      {/* CONTENIDO: CATEGORÍAS */}
      {activeTab === 'categorias' && (
        <div className="tab-content">
          <div className="content-actions">
            <input
              type="text"
              placeholder="🔍 Buscar categoría..."
              className="search-input"
              value={searchCategoria}
              onChange={(e) => setSearchCategoria(e.target.value)}
            />
            <button
              className="btn-primary"
              onClick={() => openCategoriaModal()}
            >
              + Nueva Categoría
            </button>
          </div>

          <div className="categorias-grid">
            {filteredCategorias.length === 0 ? (
              <div className="empty-state">
                <p>No hay categorías {searchCategoria && 'que coincidan con la búsqueda'}</p>
              </div>
            ) : (
              filteredCategorias.map(cat => (
                <div key={cat.idCategoria} className="categoria-card">
                  <div className="card-header">
                    <h3>{cat.nombreCategoria}</h3>
                    <div className="card-actions">
                      <button
                        className="btn-icon"
                        onClick={() => openCategoriaModal(cat)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDeleteCategoria(cat)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {cat.descripcion && (
                    <p className="card-description">{cat.descripcion}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO: MARCAS */}
      {activeTab === 'marcas' && (
        <div className="tab-content">
          <div className="content-actions">
            <input
              type="text"
              placeholder="🔍 Buscar marca..."
              className="search-input"
              value={searchMarca}
              onChange={(e) => setSearchMarca(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.nombreCategoria}
                </option>
              ))}
            </select>
            <button
              className="btn-primary"
              onClick={() => openMarcaModal()}
              disabled={categorias.length === 0}
            >
              + Nueva Marca
            </button>
          </div>

          {categorias.length === 0 ? (
            <div className="empty-state">
              <p>⚠️ Primero debes crear al menos una categoría</p>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('categorias')}
              >
                Ir a Categorías
              </button>
            </div>
          ) : (
            <div className="marcas-list">
              {filteredMarcas.length === 0 ? (
                <div className="empty-state">
                  <p>No hay marcas {searchMarca && 'que coincidan con la búsqueda'}</p>
                </div>
              ) : (
                <table className="marcas-table">
                  <thead>
                    <tr>
                      <th>Marca</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarcas.map(marca => (
                      <tr key={marca.idMarca}>
                        <td><strong>{marca.nombreMarca}</strong></td>
                        <td>
                          <span className="categoria-badge">
                            {marca.nombreCategoria}
                          </span>
                        </td>
                        <td>{marca.descripcion || '-'}</td>
                        <td className="actions-cell">
                          <button
                            className="btn-icon"
                            onClick={() => openMarcaModal(marca)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteMarca(marca)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CATEGORÍA */}
      {showCategoriaModal && (
        <div className="modal-overlay" onClick={closeCategoriaModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="modal-close" onClick={closeCategoriaModal}>✕</button>
            </div>
            <form onSubmit={handleSaveCategoria}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  required
                  value={categoriaForm.nombreCategoria}
                  onChange={(e) => setCategoriaForm({
                    ...categoriaForm,
                    nombreCategoria: e.target.value
                  })}
                  placeholder="Ej: Bebidas, Snacks, Lácteos..."
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  value={categoriaForm.descripcion}
                  onChange={(e) => setCategoriaForm({
                    ...categoriaForm,
                    descripcion: e.target.value
                  })}
                  placeholder="Descripción opcional..."
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeCategoriaModal}
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

      {/* MODAL: MARCA */}
      {showMarcaModal && (
        <div className="modal-overlay" onClick={closeMarcaModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMarca ? 'Editar Marca' : 'Nueva Marca'}</h2>
              <button className="modal-close" onClick={closeMarcaModal}>✕</button>
            </div>
            <form onSubmit={handleSaveMarca}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  required
                  value={marcaForm.nombreMarca}
                  onChange={(e) => setMarcaForm({
                    ...marcaForm,
                    nombreMarca: e.target.value
                  })}
                  placeholder="Ej: Coca-Cola, Pepsi, Quilmes..."
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Categoría *</label>
                <select
                  required
                  value={marcaForm.idCategoria}
                  onChange={(e) => setMarcaForm({
                    ...marcaForm,
                    idCategoria: parseInt(e.target.value)
                  })}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  value={marcaForm.descripcion}
                  onChange={(e) => setMarcaForm({
                    ...marcaForm,
                    descripcion: e.target.value
                  })}
                  placeholder="Descripción opcional..."
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeMarcaModal}
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

export default Catalogo
