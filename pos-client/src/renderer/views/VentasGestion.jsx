// =====================================================
// VENTAS - Gestión de Ventas
// =====================================================

import React, { useState, useEffect, useMemo, useRef } from 'react'
import '../styles/Ventas.css'
import { formatCurrency, parseArgentineCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

function VentasGestion() {
  const { user } = useAuth()
  // Estados
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVenta, setSelectedVenta] = useState(null)
  
  // Estados para filtros avanzados
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    clientes: [],
    facturacion: '',
    estados: []
  })
  const [showFiltro, setShowFiltro] = useState({
    fecha: false,
    cliente: false,
    facturacion: false,
    estado: false
  })
  
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingVenta, setEditingVenta] = useState(null)
  
  const [ventaForm, setVentaForm] = useState({
    idCliente: '',
    facturacion: 'No especificado',
    observaciones: ''
  })
  
  const [productosVenta, setProductosVenta] = useState([])
  const [pagosVenta, setPagosVenta] = useState([{
    tipoPago: 'Efectivo',
    montoPago: 0,
    observaciones: ''
  }])
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Estado para búsqueda de productos (uno por cada fila)
  const [productoSearches, setProductoSearches] = useState({}) // { index: searchText }
  const [productoSuggestions, setProductoSuggestions] = useState([])
  const [showProductoSuggestions, setShowProductoSuggestions] = useState(false)
  const [activeSearchIndex, setActiveSearchIndex] = useState(null)

  // Estado para modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [confirmMessage, setConfirmMessage] = useState('')

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(100)

  // Referencias para inputs de búsqueda de productos
  const productoInputsRef = useRef({})
  const [activeProductoIndex, setActiveProductoIndex] = useState(null)

  // ==============================================
  // CARGAR DATOS
  // ==============================================

  useEffect(() => {
    loadVentas()
    loadClientes()
    loadProductos()
  }, [])

  const loadVentas = async () => {
    try {
      const data = await window.api.getAllVentas()
      setVentas(data)
    } catch (error) {
      console.error('Error al cargar ventas:', error)
    }
  }

  const loadClientes = async () => {
    try {
      const data = await window.api.getAllClientes('todos')
      setClientes(data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
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

  // ==============================================
  // ATAJOS DE TECLADO
  // ==============================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2: Nueva Venta (solo si no hay modal abierto)
      if (e.key === 'F2' && !showFormModal && !showDetalleModal) {
        e.preventDefault()
        openFormModal()
      }

      // Ctrl + Enter: Guardar (solo si el modal de formulario está abierto)
      if (e.ctrlKey && e.key === 'Enter' && showFormModal) {
        e.preventDefault()
        const form = document.querySelector('.modal-form')
        if (form) form.requestSubmit()
      }

      // Ctrl + P: Agregar Pago (solo si el modal de formulario está abierto)
      if (e.ctrlKey && e.key === 'p' && showFormModal) {
        e.preventDefault()
        agregarPago()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showFormModal, showDetalleModal])

  // ==============================================
  // AUTO-FOCUS DE PRODUCTOS
  // ==============================================

  useEffect(() => {
    // Enfocar el input del producto activo cuando cambia activeProductoIndex
    if (activeProductoIndex !== null && productoInputsRef.current[activeProductoIndex]) {
      setTimeout(() => {
        productoInputsRef.current[activeProductoIndex]?.focus()
      }, 100)
    }
  }, [activeProductoIndex, showFormModal])

  // ==============================================
  // MENSAJES Y MODALES
  // ==============================================

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const openConfirmModal = (message, onConfirm) => {
    setConfirmMessage(message)
    setConfirmAction(() => onConfirm)
    setShowConfirmModal(true)
  }

  const closeConfirmModal = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
    setConfirmMessage('')
  }

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction()
    }
    closeConfirmModal()
  }

  // ==============================================
  // MODALES
  // ==============================================

  const openDetalleModal = async (venta) => {
    try {
      const detalleCompleto = await window.api.getVentaById(venta.idVenta)
      setSelectedVenta(detalleCompleto)
      setShowDetalleModal(true)
    } catch (error) {
      showMessage('Error al cargar detalles de la venta', 'error')
    }
  }

  const closeDetalleModal = () => {
    setShowDetalleModal(false)
    setSelectedVenta(null)
  }

  const imprimirVenta = async (venta) => {
    try {
      const detalleCompleto = await window.api.getVentaById(venta.idVenta)
      
      // Crear contenido HTML para impresora térmica POS 80mm
      const contenidoImpresion = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Venta #${detalleCompleto.idVenta}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 5mm;
                width: 80mm;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              width: 80mm;
              padding: 5mm;
              margin: 0 auto;
              line-height: 1.3;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .header h1 {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .header h2 {
              margin: 3px 0;
              font-size: 12px;
              font-weight: normal;
            }
            .info-section {
              margin-bottom: 10px;
              font-size: 10px;
            }
            .info-row {
              padding: 2px 0;
              border-bottom: 1px dotted #ccc;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 35%;
            }
            .info-value {
              display: inline-block;
              width: 64%;
              text-align: right;
            }
            .section-title {
              font-weight: bold;
              font-size: 11px;
              margin: 8px 0 4px 0;
              border-top: 1px dashed #000;
              padding-top: 4px;
            }
            .producto-item {
              padding: 3px 0;
              border-bottom: 1px dotted #ccc;
              font-size: 9px;
            }
            .producto-line {
              display: flex;
              justify-content: space-between;
            }
            .producto-nombre {
              font-weight: bold;
              margin-bottom: 2px;
            }
            .producto-details {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #666;
            }
            .pago-item {
              padding: 3px 0;
              border-bottom: 1px dotted #ccc;
              font-size: 9px;
            }
            .pago-line {
              display: flex;
              justify-content: space-between;
            }
            .resumen {
              margin-top: 10px;
              padding: 8px;
              border: 2px solid #000;
              font-size: 10px;
            }
            .resumen-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }
            .resumen-row strong {
              font-size: 11px;
            }
            .resumen-total {
              border-top: 1px solid #000;
              margin-top: 5px;
              padding-top: 5px;
              font-weight: bold;
            }
            .footer {
              margin-top: 10px;
              text-align: center;
              font-size: 8px;
              border-top: 1px dashed #000;
              padding-top: 8px;
            }
            .separator {
              text-align: center;
              margin: 5px 0;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>POS - Supermercado</h1>
            <h2>Venta #${detalleCompleto.idVenta}</h2>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Fecha:</span>
              <span class="info-value">${formatDateTime(detalleCompleto.fechaVenta)}</span>
            </div>
            ${detalleCompleto.nombreCliente ? `
            <div class="info-row">
              <span class="info-label">Cliente:</span>
              <span class="info-value">${detalleCompleto.nombreCliente}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Facturación:</span>
              <span class="info-value">${detalleCompleto.facturacion || 'No especificado'}</span>
            </div>
            ${detalleCompleto.observaciones ? `
            <div class="info-row">
              <span class="info-label">Obs:</span>
              <span class="info-value">${detalleCompleto.observaciones}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="separator">--------------------------------</div>
          
          <div class="section-title">PRODUCTOS</div>
          ${(detalleCompleto.detalles || []).map(det => `
            <div class="producto-item">
              <div class="producto-nombre">${det.nombreProducto}</div>
              <div class="producto-details">
                <span>${det.codigoBarras}</span>
                <span>${det.unidadesVendidas} x ${formatCurrency(det.precioUnitario)}</span>
              </div>
              ${det.descuento > 0 ? `
              <div class="producto-details">
                <span>Desc: ${det.descuento}%</span>
              </div>
              ` : ''}
              <div class="producto-line">
                <span>Subtotal:</span>
                <strong>${formatCurrency(det.precioTotalFinal)}</strong>
              </div>
            </div>
          `).join('')}
          
          <div class="separator">--------------------------------</div>
          
          <div class="section-title">PAGOS</div>
          ${(detalleCompleto.pagos || []).map(pago => `
            <div class="pago-item">
              <div class="pago-line">
                <span>${pago.tipoPago}</span>
                <strong>${formatCurrency(pago.montoPago)}</strong>
              </div>
              ${pago.observaciones ? `
              <div class="producto-details">${pago.observaciones}</div>
              ` : ''}
            </div>
          `).join('')}
          
          <div class="separator">================================</div>
          
          <div class="resumen">
            <div class="resumen-row">
              <span>Total Venta:</span>
              <strong>${formatCurrency((detalleCompleto.detalles || []).reduce((sum, d) => sum + (d.precioTotalFinal || 0), 0))}</strong>
            </div>
            <div class="resumen-row">
              <span>Total Pagado:</span>
              <strong>${formatCurrency(detalleCompleto.totalPagado || 0)}</strong>
            </div>
            ${(detalleCompleto.totalDeuda || 0) > 0 ? `
            <div class="resumen-row">
              <span>Deuda:</span>
              <strong>${formatCurrency(detalleCompleto.totalDeuda || 0)}</strong>
            </div>
            ` : ''}
            <div class="resumen-row resumen-total">
              <span>Estado:</span>
              <strong>${detalleCompleto.estadoPago?.toUpperCase() || 'PENDIENTE'}</strong>
            </div>
          </div>
          
          <div class="footer">
            <div>${new Date().toLocaleString('es-AR')}</div>
            ${detalleCompleto.usuarioRegistro ? `
            <div>Vendedor: ${detalleCompleto.usuarioRegistro}</div>
            ` : ''}
            <div>POS Supermercado v0.1.0</div>
            <div style="margin-top: 10px;">Gracias por su compra!</div>
          </div>
        </body>
        </html>
      `
      
      // Abrir ventana de impresión
      const ventanaImpresion = window.open('', '_blank')
      ventanaImpresion.document.write(contenidoImpresion)
      ventanaImpresion.document.close()
      
      // Esperar a que se cargue el contenido y luego imprimir
      ventanaImpresion.onload = () => {
        setTimeout(() => {
          ventanaImpresion.print()
        }, 250)
      }
    } catch (error) {
      console.error('Error al imprimir venta:', error)
      showMessage('Error al generar el comprobante de impresión', 'error')
    }
  }

  const openFormModal = async (venta = null) => {
    if (venta) {
      // Editar: cargar datos de la venta
      // Recalcular totalVenta y totalDeuda correctamente
      const detalleCompleto = await window.api.getVentaById(venta.idVenta)
      const totalVenta = (detalleCompleto.detalles || []).reduce((sum, p) => sum + (p.precioTotalFinal || 0), 0)
      const totalPagado = (detalleCompleto.pagos || []).reduce((sum, p) => sum + (p.montoPago || 0), 0)
      const totalDeuda = totalVenta - totalPagado
      
      const ventaActualizada = {
        ...venta,
        totalVenta,
        totalPagado,
        totalDeuda
      }
      
      setEditingVenta(ventaActualizada)
      setVentaForm({
        idCliente: venta.idCliente || '',
        facturacion: venta.facturacion,
        observaciones: venta.observaciones || ''
      })
      
      // Cargar pagos existentes
      try {
        setPagosVenta(detalleCompleto.pagos || [])
      } catch (error) {
        console.error('Error al cargar pagos:', error)
        setPagosVenta([])
      }
    } else {
      // Nueva venta
      setEditingVenta(null)
      setVentaForm({
        idCliente: '',
        facturacion: 'No especificado',
        observaciones: ''
      })
      // Agregar automáticamente una fila de producto vacía
      setProductosVenta([{
        codigoBarras: '',
        nombreProducto: '',
        precioUnitario: 0,
        unidadesVendidas: 1,
        descuento: 0,
        precioTotal: 0,
        precioTotalFinal: 0
      }])
      setPagosVenta([{
        tipoPago: 'Efectivo',
        montoPago: 0,
        observaciones: ''
      }])
      setActiveProductoIndex(0) // Marcar el primer producto como activo para enfocar
    }
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingVenta(null)
  }

  // ==============================================
  // MANEJO DE PRODUCTOS
  // ==============================================

  const agregarProducto = () => {
    const newIndex = productosVenta.length
    setProductosVenta([...productosVenta, {
      codigoBarras: '',
      nombreProducto: '',
      unidadesVendidas: 1,
      precioUnitario: 0,
      descuento: 0,
      precioTotal: 0,
      precioTotalFinal: 0
    }])
  }

  const eliminarProducto = (index) => {
    setProductosVenta(productosVenta.filter((_, i) => i !== index))
    // Limpiar el estado de búsqueda para este índice
    setProductoSearches(prev => {
      const updated = { ...prev }
      delete updated[index]
      return updated
    })
  }

  const actualizarProducto = (index, field, value) => {
    const nuevosProductos = [...productosVenta]
    
    // Mantener valores como están mientras se editan
    // La conversión se hará al guardar
    if (field === 'unidadesVendidas') {
      nuevosProductos[index][field] = parseInt(value) || 0
    } else {
      nuevosProductos[index][field] = value
    }
    
    // Autocompletar datos del producto si se selecciona uno
    if (field === 'codigoBarras') {
      const producto = productos.find(p => p.codigoBarras === value)
      if (producto) {
        nuevosProductos[index].nombreProducto = producto.nombreProducto
        nuevosProductos[index].precioUnitario = producto.precioFinal || producto.precioVenta || 0
      }
    }
    
    // Calcular precio total
    if (field === 'unidadesVendidas' || field === 'precioUnitario' || field === 'descuento') {
      const unidades = parseInt(nuevosProductos[index].unidadesVendidas) || 0
      const precio = parseArgentineCurrency(nuevosProductos[index].precioUnitario)
      const descuento = parseFloat(nuevosProductos[index].descuento) || 0
      
      nuevosProductos[index].precioTotal = unidades * precio
      nuevosProductos[index].precioTotalFinal = nuevosProductos[index].precioTotal * (1 - descuento / 100)
    }
    
    setProductosVenta(nuevosProductos)
  }

  // Búsqueda inteligente de productos
  const handleProductoSearchChange = (index, value) => {
    // Actualizar el estado de búsqueda para este índice específico
    setProductoSearches(prev => ({ ...prev, [index]: value }))
    setActiveSearchIndex(index)
    
    if (value.length > 0) {
      // Buscar coincidencia exacta por código de barras (para escáner)
      const exactMatch = productos.find(p => p.codigoBarras === value)
      
      if (exactMatch) {
        // Si es coincidencia exacta, seleccionar inmediatamente
        seleccionarProducto(index, exactMatch)
        return
      }
      
      // Si no, mostrar sugerencias
      const filtered = productos.filter(p => 
        p.codigoBarras.toLowerCase().includes(value.toLowerCase()) ||
        p.nombreProducto.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10)
      
      setProductoSuggestions(filtered)
      setShowProductoSuggestions(true)
    } else {
      setProductoSuggestions([])
      setShowProductoSuggestions(false)
    }
  }

  const handleProductoKeyDown = (index, e) => {
    // Si presiona Enter y hay sugerencias, seleccionar la primera
    if (e.key === 'Enter' && productoSuggestions.length > 0) {
      e.preventDefault()
      seleccionarProducto(index, productoSuggestions[0])
    }
  }

  const seleccionarProducto = (index, producto) => {
    const nuevosProductos = [...productosVenta]
    nuevosProductos[index].codigoBarras = producto.codigoBarras
    nuevosProductos[index].nombreProducto = producto.nombreProducto
    nuevosProductos[index].precioUnitario = producto.precioFinal || producto.precioVenta || 0
    nuevosProductos[index].stockActual = producto.stockActual || 0 // Guardar stock disponible
    
    // Calcular precio total
    const unidades = parseInt(nuevosProductos[index].unidadesVendidas) || 0
    const precio = producto.precioFinal || producto.precioVenta || 0
    const descuento = parseFloat(nuevosProductos[index].descuento) || 0
    
    nuevosProductos[index].precioTotal = unidades * precio
    nuevosProductos[index].precioTotalFinal = nuevosProductos[index].precioTotal * (1 - descuento / 100)
    
    setProductosVenta(nuevosProductos)
    
    // Limpiar el estado de búsqueda para este índice específico
    setProductoSearches(prev => {
      const updated = { ...prev }
      delete updated[index]
      return updated
    })
    setShowProductoSuggestions(false)
    setActiveSearchIndex(null)
    
    // Agregar automáticamente una nueva fila de producto vacía
    setTimeout(() => {
      agregarProductoYEnfocar()
    }, 100)
  }

  const agregarProductoYEnfocar = () => {
    const newIndex = productosVenta.length
    setProductosVenta([...productosVenta, {
      codigoBarras: '',
      nombreProducto: '',
      precioUnitario: 0,
      unidadesVendidas: 1,
      descuento: 0,
      precioTotal: 0,
      precioTotalFinal: 0
    }])
    setActiveProductoIndex(newIndex) // Marcar como activo para enfocar
  }

  // ==============================================
  // MANEJO DE PAGOS
  // ==============================================

  const agregarPago = () => {
    setPagosVenta([...pagosVenta, {
      tipoPago: 'Efectivo',
      montoPago: 0,
      observaciones: '',
      isNew: editingVenta ? true : false
    }])
  }

  const eliminarPago = (index) => {
    setPagosVenta(pagosVenta.filter((_, i) => i !== index))
  }

  const actualizarPago = (index, field, value) => {
    const nuevosPagos = [...pagosVenta]
    // Mantener valores como están mientras se editan
    // La conversión se hará al guardar
    nuevosPagos[index][field] = value
    setPagosVenta(nuevosPagos)
  }

  // ======================================================
  // GUARDAR VENTA
  // ======================================================

  const handleSaveVenta = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingVenta) {
        // Filtrar pagos nuevos (los que tienen isNew = true) y limpiarlos
        const pagosNuevos = pagosVenta
          .filter(p => p.isNew)
          .map(p => ({
            tipoPago: p.tipoPago,
            montoPago: parseArgentineCurrency(p.montoPago),
            observaciones: p.observaciones || '',
            fechaPago: new Date().toISOString()
          }))
          .filter(p => p.montoPago > 0) // Solo pagos con monto mayor a 0
        
        // Actualizar datos generales y agregar pagos nuevos
        const usuarioActualizacion = user?.username || user?.nombreUsuario || 'Sistema'
        const result = await window.api.updateVenta(editingVenta.idVenta, ventaForm, pagosNuevos, usuarioActualizacion)
        
        if (!result.success) {
          showMessage(`❌ ${result.error}`, 'error')
          setLoading(false)
          return
        }

        showMessage('✅ Venta actualizada correctamente', 'success')
        closeFormModal()
        loadVentas()
      } else {
        // Filtrar productos vacíos (los que no tienen código de barras)
        const productosValidos = productosVenta.filter(p => p.codigoBarras && p.codigoBarras.trim() !== '')
        
        // Validar que haya productos
        if (productosValidos.length === 0) {
          showMessage('❌ Debe agregar al menos un producto', 'error')
          setLoading(false)
          return
        }

        // Convertir valores a números para evitar problemas
        const productosLimpios = productosValidos.map(p => ({
          ...p,
          unidadesVendidas: parseInt(p.unidadesVendidas) || 0,
          precioUnitario: parseArgentineCurrency(p.precioUnitario),
          descuento: parseFloat(p.descuento) || 0,
          precioTotal: parseArgentineCurrency(p.precioTotal),
          precioTotalFinal: parseArgentineCurrency(p.precioTotalFinal)
        }))

        // Filtrar pagos con monto 0 o vacío
        const pagosValidos = pagosVenta.filter(p => {
          const monto = parseArgentineCurrency(p.montoPago)
          return monto > 0
        })
        
        const pagosLimpios = pagosValidos.map(p => ({
          ...p,
          montoPago: parseArgentineCurrency(p.montoPago)
        }))

        // Crear nueva venta
        const usuarioRegistro = user?.username || user?.nombreUsuario || 'Sistema'
        const result = await window.api.createVenta(ventaForm, productosLimpios, pagosLimpios, usuarioRegistro)
        
        if (result.success) {
          showMessage('✅ Venta registrada correctamente', 'success')
          closeFormModal()
          loadVentas()
        } else {
          showMessage(`❌ ${result.error}`, 'error')
        }
      }
    } catch (error) {
      console.error('Error al guardar venta:', error)
      showMessage(`❌ Error al guardar venta: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // ELIMINAR VENTA
  // ======================================================

  const handleDeleteVenta = async (id) => {
    openConfirmModal(
      '¿Estás seguro de que querés eliminar esta venta? Esta acción no se puede deshacer y el stock de los productos se revertirá.',
      async () => {
        const result = await window.api.deleteVenta(id)
        if (result.success) {
          showMessage('✅ Venta eliminada correctamente', 'success')
          loadVentas()
        } else {
          showMessage(`❌ ${result.error}`, 'error')
        }
      }
    )
  }

  // ======================================================
  // CÁLCULOS
  // ======================================================

  const calcularTotalVenta = () => {
    return productosVenta.reduce((sum, p) => sum + parseArgentineCurrency(p.precioTotalFinal), 0)
  }

  const calcularTotalPagos = () => {
    return pagosVenta.reduce((sum, p) => sum + parseArgentineCurrency(p.montoPago), 0)
  }

  // ======================================================
  // FILTROS
  // ======================================================

  const parsearFechaSQLite = (fechaStr) => {
    if (!fechaStr) return null
    const [fecha] = fechaStr.split(' ')
    const [year, month, day] = fecha.split('-')
    return new Date(year, month - 1, day)
  }

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(venta => {
      // Búsqueda general
      const matchSearch = searchTerm === '' || 
        venta.idVenta.toString().includes(searchTerm) ||
        (venta.nombreCliente && venta.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (venta.facturacion && venta.facturacion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (venta.observaciones && venta.observaciones.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro de fecha
      let matchFecha = true
      if (filtros.fechaDesde || filtros.fechaHasta) {
        const fechaVenta = parsearFechaSQLite(venta.fechaVenta)
        if (fechaVenta) {
          if (filtros.fechaDesde) {
            const desde = new Date(filtros.fechaDesde)
            matchFecha = matchFecha && fechaVenta >= desde
          }
          if (filtros.fechaHasta) {
            const hasta = new Date(filtros.fechaHasta)
            hasta.setHours(23, 59, 59)
            matchFecha = matchFecha && fechaVenta <= hasta
          }
        }
      }

      // Filtro de clientes
      const matchCliente = filtros.clientes.length === 0 || 
        (venta.nombreCliente && filtros.clientes.includes(venta.nombreCliente))

      // Filtro de facturación
      const matchFacturacion = filtros.facturacion === '' ||
        (venta.facturacion && venta.facturacion.toLowerCase().includes(filtros.facturacion.toLowerCase()))

      // Filtro de estado
      const matchEstado = filtros.estados.length === 0 ||
        filtros.estados.includes(venta.estadoPago)

      return matchSearch && matchFecha && matchCliente && matchFacturacion && matchEstado
    })
  }, [ventas, searchTerm, filtros])

  // Estadísticas dinámicas basadas en filtros
  const estadisticas = useMemo(() => {
    const total = ventasFiltradas.length
    const conDeuda = ventasFiltradas.filter(v => 
      v.estadoPago === 'pendiente' || v.estadoPago === 'parcial'
    ).length
    const totalDeuda = ventasFiltradas.reduce((sum, v) => 
      sum + (v.totalDeuda || 0), 0
    )

    return { total, conDeuda, totalDeuda }
  }, [ventasFiltradas])

  // Paginación
  const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVentas = ventasFiltradas.slice(startIndex, endIndex)

  // Cambiar página
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Generar números de página para mostrar
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

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtros])

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-btn') && !e.target.closest('.filter-dropdown')) {
        setShowFiltro({
          fecha: false,
          cliente: false,
          facturacion: false,
          estado: false
        })
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Clientes únicos para el filtro
  const clientesUnicos = useMemo(() => {
    const uniqueNames = [...new Set(ventas.map(v => v.nombreCliente).filter(Boolean))]
    return uniqueNames.sort()
  }, [ventas])

  // Facturaciones únicas para el filtro
  const facturacionesUnicas = useMemo(() => {
    const uniqueFacts = [...new Set(ventas.map(v => v.facturacion).filter(Boolean))]
    return uniqueFacts.sort()
  }, [ventas])

  const toggleFiltro = (tipo) => {
    setShowFiltro({ ...showFiltro, [tipo]: !showFiltro[tipo] })
  }

  const toggleClienteFiltro = (cliente) => {
    setFiltros({
      ...filtros,
      clientes: filtros.clientes.includes(cliente)
        ? filtros.clientes.filter(c => c !== cliente)
        : [...filtros.clientes, cliente]
    })
  }

  const toggleEstadoFiltro = (estado) => {
    setFiltros({
      ...filtros,
      estados: filtros.estados.includes(estado)
        ? filtros.estados.filter(e => e !== estado)
        : [...filtros.estados, estado]
    })
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      clientes: [],
      facturacion: '',
      estados: []
    })
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      'pagado': { class: 'estado-pagado', text: 'PAGADO' },
      'parcial': { class: 'estado-parcial', text: 'PARCIAL' },
      'pendiente': { class: 'estado-pendiente', text: 'PENDIENTE' }
    }
    return badges[estado] || { class: '', text: estado }
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <div className="header-left">
          <h2>🛒 Ventas</h2>
          <p className="subtitle">
            Historial de ventas a clientes ({ventasFiltradas.length} de {ventas.length})
            {ventasFiltradas.length > itemsPerPage && (
              <span> · Página {currentPage} de {totalPages}</span>
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openFormModal()}>
          + Nueva Venta
        </button>
      </div>

      {/* Barra de atajos */}
      <div className="shortcuts-bar">
        <div className="shortcut-item">
          <kbd className="shortcut-key">F2</kbd>
          <span>Nueva Venta</span>
        </div>
        <div className="shortcut-item">
          <kbd className="shortcut-key">Ctrl</kbd> + <kbd className="shortcut-key">Enter</kbd>
          <span>Guardar Venta</span>
        </div>
        <div className="shortcut-item">
          <kbd className="shortcut-key">Ctrl</kbd> + <kbd className="shortcut-key">P</kbd>
          <span>Agregar Pago</span>
        </div>
      </div>

      {/* Panel de estadísticas */}
      <div className="stats-panel">
        <div className="stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{estadisticas.total}</div>
            <div className="stat-card-label">Ventas Mostradas</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-icon">⚠️</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{estadisticas.conDeuda}</div>
            <div className="stat-card-label">Con Deuda</div>
            <div className="stat-card-subtitle">(Parcial + Pendiente)</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{formatCurrency(estadisticas.totalDeuda)}</div>
            <div className="stat-card-label">Total Deuda</div>
          </div>
        </div>
      </div>

      {/* Mensaje */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por ID u observaciones..."
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
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
          <option value={200}>200 por página</option>
        </select>
      </div>

      {/* Tabla de ventas */}
      <div className="ventas-content">
        <div className="table-container">
          <table className="ventas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>
                  Fecha y Hora
                  <button className="filter-btn" onClick={() => toggleFiltro('fecha')}>
                    {filtros.fechaDesde || filtros.fechaHasta ? '🔽' : '▽'}
                  </button>
                  {showFiltro.fecha && (
                    <div className="filter-dropdown filter-dropdown-wide">
                      <div className="filter-header">Filtrar por Fecha</div>
                      <div className="filter-date-range">
                        <div>
                          <label>Desde:</label>
                          <input
                            type="date"
                            className="filter-date-input"
                            value={filtros.fechaDesde}
                            onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                          />
                        </div>
                        <div>
                          <label>Hasta:</label>
                          <input
                            type="date"
                            className="filter-date-input"
                            value={filtros.fechaHasta}
                            onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </th>
                <th>
                  Cliente
                  <button className="filter-btn" onClick={() => toggleFiltro('cliente')}>
                    {filtros.clientes.length > 0 ? `🔽 (${filtros.clientes.length})` : '▽'}
                  </button>
                  {showFiltro.cliente && (
                    <div className="filter-dropdown">
                      <div className="filter-header">Filtrar por Cliente</div>
                      <div className="filter-options">
                        {clientesUnicos.map(cliente => (
                          <label key={cliente} className="filter-item">
                            <input
                              type="checkbox"
                              checked={filtros.clientes.includes(cliente)}
                              onChange={() => toggleClienteFiltro(cliente)}
                            />
                            <span>{cliente}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </th>
                <th>
                  Facturación
                  <button className="filter-btn" onClick={() => toggleFiltro('facturacion')}>
                    {filtros.facturacion ? '🔽' : '▽'}
                  </button>
                  {showFiltro.facturacion && (
                    <div className="filter-dropdown">
                      <div className="filter-header">Filtrar por Facturación</div>
                      <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Buscar facturación..."
                        value={filtros.facturacion}
                        onChange={(e) => setFiltros({...filtros, facturacion: e.target.value})}
                      />
                      <div className="filter-options">
                        {facturacionesUnicas
                          .filter(f => f.toLowerCase().includes(filtros.facturacion.toLowerCase()))
                          .map(fact => (
                            <div
                              key={fact}
                              className="filter-suggestion"
                              onClick={() => setFiltros({...filtros, facturacion: fact})}
                            >
                              {fact}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </th>
                <th>Productos</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Deuda</th>
                <th>
                  Estado
                  <button className="filter-btn" onClick={() => toggleFiltro('estado')}>
                    {filtros.estados.length > 0 ? `🔽 (${filtros.estados.length})` : '▽'}
                  </button>
                  {showFiltro.estado && (
                    <div className="filter-dropdown">
                      <div className="filter-header">Filtrar por Estado</div>
                      <div className="filter-options">
                        {['pendiente', 'parcial', 'pagado'].map(estado => (
                          <label key={estado} className="filter-item">
                            <input
                              type="checkbox"
                              checked={filtros.estados.includes(estado)}
                              onChange={() => toggleEstadoFiltro(estado)}
                            />
                            <span style={{textTransform: 'capitalize'}}>{estado}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentVentas.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{textAlign: 'center', padding: '40px'}}>
                    {ventasFiltradas.length === 0 ? 'No hay ventas registradas' : 'No hay ventas en esta página'}
                  </td>
                </tr>
              ) : (
                currentVentas.map((venta) => (
                  <tr key={venta.idVenta}>
                    <td><strong>#{venta.idVenta}</strong></td>
                    <td>{formatDateTime(venta.fechaVenta)}</td>
                    <td>{venta.nombreCliente || '-'}</td>
                    <td>{venta.facturacion}</td>
                    <td className="text-center">{venta.cantidadProductos || 0}</td>
                    <td className="text-success"><strong>{formatCurrency(venta.totalVenta)}</strong></td>
                    <td className="text-success">{formatCurrency(venta.totalPagado)}</td>
                    <td className="text-danger">{formatCurrency(venta.totalDeuda)}</td>
                    <td>
                      <span className={`estado-badge ${getEstadoBadge(venta.estadoPago).class}`}>
                        {getEstadoBadge(venta.estadoPago).text}
                      </span>
                    </td>
                    <td>{venta.usuarioRegistro || '-'}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon btn-view"
                        onClick={() => openDetalleModal(venta)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon btn-print"
                        onClick={() => imprimirVenta(venta)}
                        title="Imprimir comprobante"
                      >
                        🖨️
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => openFormModal(venta)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteVenta(venta.idVenta)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {ventasFiltradas.length > 0 && totalPages > 1 && (
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

        {/* Botón para limpiar filtros */}
        {(filtros.fechaDesde || filtros.fechaHasta || filtros.clientes.length > 0 || 
          filtros.facturacion || filtros.estados.length > 0) && (
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <button className="clear-filters-button" onClick={limpiarFiltros}>
              🔄 Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetalleModal && selectedVenta && (
        <div className="modal-overlay" onClick={closeDetalleModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Detalle de Venta #{selectedVenta.idVenta}</h3>
              <button className="modal-close" onClick={closeDetalleModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detalle-info">
                <div className="info-row">
                  <span className="info-label">Fecha y Hora:</span>
                  <span className="info-value">{formatDateTime(selectedVenta.fechaVenta)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">{selectedVenta.nombreCliente || 'Sin cliente'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Facturación:</span>
                  <span className="info-value">{selectedVenta.facturacion}</span>
                </div>
                {selectedVenta.observaciones && (
                  <div className="info-row">
                    <span className="info-label">Observaciones:</span>
                    <span className="info-value">{selectedVenta.observaciones}</span>
                  </div>
                )}
                {selectedVenta.usuarioRegistro && (
                  <div className="info-row">
                    <span className="info-label">Registrado por:</span>
                    <span className="info-value">{selectedVenta.usuarioRegistro}</span>
                  </div>
                )}
              </div>

              <h4>📦 Productos</h4>
              <table className="detalle-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Desc. %</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVenta.detalles?.map((det, idx) => (
                    <tr key={idx}>
                      <td><code>{det.codigoBarras}</code></td>
                      <td>{det.nombreProducto}</td>
                      <td className="text-center">{det.unidadesVendidas}</td>
                      <td>{formatCurrency(det.precioUnitario)}</td>
                      <td className="text-center">{det.descuento || 0}%</td>
                      <td className="text-success"><strong>{formatCurrency(det.precioTotalFinal)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>💰 Pagos</h4>
              <table className="detalle-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVenta.pagos?.map((pago, idx) => (
                    <tr key={idx}>
                      <td>{pago.tipoPago}</td>
                      <td className="text-success"><strong>{formatCurrency(pago.montoPago)}</strong></td>
                      <td>{formatDateTime(pago.fechaPago)}</td>
                      <td>{pago.observaciones || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="resumen-box">
                <div className="resumen-row">
                  <span>Total Venta:</span>
                  <strong>{formatCurrency(selectedVenta.detalles?.reduce((sum, d) => sum + (d.precioTotalFinal || 0), 0))}</strong>
                </div>
                <div className="resumen-row text-success">
                  <span>Total Pagado:</span>
                  <strong>{formatCurrency(selectedVenta.totalPagado)}</strong>
                </div>
                <div className="resumen-row text-danger">
                  <span>Deuda Restante:</span>
                  <strong>{formatCurrency(selectedVenta.totalDeuda)}</strong>
                </div>
                <div className="resumen-row">
                  <span>Estado:</span>
                  <span className={`estado-badge ${getEstadoBadge(selectedVenta.estadoPago).class}`}>
                    {getEstadoBadge(selectedVenta.estadoPago).text}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetalleModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {showFormModal && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal-content modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVenta ? `✏️ Editar Venta #${editingVenta.idVenta}` : '📝 Nueva Venta'}</h3>
              <button className="modal-close" onClick={closeFormModal}>×</button>
            </div>
            <form onSubmit={handleSaveVenta} className="modal-form">
              <div className="modal-body">
                {/* Datos generales */}
                <div className="form-section">
                  <h3>📝 Información General</h3>
                  {!editingVenta && (
                    <p style={{color: '#666', fontSize: '13px', marginBottom: '15px'}}>
                      ℹ️ La fecha y hora se registrarán automáticamente al guardar
                    </p>
                  )}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cliente</label>
                      <select
                        value={ventaForm.idCliente}
                        onChange={(e) => setVentaForm({ ...ventaForm, idCliente: e.target.value })}
                        disabled={editingVenta}
                      >
                        <option value="">Sin cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.idCliente} value={cliente.idCliente}>
                            {cliente.nombreCliente}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Facturación</label>
                      <input
                        type="text"
                        value={ventaForm.facturacion}
                        onChange={(e) => setVentaForm({ ...ventaForm, facturacion: e.target.value })}
                        placeholder="No especificado"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      value={ventaForm.observaciones}
                      onChange={(e) => setVentaForm({ ...ventaForm, observaciones: e.target.value })}
                      placeholder="Observaciones adicionales (opcional)..."
                      rows="3"
                    />
                  </div>
                </div>

                {/* Productos (solo si no está editando) */}
                {!editingVenta && (
                  <div className="form-section">
                    <div className="section-header">
                      <h3>📦 Productos</h3>
                      <button type="button" className="btn btn-success btn-sm" onClick={agregarProducto}>
                        + Agregar Producto
                      </button>
                    </div>
                    
                    {productosVenta.map((prod, index) => (
                      <div key={index} className="producto-item">
                        <div className="producto-row">
                          <div className="form-group-inline flex-grow">
                            <label>Producto (Código de barras o nombre)</label>
                            <div className="producto-search-container">
                              <input
                                ref={(el) => (productoInputsRef.current[index] = el)}
                                type="text"
                                placeholder="Escribe para buscar o escanear código..."
                                value={prod.codigoBarras ? `${prod.codigoBarras} - ${prod.nombreProducto}` : (productoSearches[index] || '')}
                                onChange={(e) => {
                                  if (!prod.codigoBarras) {
                                    handleProductoSearchChange(index, e.target.value)
                                  }
                                }}
                                onKeyDown={(e) => handleProductoKeyDown(index, e)}
                                onFocus={() => {
                                  if (!prod.codigoBarras) {
                                    setActiveSearchIndex(index)
                                    setShowProductoSuggestions(true)
                                  }
                                }}
                                onBlur={() => {
                                  // Cerrar sugerencias después de un pequeño delay para permitir que el click se registre
                                  setTimeout(() => {
                                    setShowProductoSuggestions(false)
                                    setActiveSearchIndex(null)
                                  }, 200)
                                }}
                              />
                              {!prod.codigoBarras && productoSearches[index] && activeSearchIndex === index && (
                                <span className="producto-badge-searching">🔍 Buscando...</span>
                              )}
                              {prod.codigoBarras && (
                                <>
                                  <span className="producto-badge-selected">✓ Seleccionado</span>
                                  {prod.stockActual !== undefined && (
                                    <span className={`producto-badge-stock ${(prod.stockActual || 0) < (parseInt(prod.unidadesVendidas) || 0) ? 'stock-insuficiente' : (prod.stockActual || 0) <= 5 ? 'stock-bajo' : 'stock-ok'}`}>
                                      📦 Stock: {prod.stockActual || 0}
                                    </span>
                                  )}
                                </>
                              )}
                              {showProductoSuggestions && productoSuggestions.length > 0 && activeSearchIndex === index && (
                                <div className="producto-suggestions">
                                  {productoSuggestions.map((p) => (
                                    <div
                                      key={p.codigoBarras}
                                      className="suggestion-item"
                                      onMouseDown={(e) => {
                                        e.preventDefault() // Prevenir que el input pierda el foco antes del click
                                        seleccionarProducto(index, p)
                                      }}
                                    >
                                      <div className="suggestion-main">
                                        <strong>{p.codigoBarras}</strong>
                                        <span className="suggestion-name">{p.nombreProducto}</span>
                                        <span className="suggestion-stock">📦 Stock: {p.stockActual || 0}</span>
                                      </div>
                                      <span className="suggestion-price">{formatCurrency(p.precioFinal || p.precioVenta)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="form-group-inline">
                            <label>Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={prod.unidadesVendidas}
                              onChange={(e) => actualizarProducto(index, 'unidadesVendidas', e.target.value)}
                              className={prod.stockActual !== undefined && (parseInt(prod.unidadesVendidas) || 0) > (prod.stockActual || 0) ? 'input-stock-error' : ''}
                            />
                            {prod.stockActual !== undefined && (parseInt(prod.unidadesVendidas) || 0) > (prod.stockActual || 0) && (
                              <div className="stock-warning">
                                ⚠️ Stock insuficiente. Disponible: {prod.stockActual || 0}
                              </div>
                            )}
                          </div>
                          
                          <div className="form-group-inline">
                            <label>Precio Unit.</label>
                            <input
                              type="text"
                              placeholder="0,00"
                              value={prod.precioUnitario || ''}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^\d,]/g, '')
                                actualizarProducto(index, 'precioUnitario', cleaned)
                              }}
                            />
                          </div>

                          <div className="form-group-inline">
                            <label>Desc. %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0"
                              value={prod.descuento}
                              onChange={(e) => actualizarProducto(index, 'descuento', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group-inline">
                            <label>Total</label>
                            <input
                              type="text"
                              readOnly
                              value={formatCurrency(prod.precioTotalFinal || 0)}
                              className="input-readonly"
                            />
                          </div>
                          
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => eliminarProducto(index)}
                            title="Eliminar producto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagos */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>💰 Pagos</h3>
                    <button type="button" className="btn btn-success btn-sm" onClick={agregarPago}>
                      + Agregar Pago
                    </button>
                  </div>

                  {editingVenta && (
                    <div style={{marginBottom: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
                      <p style={{margin: '0', fontSize: '14px', color: '#1e5a8e'}}>
                        💡 <strong>Nota:</strong> Los pagos anteriores se muestran como referencia. Solo podés agregar nuevos pagos para reducir la deuda.
                      </p>
                    </div>
                  )}

                  {pagosVenta.map((pago, index) => {
                    const isExistingPago = editingVenta && !pago.isNew
                    
                    return (
                      <div key={index} className={`pago-item ${isExistingPago ? 'pago-existing' : ''}`}>
                        <div className="pago-row">
                          {isExistingPago && (
                            <div className="pago-badge">
                              ✅ Registrado
                            </div>
                          )}
                          
                          <div className="form-group-inline">
                            <label>Tipo de Pago</label>
                            <select
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
                            <label>Monto</label>
                            <input
                              type="text"
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
                                readOnly
                                className="input-disabled"
                              />
                            </div>
                          )}
                          
                          {!isExistingPago && (
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => eliminarPago(index)}
                              title="Eliminar pago"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Resumen */}
                <div className="form-section">
                  <h3>📊 Resumen</h3>
                  <div className="resumen-box">
                    {editingVenta ? (
                      <>
                        <div className="resumen-row">
                          <span>Total Venta:</span>
                          <strong>{formatCurrency(editingVenta.totalVenta || 0)}</strong>
                        </div>
                        <div className="resumen-row">
                          <span>Pagado Anteriormente:</span>
                          <strong>{formatCurrency(editingVenta.totalPagado || 0)}</strong>
                        </div>
                        <div className="resumen-row">
                          <span>Nuevos Pagos:</span>
                          <strong>{formatCurrency(
                            pagosVenta
                              .filter(p => p.isNew)
                              .reduce((sum, p) => sum + parseArgentineCurrency(p.montoPago), 0)
                          )}</strong>
                        </div>
                        <div className="resumen-row highlight">
                          <span>Deuda Restante:</span>
                          <strong>{formatCurrency(
                            (editingVenta.totalDeuda || 0) - 
                            pagosVenta
                              .filter(p => p.isNew)
                              .reduce((sum, p) => sum + parseArgentineCurrency(p.montoPago), 0)
                          )}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="resumen-row">
                          <span>Total Venta:</span>
                          <strong>{formatCurrency(calcularTotalVenta())}</strong>
                        </div>
                        <div className="resumen-row">
                          <span>Total Pagos:</span>
                          <strong>{formatCurrency(calcularTotalPagos())}</strong>
                        </div>
                        <div className="resumen-row highlight">
                          <span>Deuda:</span>
                          <strong>{formatCurrency(calcularTotalVenta() - calcularTotalPagos())}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeFormModal} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : editingVenta ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación personalizado */}
      {showConfirmModal && (
        <div className="confirmation-modal-overlay" onClick={closeConfirmModal}>
          <div className="confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-modal-header">
              <div className="warning-icon">⚠️</div>
              <h3>Confirmar Eliminación</h3>
            </div>
            <div className="confirmation-modal-body">
              <p className="warning-message">{confirmMessage}</p>
              <ul className="warning-list">
                <li>Esta acción no se puede deshacer</li>
                <li>El stock de los productos se revertirá</li>
              </ul>
            </div>
            <div className="confirmation-modal-footer">
              <button className="btn btn-secondary" onClick={closeConfirmModal}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleConfirm}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VentasGestion

