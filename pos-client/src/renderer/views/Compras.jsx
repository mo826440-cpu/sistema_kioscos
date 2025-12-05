// =====================================================
// COMPRAS - Gestión de Compras
// =====================================================

import React, { useState, useEffect } from 'react'
import '../styles/Compras.css'
import { formatCurrency, parseArgentineCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

function Compras() {
  const { user } = useAuth()
  // Estados
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompra, setSelectedCompra] = useState(null)
  
  // Estados para filtros avanzados
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    proveedores: [],
    facturacion: '',
    estados: []
  })
  const [showFiltro, setShowFiltro] = useState({
    fecha: false,
    proveedor: false,
    facturacion: false,
    estado: false
  })
  
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCompra, setEditingCompra] = useState(null)
  
  const [compraForm, setCompraForm] = useState({
    facturacion: 'No especificado',
    observaciones: ''
  })
  
  const [productosCompra, setProductosCompra] = useState([])
  const [pagosCompra, setPagosCompra] = useState([{
    tipoPago: 'Efectivo',
    montoPago: 0,
    observaciones: ''
  }])
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Estados para búsqueda de productos
  const [productosBusqueda, setProductosBusqueda] = useState({})
  const [productosSugerencias, setProductosSugerencias] = useState({})
  
  // Estado para modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [compraToDelete, setCompraToDelete] = useState(null)

  // =====================================================
  // CERRAR FILTROS AL HACER CLIC FUERA
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.th-filtro')) {
        setShowFiltro({
          fecha: false,
          proveedor: false,
          facturacion: false,
          estado: false
        })
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // =====================================================
  // ATAJOS DE TECLADO
  // =====================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2 - Abrir Nueva Compra
      if (e.key === 'F2' && !showFormModal && !showDetalleModal) {
        e.preventDefault()
        openFormModal()
      }
      
      // Control + Enter - Guardar Compra (solo si el modal está abierto)
      if (e.ctrlKey && e.key === 'Enter' && showFormModal) {
        e.preventDefault()
        // Simular click en el botón de guardar
        document.querySelector('.modal-footer .btn-primary')?.click()
      }
      
      // Control + P - Agregar Pago (solo si el modal está abierto y no es editando)
      if (e.ctrlKey && e.key === 'p' && showFormModal) {
        e.preventDefault()
        agregarPago()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFormModal, showDetalleModal, editingCompra])

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {
    loadCompras()
    loadProveedores()
    loadProductos()
  }, [])

  const loadCompras = async () => {
    setLoading(true)
    try {
      const data = await window.api.getAllCompras()
      setCompras(data)
    } catch (error) {
      console.error('Error al cargar compras:', error)
      showMessage('Error al cargar compras', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadProveedores = async () => {
    try {
      const data = await window.api.getAllProveedores('activo')
      setProveedores(data)
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
    }
  }

  const loadProductos = async () => {
    try {
      const data = await window.api.getAllProductos('activo')
      setProductos(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const loadCompraDetalle = async (idCompra) => {
    try {
      const data = await window.api.getCompraById(idCompra)
      setSelectedCompra(data)
      setShowDetalleModal(true)
    } catch (error) {
      console.error('Error al cargar detalle:', error)
      showMessage('Error al cargar detalle de compra', 'error')
    }
  }

  // =====================================================
  // MODAL DE FORMULARIO
  // =====================================================

  const openFormModal = async (compra = null) => {
    if (compra) {
      // Editar: cargar datos de la compra
      // Recalcular totalCompra y totalDeuda correctamente
      const detalleCompleto = await window.api.getCompraById(compra.idCompra)
      const totalCompra = (detalleCompleto.detalles || []).reduce((sum, p) => sum + (p.precioTotal || 0), 0)
      const totalPagado = (detalleCompleto.pagos || []).reduce((sum, p) => sum + (p.montoPago || 0), 0)
      const totalDeuda = totalCompra - totalPagado
      
      const compraActualizada = {
        ...compra,
        totalCompra,
        totalPagado,
        totalDeuda
      }
      
      setEditingCompra(compraActualizada)
      setCompraForm({
        facturacion: compra.facturacion,
        observaciones: compra.observaciones || ''
      })
      
      // Cargar pagos existentes
      try {
        setPagosCompra(detalleCompleto.pagos || [])
      } catch (error) {
        console.error('Error al cargar pagos:', error)
        setPagosCompra([])
      }
    } else {
      // Nueva compra
      setEditingCompra(null)
      setCompraForm({
        facturacion: 'No especificado',
        observaciones: ''
      })
      setProductosCompra([])
      setPagosCompra([{
        tipoPago: 'Efectivo',
        montoPago: 0,
        observaciones: ''
      }])
    }
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingCompra(null)
  }

  // =====================================================
  // MANEJO DE PRODUCTOS
  // =====================================================

  const agregarProducto = () => {
    const newIndex = productosCompra.length
    setProductosCompra([...productosCompra, {
      codigoBarras: '',
      nombreProducto: '',
      idProveedor: '',
      unidadesCompradas: 1,
      precioUnitario: 0,
      precioTotal: 0
    }])
    setProductosBusqueda({ ...productosBusqueda, [newIndex]: '' })
    setProductosSugerencias({ ...productosSugerencias, [newIndex]: [] })
  }

  const removerProducto = (index) => {
    setProductosCompra(productosCompra.filter((_, i) => i !== index))
  }

  const buscarProducto = (index, busqueda) => {
    setProductosBusqueda({ ...productosBusqueda, [index]: busqueda })
    
    if (busqueda.trim() === '') {
      setProductosSugerencias({ ...productosSugerencias, [index]: [] })
      return
    }
    
    // Buscar por código de barras exacto primero
    const productoExacto = productos.find(p => p.codigoBarras === busqueda)
    if (productoExacto) {
      seleccionarProducto(index, productoExacto)
      return
    }
    
    // Buscar por código de barras o nombre
    const resultados = productos.filter(p => 
      p.codigoBarras.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombreProducto.toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 10) // Limitar a 10 resultados
    
    setProductosSugerencias({ ...productosSugerencias, [index]: resultados })
  }
  
  const handleBusquedaKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const busqueda = productosBusqueda[index]
      
      // Si hay sugerencias, seleccionar la primera
      if (productosSugerencias[index] && productosSugerencias[index].length > 0) {
        seleccionarProducto(index, productosSugerencias[index][0])
      }
    } else if (e.key === 'Escape') {
      // Cerrar sugerencias con Escape
      setProductosSugerencias({ ...productosSugerencias, [index]: [] })
    }
  }
  
  const seleccionarProducto = (index, producto) => {
    const nuevosProductos = [...productosCompra]
    nuevosProductos[index].codigoBarras = producto.codigoBarras
    nuevosProductos[index].nombreProducto = producto.nombreProducto
    setProductosCompra(nuevosProductos)
    
    // Limpiar búsqueda y sugerencias
    setProductosBusqueda({ ...productosBusqueda, [index]: producto.nombreProducto })
    setProductosSugerencias({ ...productosSugerencias, [index]: [] })
  }

  const actualizarProducto = (index, field, value) => {
    const nuevosProductos = [...productosCompra]
    
    // Mantener valores como están mientras se editan
    // La conversión se hará al guardar
    if (field === 'unidadesCompradas') {
      nuevosProductos[index][field] = parseInt(value) || 0
    } else {
      nuevosProductos[index][field] = value
    }
    
    // Autocompletar datos del producto si se selecciona uno
    if (field === 'codigoBarras') {
      const producto = productos.find(p => p.codigoBarras === value)
      if (producto) {
        nuevosProductos[index].nombreProducto = producto.nombreProducto
      }
    }
    
    // Calcular precio total
    if (field === 'unidadesCompradas' || field === 'precioUnitario') {
      const unidades = parseInt(nuevosProductos[index].unidadesCompradas) || 0
      const precio = parseArgentineCurrency(nuevosProductos[index].precioUnitario)
      nuevosProductos[index].precioTotal = unidades * precio
    }
    
    setProductosCompra(nuevosProductos)
  }

  // =====================================================
  // MANEJO DE PAGOS
  // =====================================================

  const agregarPago = () => {
    setPagosCompra([...pagosCompra, {
      tipoPago: 'Efectivo',
      montoPago: 0,
      observaciones: '',
      isNew: true // Marca para identificar pagos nuevos en modo edición
    }])
  }

  const removerPago = (index) => {
    const pago = pagosCompra[index]
    
    // En modo edición, solo permitir eliminar pagos nuevos
    if (editingCompra && !pago.isNew) {
      return
    }
    
    // En modo creación, mantener al menos un pago
    if (!editingCompra && pagosCompra.length <= 1) {
      return
    }
    
    // En modo edición, permitir eliminar si hay al menos un pago nuevo
    if (editingCompra && pagosCompra.filter(p => p.isNew).length <= 1) {
      return
    }
    
    setPagosCompra(pagosCompra.filter((_, i) => i !== index))
  }

  const actualizarPago = (index, field, value) => {
    const nuevosPagos = [...pagosCompra]
    // Para montoPago, mantener como string mientras se edita
    // Solo se convierte a número al guardar
    nuevosPagos[index][field] = value
    setPagosCompra(nuevosPagos)
  }

  // =====================================================
  // GUARDAR COMPRA
  // =====================================================

  const handleSaveCompra = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingCompra) {
        // Actualizar datos generales
        const result = await window.api.updateCompra(editingCompra.idCompra, compraForm)
        if (!result.success) {
          showMessage(`❌ ${result.error}`, 'error')
          setLoading(false)
          return
        }

        // Agregar pagos nuevos (los que tienen isNew = true)
        const pagosNuevos = pagosCompra.filter(p => p.isNew)
        
        if (pagosNuevos.length > 0) {
          for (const pago of pagosNuevos) {
            const pagoLimpio = {
              tipoPago: pago.tipoPago,
              montoPago: parseArgentineCurrency(pago.montoPago),
              observaciones: pago.observaciones || '',
              fechaPago: new Date().toISOString()
            }
            
            const resultPago = await window.api.addPagoCompra(editingCompra.idCompra, pagoLimpio)
            if (!resultPago.success) {
              showMessage(`❌ Error al agregar pago: ${resultPago.error}`, 'error')
              setLoading(false)
              return
            }
          }
          showMessage('✅ Compra actualizada y pagos agregados', 'success')
        } else {
          showMessage('✅ Compra actualizada', 'success')
        }
        
        closeFormModal()
        loadCompras()
      } else {
        // Validaciones
        if (productosCompra.length === 0) {
          showMessage('❌ Debe agregar al menos un producto', 'error')
          setLoading(false)
          return
        }

        // Convertir valores a números para evitar problemas
        const productosLimpios = productosCompra.map(p => ({
          ...p,
          unidadesCompradas: parseInt(p.unidadesCompradas) || 0,
          precioUnitario: parseArgentineCurrency(p.precioUnitario),
          precioTotal: parseArgentineCurrency(p.precioTotal)
        }))

        const pagosLimpios = pagosCompra.map(p => ({
          ...p,
          montoPago: parseArgentineCurrency(p.montoPago)
        }))

        // Agregar información de auditoría
        const compraConAuditoria = {
          ...compraForm,
          usuarioRegistro: user?.username || user?.nombreUsuario || 'Sistema'
        }
        
        // Crear nueva compra
        const result = await window.api.createCompra(compraConAuditoria, productosLimpios, pagosLimpios)
        if (result.success) {
          showMessage('✅ Compra registrada correctamente', 'success')
          closeFormModal()
          loadCompras()
        } else {
          showMessage(`❌ ${result.error}`, 'error')
        }
      }
    } catch (error) {
      showMessage('❌ Error al guardar compra', 'error')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // ELIMINAR COMPRA
  // =====================================================

  const openConfirmDelete = (compra) => {
    setCompraToDelete(compra)
    setShowConfirmModal(true)
  }

  const closeConfirmModal = () => {
    setShowConfirmModal(false)
    setCompraToDelete(null)
  }

  const handleDeleteCompra = async () => {
    if (!compraToDelete) return

    setLoading(true)
    setShowConfirmModal(false)
    
    try {
      const result = await window.api.deleteCompra(compraToDelete.idCompra)
      if (result.success) {
        showMessage('✅ Compra eliminada y stock revertido', 'success')
        loadCompras()
      } else {
        showMessage(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      showMessage('❌ Error al eliminar compra', 'error')
    } finally {
      setLoading(false)
      setCompraToDelete(null)
    }
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const closeDetalleModal = () => {
    setShowDetalleModal(false)
    setSelectedCompra(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calcularTotalCompra = () => {
    return productosCompra.reduce((sum, p) => sum + (parseFloat(p.precioTotal) || 0), 0)
  }

  const calcularTotalPagos = () => {
    return pagosCompra.reduce((sum, p) => sum + parseArgentineCurrency(p.montoPago), 0)
  }

  // =====================================================
  // FILTROS AVANZADOS
  // =====================================================

  const toggleFiltro = (filtro) => {
    setShowFiltro({
      fecha: false,
      proveedor: false,
      facturacion: false,
      estado: false,
      [filtro]: !showFiltro[filtro]
    })
  }

  const aplicarFiltroEstado = (estado) => {
    const nuevosEstados = filtros.estados.includes(estado)
      ? filtros.estados.filter(e => e !== estado)
      : [...filtros.estados, estado]
    
    setFiltros({ ...filtros, estados: nuevosEstados })
  }

  const aplicarFiltroProveedor = (proveedor) => {
    const nuevosProveedores = filtros.proveedores.includes(proveedor)
      ? filtros.proveedores.filter(p => p !== proveedor)
      : [...filtros.proveedores, proveedor]
    
    setFiltros({ ...filtros, proveedores: nuevosProveedores })
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      proveedores: [],
      facturacion: '',
      estados: []
    })
  }

  const tienesFiltrosActivos = () => {
    return filtros.fechaDesde || filtros.fechaHasta || 
           filtros.proveedores.length > 0 || 
           filtros.facturacion || 
           filtros.estados.length > 0
  }

  // Obtener lista única de proveedores
  const proveedoresUnicos = [...new Set(
    compras
      .map(c => c.proveedores)
      .filter(p => p && p !== 'Sin especificar')
      .flatMap(p => p.split(',').map(x => x.trim()))
  )].sort()

  // Obtener lista única de facturaciones
  const facturacionesUnicas = [...new Set(
    compras.map(c => c.facturacion).filter(f => f)
  )].sort()

  // Función auxiliar para convertir fecha de SQLite a objeto Date
  const parsearFechaSQLite = (fechaStr) => {
    if (!fechaStr) return null
    // Formato SQLite: "YYYY-MM-DD HH:MM:SS" o "DD/MM/YYYY"
    // Extraer solo la parte de la fecha
    let fecha = fechaStr.split(' ')[0]
    
    // Si viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
    if (fecha.includes('/')) {
      const partes = fecha.split('/')
      if (partes.length === 3) {
        fecha = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`
      }
    }
    
    return new Date(fecha + 'T00:00:00')
  }

  // Filtrar compras por búsqueda y filtros avanzados
  const filteredCompras = compras.filter(compra => {
    // Filtro por búsqueda general
    const matchSearch = searchTerm === '' || 
      compra.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.idCompra?.toString().includes(searchTerm)
    
    if (!matchSearch) return false

    // Filtro por fecha desde
    if (filtros.fechaDesde) {
      const fechaCompra = parsearFechaSQLite(compra.fechaCompra)
      const fechaDesde = new Date(filtros.fechaDesde + 'T00:00:00')
      
      if (fechaCompra && fechaCompra < fechaDesde) return false
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta) {
      const fechaCompra = parsearFechaSQLite(compra.fechaCompra)
      const fechaHasta = new Date(filtros.fechaHasta + 'T00:00:00')
      
      if (fechaCompra && fechaCompra > fechaHasta) return false
    }

    // Filtro por proveedores
    if (filtros.proveedores.length > 0) {
      const proveedoresCompra = compra.proveedores?.split(',').map(p => p.trim()) || []
      const tieneProveedor = filtros.proveedores.some(p => 
        proveedoresCompra.some(pc => pc.includes(p))
      )
      if (!tieneProveedor) return false
    }

    // Filtro por facturación
    if (filtros.facturacion) {
      if (!compra.facturacion?.toLowerCase().includes(filtros.facturacion.toLowerCase())) {
        return false
      }
    }

    // Filtro por estados
    if (filtros.estados.length > 0) {
      if (!filtros.estados.includes(compra.estadoPago)) return false
    }

    return true
  })

  const getEstadoBadgeClass = (estado) => {
    switch(estado) {
      case 'Pagado': return 'estado-pagado'
      case 'Parcial': return 'estado-parcial'
      case 'Pendiente': return 'estado-pendiente'
      default: return ''
    }
  }

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const calcularEstadisticas = () => {
    const totalCompras = filteredCompras.length
    const comprasConDeuda = filteredCompras.filter(c => 
      c.estadoPago === 'Pendiente' || c.estadoPago === 'Parcial'
    )
    const cantidadConDeuda = comprasConDeuda.length
    const montoTotalDeuda = comprasConDeuda.reduce((sum, c) => 
      sum + (parseFloat(c.totalDeuda) || 0), 0
    )

    return {
      totalCompras,
      cantidadConDeuda,
      montoTotalDeuda
    }
  }

  const estadisticas = calcularEstadisticas()

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="compras-container">
      <div className="compras-header">
        <div>
          <h1>🛒 Compras</h1>
          <p>Historial de compras a proveedores ({filteredCompras.length} de {compras.length})</p>
        </div>
        <button className="btn-primary" onClick={() => openFormModal()}>
          + Nueva Compra
        </button>
      </div>

      {/* Panel de estadísticas */}
      <div className="estadisticas-panel">
        <div className="estadistica-card card-total">
          <div className="estadistica-icono">📊</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.totalCompras}</div>
            <div className="estadistica-label">Compras Mostradas</div>
          </div>
        </div>

        <div className="estadistica-card card-deuda">
          <div className="estadistica-icono">⚠️</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.cantidadConDeuda}</div>
            <div className="estadistica-label">Con Deuda</div>
            <div className="estadistica-sublabel">
              (Parcial + Pendiente)
            </div>
          </div>
        </div>

        <div className="estadistica-card card-monto">
          <div className="estadistica-icono">💰</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{formatCurrency(estadisticas.montoTotalDeuda)}</div>
            <div className="estadistica-label">Total Deuda</div>
            <div className="estadistica-sublabel">
              {estadisticas.cantidadConDeuda > 0 
                ? `${formatCurrency(estadisticas.montoTotalDeuda / estadisticas.cantidadConDeuda)} promedio`
                : 'Sin deudas'}
            </div>
          </div>
        </div>
      </div>

      {/* Referencias de atajos de teclado */}
      <div className="atajos-referencia">
        <div className="atajo-item">
          <kbd>F2</kbd>
          <span>Nueva Compra</span>
        </div>
        <div className="atajo-item">
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
          <span>Guardar Compra</span>
        </div>
        <div className="atajo-item">
          <kbd>Ctrl</kbd> + <kbd>P</kbd>
          <span>Agregar Pago</span>
        </div>
      </div>

      {/* Mensaje de feedback */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div className="compras-filters">
        <input
          type="text"
          placeholder="🔍 Buscar por ID u observaciones..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {tienesFiltrosActivos() && (
          <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="compras-content">
        {loading && !showFormModal ? (
          <div className="loading-state">Cargando compras...</div>
        ) : filteredCompras.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchTerm 
                ? 'No hay compras que coincidan con la búsqueda' 
                : 'No hay compras registradas'
              }
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="compras-table">
              <thead>
                <tr>
                  <th style={{width: '60px'}}>ID</th>
                  <th>
                    <div className="th-filtro">
                      <span>Fecha y Hora</span>
                      <button 
                        className={`btn-filtro ${filtros.fechaDesde || filtros.fechaHasta ? 'active' : ''}`}
                        onClick={() => toggleFiltro('fecha')}
                      >
                        ▼
                      </button>
                      {showFiltro.fecha && (
                        <div className="filtro-menu" onClick={(e) => e.stopPropagation()}>
                          <div className="filtro-menu-header">Filtrar por Fecha</div>
                          <div className="filtro-fecha-content">
                            <div className="filtro-fecha-group">
                              <label>Desde:</label>
                              <input
                                type="date"
                                value={filtros.fechaDesde}
                                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                              />
                            </div>
                            <div className="filtro-fecha-group">
                              <label>Hasta:</label>
                              <input
                                type="date"
                                value={filtros.fechaHasta}
                                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-filtro">
                      <span>Proveedor(es)</span>
                      <button 
                        className={`btn-filtro ${filtros.proveedores.length > 0 ? 'active' : ''}`}
                        onClick={() => toggleFiltro('proveedor')}
                      >
                        ▼
                      </button>
                      {showFiltro.proveedor && (
                        <div className="filtro-menu" onClick={(e) => e.stopPropagation()}>
                          <div className="filtro-menu-header">
                            Filtrar por Proveedor
                            {filtros.proveedores.length > 0 && (
                              <span className="filtro-count">({filtros.proveedores.length})</span>
                            )}
                          </div>
                          <div className="filtro-checkboxes">
                            {proveedoresUnicos.length > 0 ? (
                              proveedoresUnicos.map(prov => (
                                <label key={prov} className="filtro-checkbox-item">
                                  <input
                                    type="checkbox"
                                    checked={filtros.proveedores.includes(prov)}
                                    onChange={() => aplicarFiltroProveedor(prov)}
                                  />
                                  <span>{prov}</span>
                                </label>
                              ))
                            ) : (
                              <div className="filtro-empty">No hay proveedores</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-filtro">
                      <span>Facturación</span>
                      <button 
                        className={`btn-filtro ${filtros.facturacion ? 'active' : ''}`}
                        onClick={() => toggleFiltro('facturacion')}
                      >
                        ▼
                      </button>
                      {showFiltro.facturacion && (
                        <div className="filtro-menu" onClick={(e) => e.stopPropagation()}>
                          <div className="filtro-menu-header">Filtrar por Facturación</div>
                          <div className="filtro-search-content">
                            <input
                              type="text"
                              placeholder="Buscar facturación..."
                              value={filtros.facturacion}
                              onChange={(e) => setFiltros({ ...filtros, facturacion: e.target.value })}
                              autoFocus
                            />
                            {facturacionesUnicas.length > 0 && (
                              <div className="filtro-suggestions">
                                {facturacionesUnicas
                                  .filter(f => !filtros.facturacion || f.toLowerCase().includes(filtros.facturacion.toLowerCase()))
                                  .map(fact => (
                                    <div
                                      key={fact}
                                      className="filtro-suggestion-item"
                                      onClick={() => setFiltros({ ...filtros, facturacion: fact })}
                                    >
                                      {fact}
                                    </div>
                                  ))
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Pagado</th>
                  <th>Deuda</th>
                  <th>
                    <div className="th-filtro">
                      <span>Estado</span>
                      <button 
                        className={`btn-filtro ${filtros.estados.length > 0 ? 'active' : ''}`}
                        onClick={() => toggleFiltro('estado')}
                      >
                        ▼
                      </button>
                      {showFiltro.estado && (
                        <div className="filtro-menu" onClick={(e) => e.stopPropagation()}>
                          <div className="filtro-menu-header">
                            Filtrar por Estado
                            {filtros.estados.length > 0 && (
                              <span className="filtro-count">({filtros.estados.length})</span>
                            )}
                          </div>
                          <div className="filtro-checkboxes">
                            <label className="filtro-checkbox-item">
                              <input
                                type="checkbox"
                                checked={filtros.estados.includes('Pendiente')}
                                onChange={() => aplicarFiltroEstado('Pendiente')}
                              />
                              <span>Pendiente</span>
                            </label>
                            <label className="filtro-checkbox-item">
                              <input
                                type="checkbox"
                                checked={filtros.estados.includes('Parcial')}
                                onChange={() => aplicarFiltroEstado('Parcial')}
                              />
                              <span>Parcial</span>
                            </label>
                            <label className="filtro-checkbox-item">
                              <input
                                type="checkbox"
                                checked={filtros.estados.includes('Pagado')}
                                onChange={() => aplicarFiltroEstado('Pagado')}
                              />
                              <span>Pagado</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th style={{width: '150px'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompras.map(compra => (
                  <tr key={compra.idCompra}>
                    <td className="text-center">{compra.idCompra}</td>
                    <td>
                      <div>{formatDateTime(compra.fechaCompra)}</div>
                      {compra.usuarioRegistro && (
                        <small style={{color: '#666', fontSize: '11px'}}>
                          Por: {compra.usuarioRegistro}
                        </small>
                      )}
                    </td>
                    <td>{compra.proveedores || 'Sin especificar'}</td>
                    <td>{compra.facturacion}</td>
                    <td className="text-center">{compra.cantidadProductos || 0}</td>
                    <td><strong>{formatCurrency(compra.totalCompra)}</strong></td>
                    <td className="text-success">{formatCurrency(compra.totalPagado)}</td>
                    <td className="text-danger">{formatCurrency(compra.totalDeuda)}</td>
                    <td>
                      <span className={`estado-badge ${getEstadoBadgeClass(compra.estadoPago)}`}>
                        {compra.estadoPago}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn-icon-view"
                          onClick={() => loadCompraDetalle(compra.idCompra)}
                          title="Ver detalle"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-icon-edit"
                          onClick={() => openFormModal(compra)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon-delete"
                          onClick={() => openConfirmDelete(compra)}
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
        )}
      </div>

      {/* MODAL DE FORMULARIO */}
      {showFormModal && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal-content modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingCompra 
                  ? `Editar Compra #${editingCompra.idCompra}${editingCompra.totalDeuda > 0 ? ' - Agregar Pagos' : ''}` 
                  : 'Nueva Compra'
                }
              </h2>
              <button className="modal-close" onClick={closeFormModal}>✕</button>
            </div>
            
            <form onSubmit={handleSaveCompra}>
              <div className="modal-body">
                {/* Datos generales */}
                <div className="form-section">
                  <h3>📝 Información General</h3>
                  <p style={{color: '#666', fontSize: '13px', marginBottom: '15px'}}>
                    ℹ️ La fecha y hora se registrarán automáticamente al guardar
                  </p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Facturación</label>
                      <input
                        type="text"
                        value={compraForm.facturacion}
                        onChange={(e) => setCompraForm({ ...compraForm, facturacion: e.target.value })}
                        placeholder="No especificado"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      rows="2"
                      value={compraForm.observaciones}
                      onChange={(e) => setCompraForm({ ...compraForm, observaciones: e.target.value })}
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>

                {/* Productos - Solo en modo creación */}
                {!editingCompra && (
                  <div className="form-section">
                      <div className="section-header">
                        <h3>📦 Productos</h3>
                        <button type="button" className="btn-add" onClick={agregarProducto}>
                          + Agregar Producto
                        </button>
                      </div>
                      
                      {productosCompra.length === 0 ? (
                        <p className="empty-message">No hay productos agregados</p>
                      ) : (
                        <div className="productos-list">
                          {productosCompra.map((prod, index) => (
                            <div key={index} className="producto-item">
                              <div className="producto-row">
                                <div className="form-group-inline producto-search-container">
                                  <label>Producto * (Código de barras o nombre)</label>
                                  <div className="producto-search-wrapper">
                                    <input
                                      type="text"
                                      required
                                      placeholder="🔍 Escribir código de barras o buscar por nombre..."
                                      value={productosBusqueda[index] || prod.nombreProducto || ''}
                                      onChange={(e) => buscarProducto(index, e.target.value)}
                                      onKeyDown={(e) => handleBusquedaKeyDown(index, e)}
                                      autoComplete="off"
                                    />
                                    {prod.codigoBarras && (
                                      <span className="producto-seleccionado">✓ Seleccionado</span>
                                    )}
                                  </div>
                                  {productosSugerencias[index] && productosSugerencias[index].length > 0 && (
                                    <div className="sugerencias-lista">
                                      {productosSugerencias[index].map(p => (
                                        <div
                                          key={p.codigoBarras}
                                          className="sugerencia-item"
                                          onClick={() => seleccionarProducto(index, p)}
                                        >
                                          <strong>{p.nombreProducto}</strong>
                                          <span className="sugerencia-codigo">({p.codigoBarras})</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="form-group-inline">
                                  <label>Proveedor *</label>
                                  <select
                                    required
                                    value={prod.idProveedor}
                                    onChange={(e) => actualizarProducto(index, 'idProveedor', e.target.value)}
                                  >
                                    <option value="">Seleccionar...</option>
                                    {proveedores.map(p => (
                                      <option key={p.idProveedor} value={p.idProveedor}>
                                        {p.nombreProveedor}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div className="form-group-inline small">
                                  <label>Cantidad *</label>
                                  <input
                                    type="number"
                                    required
                                    min="1"
                                    value={prod.unidadesCompradas}
                                    onChange={(e) => actualizarProducto(index, 'unidadesCompradas', e.target.value)}
                                  />
                                </div>
                                
                                <div className="form-group-inline">
                                  <label>Precio Unit. *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="0,00"
                                    value={prod.precioUnitario || ''}
                                    onChange={(e) => {
                                      const cleaned = e.target.value.replace(/[^\d,]/g, '')
                                      actualizarProducto(index, 'precioUnitario', cleaned)
                                    }}
                                  />
                                </div>
                                
                                <div className="form-group-inline">
                                  <label>Total</label>
                                  <input
                                    type="text"
                                    value={formatCurrency(prod.precioTotal)}
                                    disabled
                                    className="input-disabled"
                                  />
                                </div>
                                
                                <button
                                  type="button"
                                  className="btn-remove"
                                  onClick={() => removerProducto(index)}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                )}

                {/* Pagos - Disponible en modo creación y edición */}
                <div className="form-section">
                      <div className="section-header">
                        <h3>💰 Pagos</h3>
                        <button type="button" className="btn-add" onClick={agregarPago}>
                          + Agregar Pago
                        </button>
                      </div>
                      
                      <div className="pagos-list">
                        {pagosCompra.map((pago, index) => {
                          const isExistingPago = editingCompra && !pago.isNew
                          
                          return (
                            <div key={index} className={`pago-item ${isExistingPago ? 'pago-existing' : ''}`}>
                              <div className="pago-row">
                                {isExistingPago && (
                                  <div className="pago-badge">
                                    ✅ Registrado
                                  </div>
                                )}
                                
                                <div className="form-group-inline">
                                  <label>Tipo de Pago *</label>
                                  <select
                                    required
                                    value={pago.tipoPago}
                                    onChange={(e) => actualizarPago(index, 'tipoPago', e.target.value)}
                                    disabled={isExistingPago}
                                  >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="QR">QR</option>
                                    <option value="Débito">Débito</option>
                                    <option value="Crédito">Crédito</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Otro método">Otro método</option>
                                  </select>
                                </div>
                                
                                <div className="form-group-inline">
                                  <label>Monto *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="0,00"
                                    value={isExistingPago 
                                      ? (pago.montoPago > 0 ? pago.montoPago.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '')
                                      : (pago.montoPago || '')}
                                    onChange={(e) => {
                                      const cleaned = e.target.value.replace(/[^\d,]/g, '')
                                      actualizarPago(index, 'montoPago', cleaned)
                                    }}
                                    disabled={isExistingPago}
                                    className={isExistingPago ? 'input-disabled' : ''}
                                  />
                                </div>
                                
                                <div className="form-group-inline flex-grow">
                                  <label>Observaciones</label>
                                  <input
                                    type="text"
                                    value={pago.observaciones || ''}
                                    onChange={(e) => actualizarPago(index, 'observaciones', e.target.value)}
                                    placeholder="Opcional..."
                                    disabled={isExistingPago}
                                    className={isExistingPago ? 'input-disabled' : ''}
                                  />
                                </div>
                                
                                {isExistingPago && pago.fechaPago && (
                                  <div className="form-group-inline">
                                    <label>Fecha</label>
                                    <input
                                      type="text"
                                      value={formatDate(pago.fechaPago)}
                                      disabled
                                      className="input-disabled"
                                    />
                                  </div>
                                )}
                                
                                {!isExistingPago && (!editingCompra || pagosCompra.filter(p => p.isNew).length > 1) && (
                                  <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => removerPago(index)}
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Resumen */}
                    <div className="form-section resumen-section">
                      {editingCompra ? (
                        <>
                          <div className="resumen-row">
                            <span>Total Compra:</span>
                            <strong>{formatCurrency(editingCompra.totalCompra || 0)}</strong>
                          </div>
                          <div className="resumen-row">
                            <span>Pagado Anteriormente:</span>
                            <strong>{formatCurrency(editingCompra.totalPagado || 0)}</strong>
                          </div>
                          <div className="resumen-row">
                            <span>Nuevos Pagos:</span>
                            <strong>{formatCurrency(
                              pagosCompra
                                .filter(p => p.isNew)
                                .reduce((sum, p) => sum + parseArgentineCurrency(p.montoPago), 0)
                            )}</strong>
                          </div>
                          <div className="resumen-row highlight">
                            <span>Deuda Restante:</span>
                            <strong>{formatCurrency(
                              (editingCompra.totalDeuda || 0) - 
                              pagosCompra
                                .filter(p => p.isNew)
                                .reduce((sum, p) => sum + parseArgentineCurrency(p.montoPago), 0)
                            )}</strong>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="resumen-row">
                            <span>Total Compra:</span>
                            <strong>{formatCurrency(calcularTotalCompra())}</strong>
                          </div>
                          <div className="resumen-row">
                            <span>Total Pagos:</span>
                            <strong>{formatCurrency(calcularTotalPagos())}</strong>
                          </div>
                          <div className="resumen-row highlight">
                            <span>Deuda:</span>
                            <strong>{formatCurrency(calcularTotalCompra() - calcularTotalPagos())}</strong>
                          </div>
                        </>
                      )}
                    </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeFormModal}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading 
                    ? 'Guardando...' 
                    : editingCompra 
                      ? (pagosCompra.some(p => p.isNew) ? 'Actualizar y Agregar Pagos' : 'Actualizar') 
                      : 'Guardar Compra'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE */}
      {showDetalleModal && selectedCompra && (
        <div className="modal-overlay" onClick={closeDetalleModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de Compra #{selectedCompra.idCompra}</h2>
              <button className="modal-close" onClick={closeDetalleModal}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Información general */}
              <div className="compra-info">
                <div className="info-row">
                  <span className="info-label">Fecha y Hora:</span>
                  <span>{formatDateTime(selectedCompra.fechaCompra)}</span>
                </div>
                {selectedCompra.usuarioRegistro && (
                  <div className="info-row">
                    <span className="info-label">Registrado por:</span>
                    <span><strong>{selectedCompra.usuarioRegistro}</strong></span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Facturación:</span>
                  <span>{selectedCompra.facturacion}</span>
                </div>
                {selectedCompra.observaciones && (
                  <div className="info-row">
                    <span className="info-label">Observaciones:</span>
                    <span>{selectedCompra.observaciones}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Estado:</span>
                  <span className={`estado-badge ${getEstadoBadgeClass(selectedCompra.estadoPago)}`}>
                    {selectedCompra.estadoPago}
                  </span>
                </div>
              </div>

              {/* Productos comprados */}
              <div className="detalle-section">
                <h3>📦 Productos</h3>
                <table className="detalle-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Proveedor</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompra.detalles?.map((det, idx) => (
                      <tr key={idx}>
                        <td><code>{det.codigoBarras}</code></td>
                        <td>{det.nombreProducto}</td>
                        <td>{det.nombreProveedor || '-'}</td>
                        <td className="text-center">{det.unidadesCompradas}</td>
                        <td>{formatCurrency(det.precioUnitario)}</td>
                        <td><strong>{formatCurrency(det.precioTotal)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagos realizados */}
              {selectedCompra.pagos && selectedCompra.pagos.length > 0 && (
                <div className="detalle-section">
                  <h3>💰 Pagos Realizados</h3>
                  <table className="detalle-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Monto</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCompra.pagos.map((pago, idx) => (
                        <tr key={idx}>
                          <td>{formatDate(pago.fechaPago)}</td>
                          <td>{pago.tipoPago}</td>
                          <td><strong>{formatCurrency(pago.montoPago)}</strong></td>
                          <td>{pago.observaciones || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Resumen */}
              <div className="compra-resumen">
                <div className="resumen-row">
                  <span>Total Compra:</span>
                  <strong>{formatCurrency(selectedCompra.detalles?.reduce((sum, d) => sum + (d.precioTotal || 0), 0))}</strong>
                </div>
                <div className="resumen-row text-success">
                  <span>Total Pagado:</span>
                  <strong>{formatCurrency(selectedCompra.totalPagado)}</strong>
                </div>
                <div className="resumen-row text-danger">
                  <span>Deuda Pendiente:</span>
                  <strong>{formatCurrency(selectedCompra.totalDeuda)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeDetalleModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showConfirmModal && compraToDelete && (
        <div className="modal-overlay" onClick={closeConfirmModal}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirmar Eliminación</h2>
              <button className="modal-close" onClick={closeConfirmModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="confirm-message">
                <p>¿Estás seguro de que deseas eliminar la compra <strong>#{compraToDelete.idCompra}</strong>?</p>
                <div className="confirm-warning">
                  <span className="warning-icon">⚠️</span>
                  <div>
                    <strong>Esta acción:</strong>
                    <ul>
                      <li>Eliminará la compra permanentemente</li>
                      <li>Revertirá el stock de todos los productos</li>
                      <li>Eliminará todos los pagos asociados</li>
                      <li>No se puede deshacer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeConfirmModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-delete-confirm"
                onClick={handleDeleteCompra}
              >
                🗑️ Eliminar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Compras
