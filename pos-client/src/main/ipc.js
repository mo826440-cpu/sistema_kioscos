// =====================================================
// HANDLERS IPC - COMUNICACIÓN ENTRE PROCESOS
// =====================================================
//
// Este módulo define los handlers IPC (Inter-Process Communication)
// que permiten a React (proceso de renderizado) comunicarse con
// el proceso principal de Electron para acceder a la base de datos.
//
// =====================================================

const { ipcMain } = require('electron')
const db = require('./database')

// =====================================================
// REGISTRAR TODOS LOS HANDLERS
// =====================================================

function registerIPCHandlers() {
  console.log('🔌 Registrando handlers IPC...')
  
  // ===== PRODUCTOS =====
  
  // Obtener todos los productos
  ipcMain.handle('db:getAllProductos', async (event, filtroEstado = 'activo') => {
    try {
      return db.getAllProductos(filtroEstado)
    } catch (error) {
      console.error('Error en db:getAllProductos:', error)
      return []
    }
  })
  
  // Obtener producto por ID
  ipcMain.handle('db:getProductoById', async (event, id) => {
    try {
      return db.getProductoById(id)
    } catch (error) {
      console.error('Error en db:getProductoById:', error)
      return null
    }
  })
  
  // Buscar producto por código de barras
  ipcMain.handle('db:getProductByBarcode', async (event, barcode) => {
    try {
      return db.getProductByBarcode(barcode)
    } catch (error) {
      console.error('Error en db:getProductByBarcode:', error)
      return null
    }
  })
  
  // Buscar productos por término
  ipcMain.handle('db:searchProductos', async (event, searchTerm) => {
    try {
      return db.searchProductos(searchTerm)
    } catch (error) {
      console.error('Error en db:searchProductos:', error)
      return []
    }
  })
  
  // Crear producto
  ipcMain.handle('db:createProducto', async (event, datos) => {
    try {
      return db.createProducto(datos)
    } catch (error) {
      console.error('Error en db:createProducto:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar producto
  ipcMain.handle('db:updateProducto', async (event, id, datos) => {
    try {
      return db.updateProducto(id, datos)
    } catch (error) {
      console.error('Error en db:updateProducto:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Eliminar producto
  ipcMain.handle('db:deleteProducto', async (event, id) => {
    try {
      return db.deleteProducto(id)
    } catch (error) {
      console.error('Error en db:deleteProducto:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Activar/Desactivar producto
  ipcMain.handle('db:toggleProductEstado', async (event, id) => {
    try {
      return db.toggleProductEstado(id)
    } catch (error) {
      console.error('Error en db:toggleProductEstado:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar stock de producto
  ipcMain.handle('db:updateProductStock', async (event, productId, quantity) => {
    try {
      return db.updateProductStock(productId, quantity)
    } catch (error) {
      console.error('Error en db:updateProductStock:', error)
      return false
    }
  })
  
  // Compatibilidad con código anterior
  ipcMain.handle('db:getAllProducts', async (event, filtroEstado = 'activo') => {
    try {
      return db.getAllProducts(filtroEstado)
    } catch (error) {
      console.error('Error en db:getAllProducts:', error)
      return []
    }
  })
  
  // ===== VENTAS =====
  
  // Crear venta completa
  ipcMain.handle('db:createSale', async (event, sale, items) => {
    try {
      return db.createSale(sale, items)
    } catch (error) {
      console.error('Error en db:createSale:', error)
      return null
    }
  })
  
  // Obtener ventas del día
  ipcMain.handle('db:getTodaySales', async (event) => {
    try {
      return db.getTodaySales()
    } catch (error) {
      console.error('Error en db:getTodaySales:', error)
      return []
    }
  })
  
  // Obtener total de ventas del día
  ipcMain.handle('db:getTodayTotal', async (event) => {
    try {
      return db.getTodayTotal()
    } catch (error) {
      console.error('Error en db:getTodayTotal:', error)
      return 0
    }
  })
  
  // Obtener productos con bajo stock
  ipcMain.handle('db:getLowStockProducts', async (event, threshold) => {
    try {
      return db.getLowStockProducts(threshold)
    } catch (error) {
      console.error('Error en db:getLowStockProducts:', error)
      return []
    }
  })
  
  // ===== USUARIOS =====
  
  // Autenticar usuario
  ipcMain.handle('db:authenticateUser', async (event, username, password) => {
    try {
      return db.authenticateUser(username, password)
    } catch (error) {
      console.error('Error en db:authenticateUser:', error)
      return null
    }
  })
  
  // Obtener todos los usuarios
  ipcMain.handle('db:getAllUsers', async (event) => {
    try {
      return db.getAllUsers()
    } catch (error) {
      console.error('Error en db:getAllUsers:', error)
      return []
    }
  })
  
  // Crear usuario
  ipcMain.handle('db:createUser', async (event, userData) => {
    try {
      return db.createUser(userData)
    } catch (error) {
      console.error('Error en db:createUser:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar usuario
  ipcMain.handle('db:updateUser', async (event, userId, userData) => {
    try {
      return db.updateUser(userId, userData)
    } catch (error) {
      console.error('Error en db:updateUser:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Eliminar usuario
  ipcMain.handle('db:deleteUser', async (event, userId) => {
    try {
      return db.deleteUser(userId)
    } catch (error) {
      console.error('Error en db:deleteUser:', error)
      return { success: false, error: error.message }
    }
  })
  
  // ===== CATEGORÍAS =====
  
  // Obtener todas las categorías
  ipcMain.handle('db:getAllCategorias', async (event) => {
    try {
      return db.getAllCategorias()
    } catch (error) {
      console.error('Error en db:getAllCategorias:', error)
      return []
    }
  })
  
  // Obtener categoría por ID
  ipcMain.handle('db:getCategoriaById', async (event, id) => {
    try {
      return db.getCategoriaById(id)
    } catch (error) {
      console.error('Error en db:getCategoriaById:', error)
      return null
    }
  })
  
  // Crear categoría
  ipcMain.handle('db:createCategoria', async (event, datos) => {
    try {
      return db.createCategoria(datos)
    } catch (error) {
      console.error('Error en db:createCategoria:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar categoría
  ipcMain.handle('db:updateCategoria', async (event, id, datos) => {
    try {
      return db.updateCategoria(id, datos)
    } catch (error) {
      console.error('Error en db:updateCategoria:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Eliminar categoría
  ipcMain.handle('db:deleteCategoria', async (event, id) => {
    try {
      return db.deleteCategoria(id)
    } catch (error) {
      console.error('Error en db:deleteCategoria:', error)
      return { success: false, error: error.message }
    }
  })
  
  // ===== MARCAS =====
  
  // Obtener todas las marcas
  ipcMain.handle('db:getAllMarcas', async (event) => {
    try {
      return db.getAllMarcas()
    } catch (error) {
      console.error('Error en db:getAllMarcas:', error)
      return []
    }
  })
  
  // Obtener marca por ID
  ipcMain.handle('db:getMarcaById', async (event, id) => {
    try {
      return db.getMarcaById(id)
    } catch (error) {
      console.error('Error en db:getMarcaById:', error)
      return null
    }
  })
  
  // Obtener marcas por categoría
  ipcMain.handle('db:getMarcasByCategoria', async (event, idCategoria) => {
    try {
      return db.getMarcasByCategoria(idCategoria)
    } catch (error) {
      console.error('Error en db:getMarcasByCategoria:', error)
      return []
    }
  })
  
  // Crear marca
  ipcMain.handle('db:createMarca', async (event, datos) => {
    try {
      return db.createMarca(datos)
    } catch (error) {
      console.error('Error en db:createMarca:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar marca
  ipcMain.handle('db:updateMarca', async (event, id, datos) => {
    try {
      return db.updateMarca(id, datos)
    } catch (error) {
      console.error('Error en db:updateMarca:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Eliminar marca
  ipcMain.handle('db:deleteMarca', async (event, id) => {
    try {
      return db.deleteMarca(id)
    } catch (error) {
      console.error('Error en db:deleteMarca:', error)
      return { success: false, error: error.message }
    }
  })
  
  // ===== PROVEEDORES =====
  
  // Obtener todos los proveedores
  ipcMain.handle('db:getAllProveedores', async (event) => {
    try {
      return db.getAllProveedores()
    } catch (error) {
      console.error('Error en db:getAllProveedores:', error)
      return []
    }
  })
  
  // Obtener proveedor por ID
  ipcMain.handle('db:getProveedorById', async (event, id) => {
    try {
      return db.getProveedorById(id)
    } catch (error) {
      console.error('Error en db:getProveedorById:', error)
      return null
    }
  })
  
  // Buscar proveedores
  ipcMain.handle('db:searchProveedores', async (event, searchTerm) => {
    try {
      return db.searchProveedores(searchTerm)
    } catch (error) {
      console.error('Error en db:searchProveedores:', error)
      return []
    }
  })
  
  // Crear proveedor
  ipcMain.handle('db:createProveedor', async (event, datos) => {
    try {
      return db.createProveedor(datos)
    } catch (error) {
      console.error('Error en db:createProveedor:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar proveedor
  ipcMain.handle('db:updateProveedor', async (event, id, datos) => {
    try {
      return db.updateProveedor(id, datos)
    } catch (error) {
      console.error('Error en db:updateProveedor:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Eliminar proveedor
  ipcMain.handle('db:deleteProveedor', async (event, id) => {
    try {
      return db.deleteProveedor(id)
    } catch (error) {
      console.error('Error en db:deleteProveedor:', error)
      return { success: false, error: error.message }
    }
  })
  
  // ===== CLIENTES =====
  
  // Obtener todos los clientes
  ipcMain.handle('db:getAllClientes', async (event, filtroEstado = 'activo') => {
    try {
      return db.getAllClientes(filtroEstado)
    } catch (error) {
      console.error('Error en db:getAllClientes:', error)
      return []
    }
  })
  
  // Obtener cliente por ID
  ipcMain.handle('db:getClienteById', async (event, id) => {
    try {
      return db.getClienteById(id)
    } catch (error) {
      console.error('Error en db:getClienteById:', error)
      return null
    }
  })
  
  // Buscar clientes
  ipcMain.handle('db:searchClientes', async (event, searchTerm) => {
    try {
      return db.searchClientes(searchTerm)
    } catch (error) {
      console.error('Error en db:searchClientes:', error)
      return []
    }
  })
  
  // Crear cliente
  ipcMain.handle('db:createCliente', async (event, datos) => {
    try {
      return db.createCliente(datos)
    } catch (error) {
      console.error('Error en db:createCliente:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar cliente
  ipcMain.handle('db:updateCliente', async (event, id, datos) => {
    try {
      return db.updateCliente(id, datos)
    } catch (error) {
      console.error('Error en db:updateCliente:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Eliminar cliente
  ipcMain.handle('db:deleteCliente', async (event, id) => {
    try {
      return db.deleteCliente(id)
    } catch (error) {
      console.error('Error en db:deleteCliente:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Activar/Desactivar cliente
  ipcMain.handle('db:toggleClienteEstado', async (event, id) => {
    try {
      return db.toggleClienteEstado(id)
    } catch (error) {
      console.error('Error en db:toggleClienteEstado:', error)
      return { success: false, error: error.message }
    }
  })
  
  // ===== COMPRAS =====
  
  // Obtener todas las compras
  ipcMain.handle('db:getAllCompras', async (event) => {
    try {
      return db.getAllCompras()
    } catch (error) {
      console.error('Error en db:getAllCompras:', error)
      return []
    }
  })
  
  // Obtener compra por ID
  ipcMain.handle('db:getCompraById', async (event, id) => {
    try {
      return db.getCompraById(id)
    } catch (error) {
      console.error('Error en db:getCompraById:', error)
      return null
    }
  })
  
  // Obtener compras por proveedor
  ipcMain.handle('db:getComprasByProveedor', async (event, idProveedor) => {
    try {
      return db.getComprasByProveedor(idProveedor)
    } catch (error) {
      console.error('Error en db:getComprasByProveedor:', error)
      return []
    }
  })
  
  // Crear compra
  ipcMain.handle('db:createCompra', async (event, compraData, detalles, pagos) => {
    try {
      return db.createCompra(compraData, detalles, pagos)
    } catch (error) {
      console.error('Error en db:createCompra:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Actualizar compra
  ipcMain.handle('db:updateCompra', async (event, idCompra, compraData) => {
    try {
      return db.updateCompra(idCompra, compraData)
    } catch (error) {
      console.error('Error en db:updateCompra:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Eliminar compra
  ipcMain.handle('db:deleteCompra', async (event, id) => {
    try {
      return db.deleteCompra(id)
    } catch (error) {
      console.error('Error en db:deleteCompra:', error)
      return { success: false, error: error.message }
    }
  })
  
  // Agregar pago a compra
  ipcMain.handle('db:addPagoCompra', async (event, idCompra, pago) => {
    try {
      return db.addPagoCompra(idCompra, pago)
    } catch (error) {
      console.error('Error en db:addPagoCompra:', error)
      return { success: false, error: error.message }
    }
  })

  // =====================================================
  // BACKUP
  // =====================================================

  ipcMain.handle('db:exportDatabaseToSQL', async () => {
    try {
      return db.exportDatabaseToSQL()
    } catch (error) {
      console.error('Error en db:exportDatabaseToSQL:', error)
      return { success: false, error: error.message }
    }
  })

  // =====================================================
  // VENTAS
  // =====================================================

  ipcMain.handle('db:getAllVentas', async () => {
    try {
      return db.getAllVentas()
    } catch (error) {
      console.error('Error en db:getAllVentas:', error)
      return []
    }
  })

  ipcMain.handle('db:getVentaById', async (event, id) => {
    try {
      return db.getVentaById(id)
    } catch (error) {
      console.error('Error en db:getVentaById:', error)
      return null
    }
  })

  ipcMain.handle('db:createVenta', async (event, ventaData, detalles, pagos, usuarioRegistro) => {
    try {
      return db.createVenta(ventaData, detalles, pagos, usuarioRegistro)
    } catch (error) {
      console.error('Error en db:createVenta:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:updateVenta', async (event, id, ventaData, nuevosPagos, usuarioActualizacion) => {
    try {
      return db.updateVenta(id, ventaData, nuevosPagos, usuarioActualizacion)
    } catch (error) {
      console.error('Error en db:updateVenta:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deleteVenta', async (event, id) => {
    try {
      return db.deleteVenta(id)
    } catch (error) {
      console.error('Error en db:deleteVenta:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:addPagoVenta', async (event, idVenta, pago) => {
    try {
      return db.addPagoVenta(idVenta, pago)
    } catch (error) {
      console.error('Error en db:addPagoVenta:', error)
      return { success: false, error: error.message }
    }
  })

  // =====================================================
  // SISTEMA
  // =====================================================

  const { app } = require('electron')
  const path = require('path')
  const fs = require('fs')

  ipcMain.handle('system:getDownloadsPath', async () => {
    try {
      return app.getPath('downloads')
    } catch (error) {
      console.error('Error al obtener ruta de descargas:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('system:saveFile', async (event, filePath, content) => {
    try {
      fs.writeFileSync(filePath, content, 'utf8')
      return { success: true, path: filePath }
    } catch (error) {
      console.error('Error al guardar archivo:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('system:saveBackup', async (event, sqlContent) => {
    try {
      const downloadsPath = app.getPath('downloads')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const fileName = `backup_pos_${timestamp}.sql`
      const filePath = path.join(downloadsPath, fileName)
      
      fs.writeFileSync(filePath, sqlContent, 'utf8')
      return { success: true, path: filePath, fileName }
    } catch (error) {
      console.error('Error al guardar backup:', error)
      return { success: false, error: error.message }
    }
  })
  
  console.log('✅ Handlers IPC registrados')
}

// =====================================================
// EXPORTAR
// =====================================================

module.exports = {
  registerIPCHandlers
}

