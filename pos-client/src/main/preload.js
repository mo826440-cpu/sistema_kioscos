// =====================================================
// SCRIPT PRELOAD DE ELECTRON
// =====================================================
//
// ¿Qué hace este archivo?
// Se ejecuta ANTES de que se cargue la aplicación React.
// Es un "puente" seguro entre el proceso principal (Node.js)
// y el proceso de renderizado (React/HTML).
//
// Expone las funciones de la base de datos de forma segura
// usando contextBridge, sin dar acceso directo a Node.js.
//
// =====================================================

const { contextBridge, ipcRenderer } = require('electron')

console.log('⚡ Preload script cargado correctamente')

// Exponer API segura a React
contextBridge.exposeInMainWorld('api', {
  // ===== PRODUCTOS =====
  
  getAllProductos: (filtroEstado = 'activo') => {
    return ipcRenderer.invoke('db:getAllProductos', filtroEstado)
  },
  
  getProductoById: (id) => {
    return ipcRenderer.invoke('db:getProductoById', id)
  },
  
  getProductByBarcode: (barcode) => {
    return ipcRenderer.invoke('db:getProductByBarcode', barcode)
  },
  
  searchProductos: (searchTerm) => {
    return ipcRenderer.invoke('db:searchProductos', searchTerm)
  },
  
  createProducto: (datos) => {
    return ipcRenderer.invoke('db:createProducto', datos)
  },
  
  updateProducto: (id, datos) => {
    return ipcRenderer.invoke('db:updateProducto', id, datos)
  },
  
  deleteProducto: (id) => {
    return ipcRenderer.invoke('db:deleteProducto', id)
  },
  
  toggleProductEstado: (id) => {
    return ipcRenderer.invoke('db:toggleProductEstado', id)
  },

  updateProductStock: (productId, quantity) => {
    return ipcRenderer.invoke('db:updateProductStock', productId, quantity)
  },
  
  getAllProducts: (filtroEstado = 'activo') => {
    return ipcRenderer.invoke('db:getAllProducts', filtroEstado)
  },
  
  // ===== VENTAS =====
  
  createSale: (sale, items) => {
    return ipcRenderer.invoke('db:createSale', sale, items)
  },
  
  getTodaySales: () => {
    return ipcRenderer.invoke('db:getTodaySales')
  },
  
  getTodayTotal: () => {
    return ipcRenderer.invoke('db:getTodayTotal')
  },
  
  getLowStockProducts: (threshold) => {
    return ipcRenderer.invoke('db:getLowStockProducts', threshold)
  },
  
  // ===== USUARIOS =====
  
  authenticateUser: (username, password) => {
    return ipcRenderer.invoke('db:authenticateUser', username, password)
  },
  
  getAllUsers: () => {
    return ipcRenderer.invoke('db:getAllUsers')
  },
  
  createUser: (userData) => {
    return ipcRenderer.invoke('db:createUser', userData)
  },
  
  updateUser: (userId, userData) => {
    return ipcRenderer.invoke('db:updateUser', userId, userData)
  },
  
  deleteUser: (userId) => {
    return ipcRenderer.invoke('db:deleteUser', userId)
  },
  
  // ===== CATEGORÍAS =====
  
  getAllCategorias: () => {
    return ipcRenderer.invoke('db:getAllCategorias')
  },
  
  getCategoriaById: (id) => {
    return ipcRenderer.invoke('db:getCategoriaById', id)
  },
  
  createCategoria: (datos) => {
    return ipcRenderer.invoke('db:createCategoria', datos)
  },
  
  updateCategoria: (id, datos) => {
    return ipcRenderer.invoke('db:updateCategoria', id, datos)
  },
  
  deleteCategoria: (id) => {
    return ipcRenderer.invoke('db:deleteCategoria', id)
  },
  
  // ===== MARCAS =====
  
  getAllMarcas: () => {
    return ipcRenderer.invoke('db:getAllMarcas')
  },
  
  getMarcaById: (id) => {
    return ipcRenderer.invoke('db:getMarcaById', id)
  },
  
  getMarcasByCategoria: (idCategoria) => {
    return ipcRenderer.invoke('db:getMarcasByCategoria', idCategoria)
  },
  
  createMarca: (datos) => {
    return ipcRenderer.invoke('db:createMarca', datos)
  },
  
  updateMarca: (id, datos) => {
    return ipcRenderer.invoke('db:updateMarca', id, datos)
  },
  
  deleteMarca: (id) => {
    return ipcRenderer.invoke('db:deleteMarca', id)
  },
  
  // ===== PROVEEDORES =====
  
  getAllProveedores: () => {
    return ipcRenderer.invoke('db:getAllProveedores')
  },
  
  getProveedorById: (id) => {
    return ipcRenderer.invoke('db:getProveedorById', id)
  },
  
  searchProveedores: (searchTerm) => {
    return ipcRenderer.invoke('db:searchProveedores', searchTerm)
  },
  
  createProveedor: (datos) => {
    return ipcRenderer.invoke('db:createProveedor', datos)
  },
  
  updateProveedor: (id, datos) => {
    return ipcRenderer.invoke('db:updateProveedor', id, datos)
  },
  
  deleteProveedor: (id) => {
    return ipcRenderer.invoke('db:deleteProveedor', id)
  },
  
  // ===== CLIENTES =====
  
  getAllClientes: (filtroEstado = 'activo') => {
    return ipcRenderer.invoke('db:getAllClientes', filtroEstado)
  },
  
  getClienteById: (id) => {
    return ipcRenderer.invoke('db:getClienteById', id)
  },
  
  searchClientes: (searchTerm) => {
    return ipcRenderer.invoke('db:searchClientes', searchTerm)
  },
  
  createCliente: (datos) => {
    return ipcRenderer.invoke('db:createCliente', datos)
  },
  
  updateCliente: (id, datos) => {
    return ipcRenderer.invoke('db:updateCliente', id, datos)
  },
  
  deleteCliente: (id) => {
    return ipcRenderer.invoke('db:deleteCliente', id)
  },
  
  toggleClienteEstado: (id) => {
    return ipcRenderer.invoke('db:toggleClienteEstado', id)
  },
  
  // ===== COMPRAS =====
  
  getAllCompras: () => {
    return ipcRenderer.invoke('db:getAllCompras')
  },
  
  getCompraById: (id) => {
    return ipcRenderer.invoke('db:getCompraById', id)
  },
  
  getComprasByProveedor: (idProveedor) => {
    return ipcRenderer.invoke('db:getComprasByProveedor', idProveedor)
  },
  
  createCompra: (compraData, detalles, pagos) => {
    return ipcRenderer.invoke('db:createCompra', compraData, detalles, pagos)
  },
  
  updateCompra: (idCompra, compraData) => {
    return ipcRenderer.invoke('db:updateCompra', idCompra, compraData)
  },
  
  deleteCompra: (id) => {
    return ipcRenderer.invoke('db:deleteCompra', id)
  },
  
  addPagoCompra: (idCompra, pago) => {
    return ipcRenderer.invoke('db:addPagoCompra', idCompra, pago)
  },

  // =====================================================
  // BACKUP
  // =====================================================

  exportDatabaseToSQL: () => {
    return ipcRenderer.invoke('db:exportDatabaseToSQL')
  },

  // =====================================================
  // VENTAS
  // =====================================================

  getAllVentas: () => {
    return ipcRenderer.invoke('db:getAllVentas')
  },

  getVentaById: (id) => {
    return ipcRenderer.invoke('db:getVentaById', id)
  },

  createVenta: (ventaData, detalles, pagos, usuarioRegistro) => {
    return ipcRenderer.invoke('db:createVenta', ventaData, detalles, pagos, usuarioRegistro)
  },

  updateVenta: (id, ventaData, nuevosPagos, usuarioActualizacion) => {
    return ipcRenderer.invoke('db:updateVenta', id, ventaData, nuevosPagos, usuarioActualizacion)
  },

  deleteVenta: (id) => {
    return ipcRenderer.invoke('db:deleteVenta', id)
  },

  addPagoVenta: (idVenta, pago) => {
    return ipcRenderer.invoke('db:addPagoVenta', idVenta, pago)
  },

  // =====================================================
  // SISTEMA
  // =====================================================

  getDownloadsPath: () => {
    return ipcRenderer.invoke('system:getDownloadsPath')
  },

  saveFile: (filePath, content) => {
    return ipcRenderer.invoke('system:saveFile', filePath, content)
  },

  saveBackup: (sqlContent) => {
    return ipcRenderer.invoke('system:saveBackup', sqlContent)
  }
})

console.log('✅ API expuesta a React mediante contextBridge')

