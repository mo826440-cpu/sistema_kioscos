// =====================================================
// MÓDULO DE BASE DE DATOS SQLITE - PROCESO PRINCIPAL
// =====================================================
//
// Este módulo maneja la base de datos SQLite desde el
// proceso principal de Electron. Los datos se guardan
// en un archivo .db en disco y persisten entre sesiones.
//
// =====================================================

const initSqlJs = require('sql.js')
const path = require('path')
const fs = require('fs')
const { app } = require('electron')
const bcrypt = require('bcryptjs')

// Ruta donde se guardará el archivo de base de datos
const DB_PATH = path.join(app.getPath('userData'), 'pos.db')

console.log('📂 Ruta de base de datos:', DB_PATH)

// Variable para la base de datos
let db = null
let SQL = null

// =====================================================
// INICIALIZAR BASE DE DATOS
// =====================================================

async function initializeDatabase() {
  try {
    // Inicializar sql.js
    SQL = await initSqlJs()
    
    // Cargar base de datos existente o crear nueva
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH)
      db = new SQL.Database(buffer)
      console.log('✅ Base de datos cargada desde archivo')
    } else {
      db = new SQL.Database()
      console.log('✅ Nueva base de datos creada')
      
      // Crear tablas
      createTables()
      
      // Cargar productos de ejemplo
      loadSampleData()
      
      // Guardar por primera vez
      saveDatabase()
    }
    
    return true
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error)
    return false
  }
}

// =====================================================
// CREAR TABLAS
// =====================================================

function createTables() {
  console.log('📊 Creando tablas...')
  
  // Tabla de productos
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0.00,
      cost REAL NOT NULL DEFAULT 0.00,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      image_url TEXT,
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Tabla de ventas
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_number TEXT NOT NULL UNIQUE,
      total REAL NOT NULL DEFAULT 0.00,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      cashier_id INTEGER,
      pos_id INTEGER,
      status TEXT NOT NULL DEFAULT 'completed',
      synced BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Tabla de items de venta
  db.run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      barcode TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0.00,
      subtotal REAL NOT NULL DEFAULT 0.00,
      discount REAL NOT NULL DEFAULT 0.00,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)
  
  // Tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      permissions TEXT NOT NULL DEFAULT '{}',
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  console.log('✅ Tablas creadas')
  
  // Crear usuario administrador por defecto si no existe
  createDefaultAdmin()
}

// =====================================================
// CREAR USUARIO ADMINISTRADOR POR DEFECTO
// =====================================================

function createDefaultAdmin() {
  if (!db) return
  
  try {
    // Verificar si existe la tabla usuarios (migrada) o users (nueva)
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND (name='usuarios' OR name='users')")
    
    if (tables.length === 0 || tables[0].values.length === 0) {
      return
    }
    
    const tableName = tables[0].values[0][0]
    
    if (tableName === 'usuarios') {
      // BD migrada - verificar si ya hay un admin
      const result = db.exec('SELECT COUNT(*) as count FROM usuarios WHERE cargo = "administrador"')
      const count = result[0].values[0][0]
      console.log(`✅ Base de datos migrada detectada. Usuarios admin existentes: ${count}`)
    } else {
      // BD nueva - crear admin por defecto
      const result = db.exec('SELECT COUNT(*) as count FROM users WHERE role = "admin"')
      const count = result[0].values[0][0]
      
      if (count === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10)
        db.run(
          `INSERT INTO users (username, password, full_name, role, permissions)
           VALUES (?, ?, ?, ?, ?)`,
          ['admin', hashedPassword, 'Administrador', 'admin', '{"all": true}']
        )
        console.log('✅ Usuario administrador creado (admin/admin123)')
      }
    }
  } catch (error) {
    console.error('Error al verificar usuario admin:', error)
  }
}

// =====================================================
// GUARDAR BASE DE DATOS EN DISCO
// =====================================================

function saveDatabase() {
  if (!db) return
  
  try {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(DB_PATH, buffer)
    // console.log('💾 Base de datos guardada')
  } catch (error) {
    console.error('❌ Error al guardar base de datos:', error)
  }
}

// =====================================================
// FUNCIONES DE PRODUCTOS
// =====================================================

function getAllProductos(filtroEstado = 'activo') {
  if (!db) return []
  
  try {
    let query = `
      SELECT 
        p.*,
        COALESCE(p.estado, 'activo') as estado,
        c.nombreCategoria,
        m.nombreMarca
      FROM productos p
      LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN marcas m ON p.idMarca = m.idMarca
    `
    
    // Filtrar por estado si se especifica
    if (filtroEstado === 'activo') {
      query += ` WHERE COALESCE(p.estado, 'activo') = 'activo'`
    } else if (filtroEstado === 'inactivo') {
      query += ` WHERE p.estado = 'inactivo'`
    }
    // Si es 'todos', no agregamos filtro
    
    query += ` ORDER BY p.nombreProducto`
    
    const result = db.exec(query)
    if (result.length > 0) {
      const products = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const product = {}
        columns.forEach((col, index) => {
          product[col] = row[index]
        })
        products.push(product)
      })
      return products
    }
    return []
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return []
  }
}

function getProductoById(id) {
  if (!db) return null
  
  try {
    const result = db.exec(`
      SELECT 
        p.*,
        c.nombreCategoria,
        m.nombreMarca
      FROM productos p
      LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN marcas m ON p.idMarca = m.idMarca
      WHERE p.idProducto = ?
    `, [id])
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0]
      const columns = result[0].columns
      const product = {}
      columns.forEach((col, index) => {
        product[col] = row[index]
      })
      return product
    }
    return null
  } catch (error) {
    console.error('Error al buscar producto:', error)
    return null
  }
}

function getProductByBarcode(barcode) {
  if (!db) return null
  
  try {
    const result = db.exec(`
      SELECT 
        p.*,
        c.nombreCategoria,
        m.nombreMarca
      FROM productos p
      LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN marcas m ON p.idMarca = m.idMarca
      WHERE p.codigoBarras = ?
    `, [barcode])
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0]
      const columns = result[0].columns
      const product = {}
      columns.forEach((col, index) => {
        product[col] = row[index]
      })
      return product
    }
    return null
  } catch (error) {
    console.error('Error al buscar producto por código:', error)
    return null
  }
}

function searchProductos(searchTerm) {
  if (!db) return []
  
  try {
    const result = db.exec(`
      SELECT 
        p.*,
        c.nombreCategoria,
        m.nombreMarca
      FROM productos p
      LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN marcas m ON p.idMarca = m.idMarca
      WHERE 
        p.codigoBarras LIKE ? OR 
        p.nombreProducto LIKE ?
      ORDER BY p.nombreProducto
      LIMIT 50
    `, [`%${searchTerm}%`, `%${searchTerm}%`])
    
    if (result.length > 0) {
      const products = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const product = {}
        columns.forEach((col, index) => {
          product[col] = row[index]
        })
        products.push(product)
      })
      return products
    }
    return []
  } catch (error) {
    console.error('Error al buscar productos:', error)
    return []
  }
}

function createProducto(datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si ya existe un producto con ese código de barras
    const existing = db.exec(
      'SELECT COUNT(*) as count FROM productos WHERE codigoBarras = ?',
      [datos.codigoBarras]
    )
    if (existing[0].values[0][0] > 0) {
      return { success: false, error: 'Ya existe un producto con ese código de barras' }
    }
    
    // Obtener el siguiente ID
    const maxIdResult = db.exec('SELECT COALESCE(MAX(idProducto), 0) + 1 as nextId FROM productos')
    const nextId = maxIdResult[0].values[0][0]
    
    // Calcular precio final si hay descuento
    const precioVenta = parseFloat(datos.precioVenta) || 0
    const descuento = parseFloat(datos.descuento) || 0
    const precioFinal = descuento > 0 ? precioVenta * (1 - descuento / 100) : precioVenta
    
    db.run(
      `INSERT INTO productos (
        idProducto, codigoBarras, nombreProducto, idCategoria, idMarca,
        precioVenta, descuento, precioFinal, fechaFinalDescuento, stockActual, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        datos.codigoBarras,
        datos.nombreProducto,
        datos.idCategoria || null,
        datos.idMarca || null,
        precioVenta,
        descuento,
        precioFinal,
        datos.fechaFinalDescuento || null,
        parseInt(datos.stockActual) || 0,
        'activo'
      ]
    )
    
    saveDatabase()
    return { success: true, id: nextId }
  } catch (error) {
    console.error('Error al crear producto:', error)
    return { success: false, error: error.message }
  }
}

function updateProducto(id, datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    const fields = []
    const values = []
    
    if (datos.codigoBarras !== undefined) {
      // Verificar que no exista otro producto con ese código
      const existing = db.exec(
        'SELECT COUNT(*) as count FROM productos WHERE codigoBarras = ? AND idProducto != ?',
        [datos.codigoBarras, id]
      )
      if (existing[0].values[0][0] > 0) {
        return { success: false, error: 'Ya existe otro producto con ese código de barras' }
      }
      fields.push('codigoBarras = ?')
      values.push(datos.codigoBarras)
    }
    
    if (datos.nombreProducto !== undefined) {
      fields.push('nombreProducto = ?')
      values.push(datos.nombreProducto)
    }
    
    if (datos.idCategoria !== undefined) {
      fields.push('idCategoria = ?')
      values.push(datos.idCategoria)
    }
    
    if (datos.idMarca !== undefined) {
      fields.push('idMarca = ?')
      values.push(datos.idMarca)
    }
    
    if (datos.precioVenta !== undefined) {
      fields.push('precioVenta = ?')
      values.push(parseFloat(datos.precioVenta))
      
      // Recalcular precio final
      const descuento = datos.descuento !== undefined ? parseFloat(datos.descuento) : 0
      const precioFinal = descuento > 0 
        ? parseFloat(datos.precioVenta) * (1 - descuento / 100) 
        : parseFloat(datos.precioVenta)
      fields.push('precioFinal = ?')
      values.push(precioFinal)
    }
    
    if (datos.descuento !== undefined) {
      fields.push('descuento = ?')
      values.push(parseFloat(datos.descuento))
      
      // Si hay precio de venta, recalcular precio final
      if (datos.precioVenta !== undefined) {
        const precioFinal = parseFloat(datos.descuento) > 0 
          ? parseFloat(datos.precioVenta) * (1 - parseFloat(datos.descuento) / 100) 
          : parseFloat(datos.precioVenta)
        fields.push('precioFinal = ?')
        values.push(precioFinal)
      }
    }
    
    if (datos.fechaFinalDescuento !== undefined) {
      fields.push('fechaFinalDescuento = ?')
      values.push(datos.fechaFinalDescuento)
    }
    
    if (datos.stockActual !== undefined) {
      fields.push('stockActual = ?')
      values.push(parseInt(datos.stockActual))
    }
    
    if (fields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' }
    }
    
    fields.push('fechaActualizacion = CURRENT_TIMESTAMP')
    values.push(id)
    
    db.run(
      `UPDATE productos SET ${fields.join(', ')} WHERE idProducto = ?`,
      values
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return { success: false, error: error.message }
  }
}

function deleteProducto(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // En lugar de eliminar, desactivamos el producto
    db.run('UPDATE productos SET estado = ? WHERE idProducto = ?', ['inactivo', id])
    saveDatabase()
    return { success: true, message: 'Producto desactivado correctamente' }
  } catch (error) {
    console.error('Error al desactivar producto:', error)
    return { success: false, error: error.message }
  }
}

function toggleProductEstado(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Obtener el estado actual (usando COALESCE para manejar NULL)
    const result = db.exec('SELECT COALESCE(estado, "activo") as estado FROM productos WHERE idProducto = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) {
      return { success: false, error: 'Producto no encontrado' }
    }
    
    const estadoActual = result[0].values[0][0]
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    
    db.run('UPDATE productos SET estado = ? WHERE idProducto = ?', [nuevoEstado, id])
    saveDatabase()
    
    return { 
      success: true, 
      nuevoEstado,
      message: `Producto ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`
    }
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error)
    return { success: false, error: error.message }
  }
}

function updateProductStock(productId, quantity) {
  if (!db) return false
  
  try {
    db.run('UPDATE productos SET stockActual = stockActual - ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE idProducto = ?', [quantity, productId])
    saveDatabase()
    return true
  } catch (error) {
    console.error('Error al actualizar stock:', error)
    return false
  }
}

// Mantener compatibilidad con código anterior
function getAllProducts(filtroEstado = 'activo') {
  return getAllProductos(filtroEstado)
}

// =====================================================
// FUNCIONES DE VENTAS
// =====================================================

function createSale(sale, items) {
  if (!db) return null
  
  try {
    // 1. Insertar la venta
    db.run(
      `INSERT INTO sales (sale_number, total, payment_method, status)
       VALUES (?, ?, ?, ?)`,
      [sale.sale_number, sale.total, sale.payment_method, 'completed']
    )
    
    // Obtener el ID de la venta recién insertada
    const result = db.exec('SELECT last_insert_rowid() as id')
    const saleId = result[0].values[0][0]

    // 2. Insertar los items
    for (const item of items) {
      db.run(
        `INSERT INTO sale_items (sale_id, product_id, barcode, product_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.product_id,
          item.barcode,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.subtotal
        ]
      )

      // 3. Actualizar stock
      updateProductStock(item.product_id, item.quantity)
    }

    // Guardar todos los cambios
    saveDatabase()
    
    console.log('✅ Venta guardada:', saleId)
    return saleId
  } catch (error) {
    console.error('Error al crear venta:', error)
    return null
  }
}

function getTodaySales() {
  if (!db) return []
  
  try {
    const result = db.exec(`
      SELECT * FROM sales 
      WHERE DATE(created_at) = DATE('now')
      ORDER BY created_at DESC
    `)
    
    if (result.length > 0) {
      const sales = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const sale = {}
        columns.forEach((col, index) => {
          sale[col] = row[index]
        })
        sales.push(sale)
      })
      return sales
    }
    return []
  } catch (error) {
    console.error('Error al obtener ventas del día:', error)
    return []
  }
}

function getTodayTotal() {
  if (!db) return 0
  
  try {
    const result = db.exec(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM sales 
      WHERE DATE(created_at) = DATE('now') AND status = 'completed'
    `)
    
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0]
    }
    return 0
  } catch (error) {
    console.error('Error al obtener total del día:', error)
    return 0
  }
}

// =====================================================
// CARGAR DATOS DE EJEMPLO
// =====================================================

function loadSampleData() {
  console.log('📦 Cargando productos de ejemplo...')
  
  const products = [
    // BEBIDAS
    { barcode: '7790310981011', name: 'Coca Cola 2.25L', price: 350.00, cost: 220.00, stock: 50, category: 'Bebidas' },
    { barcode: '7790310981028', name: 'Coca Cola 1.5L', price: 280.00, cost: 180.00, stock: 60, category: 'Bebidas' },
    { barcode: '7790310981035', name: 'Sprite 2.25L', price: 330.00, cost: 210.00, stock: 45, category: 'Bebidas' },
    { barcode: '7791813100027', name: 'Agua Villavicencio 2L', price: 180.00, cost: 120.00, stock: 80, category: 'Bebidas' },
    { barcode: '7798097570014', name: 'Cerveza Quilmes 1L', price: 420.00, cost: 280.00, stock: 35, category: 'Bebidas' },
    
    // LACTEOS
    { barcode: '7790315001438', name: 'Leche La Serenisima 1L', price: 280.00, cost: 190.00, stock: 100, category: 'Lacteos' },
    { barcode: '7790315001445', name: 'Yogur La Serenisima 1Kg', price: 450.00, cost: 300.00, stock: 40, category: 'Lacteos' },
    { barcode: '7790742100011', name: 'Queso Cremoso Mendicrim 200g', price: 380.00, cost: 250.00, stock: 30, category: 'Lacteos' },
    
    // ALMACEN
    { barcode: '7790387110012', name: 'Fideos Matarazzo 500g', price: 280.00, cost: 180.00, stock: 90, category: 'Almacen' },
    { barcode: '7790261054011', name: 'Arroz Gallo Oro 1Kg', price: 420.00, cost: 280.00, stock: 80, category: 'Almacen' },
    { barcode: '7790070660015', name: 'Aceite Cocinero 900ml', price: 850.00, cost: 600.00, stock: 40, category: 'Almacen' },
    { barcode: '7790040755017', name: 'Azucar Ledesma 1Kg', price: 380.00, cost: 250.00, stock: 100, category: 'Almacen' },
    
    // SNACKS
    { barcode: '7790040170018', name: 'Papas Lays 170g', price: 520.00, cost: 350.00, stock: 80, category: 'Snacks' },
    { barcode: '7622210801012', name: 'Chocolate Milka 100g', price: 580.00, cost: 390.00, stock: 60, category: 'Snacks' },
    { barcode: '7790310790019', name: 'Galletitas Oreo 118g', price: 380.00, cost: 250.00, stock: 90, category: 'Snacks' },
  ]
  
  products.forEach(product => {
    db.run(
      `INSERT INTO products (barcode, name, price, cost, stock, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product.barcode, product.name, product.price, product.cost, product.stock, product.category]
    )
  })
  
  console.log(`✅ ${products.length} productos cargados`)
}

// =====================================================
// FUNCIONES DE USUARIOS Y AUTENTICACIÓN
// =====================================================

function authenticateUser(username, password) {
  if (!db) return null
  
  try {
    // Buscar usuario por nombre de usuario en la tabla migrada 'usuarios'
    const result = db.exec(
      'SELECT * FROM usuarios WHERE nombreUsuario = ? AND estado = "activo"',
      [username]
    )
    
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0]
      const columns = result[0].columns
      const user = {}
      columns.forEach((col, index) => {
        user[col] = row[index]
      })
      
      // Verificar la contraseña con bcrypt
      // Las contraseñas en la BD migrada usan $2y$ (PHP), bcryptjs es compatible
      const passwordMatch = bcrypt.compareSync(password, user.contrasena)
      
      if (!passwordMatch) {
        return null
      }
      
      // Mapear roles de español a inglés
      const roleMap = {
        'administrador': 'admin',
        'cajero': 'cashier',
        'gerente': 'manager',
        'visor': 'viewer'
      }
      
      // Mapear campos a la estructura esperada por el frontend
      const mappedUser = {
        id: user.idUsuario,
        username: user.nombreUsuario,
        full_name: user.nombreUsuario, // Usar nombreUsuario como full_name
        role: roleMap[user.cargo] || user.cargo, // Mapear rol a inglés
        active: user.estado === 'activo' ? 1 : 0,
        description: user.descripcion,
        permissions: {} // Los permisos están en otra tabla
      }
      
      return mappedUser
    }
    return null
  } catch (error) {
    console.error('Error al autenticar usuario:', error)
    return null
  }
}

function getAllUsers() {
  if (!db) return []
  
  try {
    const result = db.exec('SELECT idUsuario, nombreUsuario, cargo, estado, descripcion FROM usuarios ORDER BY nombreUsuario')
    if (result.length > 0) {
      const users = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const user = {}
        columns.forEach((col, index) => {
          user[col] = row[index]
        })
        // Mapear a estructura esperada
        users.push({
          id: user.idUsuario,
          username: user.nombreUsuario,
          full_name: user.nombreUsuario,
          role: user.cargo,
          active: user.estado === 'activo' ? 1 : 0,
          description: user.descripcion
        })
      })
      return users
    }
    return []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

function createUser(userData) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si el usuario ya existe
    const existing = db.exec('SELECT COUNT(*) as count FROM usuarios WHERE nombreUsuario = ?', [userData.username])
    if (existing[0].values[0][0] > 0) {
      return { success: false, error: 'El nombre de usuario ya existe' }
    }
    
    // Obtener el siguiente ID (MAX + 1)
    const maxIdResult = db.exec('SELECT COALESCE(MAX(idUsuario), 0) + 1 as nextId FROM usuarios')
    const nextId = maxIdResult[0].values[0][0]
    
    // Hashear la contraseña
    const hashedPassword = bcrypt.hashSync(userData.password, 10)
    
    // Crear usuario en tabla migrada
    db.run(
      `INSERT INTO usuarios (idUsuario, nombreUsuario, contrasena, cargo, estado, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        userData.username,
        hashedPassword,
        userData.role || 'cajero',
        'activo',
        userData.description || ''
      ]
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return { success: false, error: error.message }
  }
}

function updateUser(userId, userData) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    const fields = []
    const values = []
    
    if (userData.username !== undefined) {
      fields.push('nombreUsuario = ?')
      values.push(userData.username)
    }
    if (userData.role !== undefined) {
      fields.push('cargo = ?')
      values.push(userData.role)
    }
    if (userData.description !== undefined) {
      fields.push('descripcion = ?')
      values.push(userData.description)
    }
    if (userData.password !== undefined) {
      fields.push('contrasena = ?')
      const hashedPassword = bcrypt.hashSync(userData.password, 10)
      values.push(hashedPassword)
    }
    if (userData.active !== undefined) {
      fields.push('estado = ?')
      values.push(userData.active ? 'activo' : 'inactivo')
    }
    
    if (fields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' }
    }
    
    values.push(userId)
    
    db.run(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE idUsuario = ?`,
      values
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return { success: false, error: error.message }
  }
}

function deleteUser(userId) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // No permitir eliminar al usuario con ID 1 (admin principal)
    if (userId === 1) {
      return { success: false, error: 'No se puede eliminar el usuario administrador principal' }
    }
    
    db.run('DELETE FROM usuarios WHERE idUsuario = ?', [userId])
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return { success: false, error: error.message }
  }
}

function getLowStockProducts(threshold = 10) {
  if (!db) return []
  
  try {
    const result = db.exec(
      `SELECT 
        p.*,
        c.nombreCategoria,
        m.nombreMarca
      FROM productos p
      LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN marcas m ON p.idMarca = m.idMarca
      WHERE p.stockActual <= ? 
      ORDER BY p.stockActual ASC`,
      [threshold]
    )
    
    if (result.length > 0) {
      const products = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const product = {}
        columns.forEach((col, index) => {
          product[col] = row[index]
        })
        products.push(product)
      })
      return products
    }
    return []
  } catch (error) {
    console.error('Error al obtener productos con bajo stock:', error)
    return []
  }
}

// =====================================================
// FUNCIONES DE CATEGORÍAS
// =====================================================

function getAllCategorias() {
  if (!db) return []
  
  try {
    const result = db.exec('SELECT * FROM categorias ORDER BY nombreCategoria')
    if (result.length > 0) {
      const categorias = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const categoria = {}
        columns.forEach((col, index) => {
          categoria[col] = row[index]
        })
        categorias.push(categoria)
      })
      return categorias
    }
    return []
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return []
  }
}

function getCategoriaById(id) {
  if (!db) return null
  
  try {
    const result = db.exec('SELECT * FROM categorias WHERE idCategoria = ?', [id])
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0]
      const columns = result[0].columns
      const categoria = {}
      columns.forEach((col, index) => {
        categoria[col] = row[index]
      })
      return categoria
    }
    return null
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    return null
  }
}

function createCategoria(datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si ya existe una categoría con ese nombre
    const existing = db.exec(
      'SELECT COUNT(*) as count FROM categorias WHERE nombreCategoria = ?',
      [datos.nombreCategoria]
    )
    if (existing[0].values[0][0] > 0) {
      return { success: false, error: 'Ya existe una categoría con ese nombre' }
    }
    
    // Obtener el siguiente ID (MAX + 1)
    const maxIdResult = db.exec('SELECT COALESCE(MAX(idCategoria), 0) + 1 as nextId FROM categorias')
    const nextId = maxIdResult[0].values[0][0]
    
    db.run(
      `INSERT INTO categorias (idCategoria, nombreCategoria, descripcion)
       VALUES (?, ?, ?)`,
      [nextId, datos.nombreCategoria, datos.descripcion || null]
    )
    
    saveDatabase()
    return { success: true, id: nextId }
  } catch (error) {
    console.error('Error al crear categoría:', error)
    return { success: false, error: error.message }
  }
}

function updateCategoria(id, datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    const fields = []
    const values = []
    
    if (datos.nombreCategoria !== undefined) {
      // Verificar que no exista otra categoría con ese nombre
      const existing = db.exec(
        'SELECT COUNT(*) as count FROM categorias WHERE nombreCategoria = ? AND idCategoria != ?',
        [datos.nombreCategoria, id]
      )
      if (existing[0].values[0][0] > 0) {
        return { success: false, error: 'Ya existe otra categoría con ese nombre' }
      }
      fields.push('nombreCategoria = ?')
      values.push(datos.nombreCategoria)
    }
    
    if (datos.descripcion !== undefined) {
      fields.push('descripcion = ?')
      values.push(datos.descripcion)
    }
    
    if (fields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' }
    }
    
    values.push(id)
    
    db.run(
      `UPDATE categorias SET ${fields.join(', ')} WHERE idCategoria = ?`,
      values
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return { success: false, error: error.message }
  }
}

function deleteCategoria(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si hay productos con esta categoría
    const productsCount = db.exec(
      'SELECT COUNT(*) as count FROM productos WHERE idCategoria = ?',
      [id]
    )
    if (productsCount[0].values[0][0] > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar la categoría porque tiene productos asociados' 
      }
    }
    
    // Verificar si hay marcas con esta categoría
    const marcasCount = db.exec(
      'SELECT COUNT(*) as count FROM marcas WHERE idCategoria = ?',
      [id]
    )
    if (marcasCount[0].values[0][0] > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar la categoría porque tiene marcas asociadas' 
      }
    }
    
    db.run('DELETE FROM categorias WHERE idCategoria = ?', [id])
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// FUNCIONES DE MARCAS
// =====================================================

function getAllMarcas() {
  if (!db) return []
  
  try {
    const result = db.exec(`
      SELECT m.*, c.nombreCategoria 
      FROM marcas m
      LEFT JOIN categorias c ON m.idCategoria = c.idCategoria
      ORDER BY m.nombreMarca
    `)
    if (result.length > 0) {
      const marcas = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const marca = {}
        columns.forEach((col, index) => {
          marca[col] = row[index]
        })
        marcas.push(marca)
      })
      return marcas
    }
    return []
  } catch (error) {
    console.error('Error al obtener marcas:', error)
    return []
  }
}

function getMarcaById(id) {
  if (!db) return null
  
  try {
    const result = db.exec(`
      SELECT m.*, c.nombreCategoria 
      FROM marcas m
      LEFT JOIN categorias c ON m.idCategoria = c.idCategoria
      WHERE m.idMarca = ?
    `, [id])
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0]
      const columns = result[0].columns
      const marca = {}
      columns.forEach((col, index) => {
        marca[col] = row[index]
      })
      return marca
    }
    return null
  } catch (error) {
    console.error('Error al obtener marca:', error)
    return null
  }
}

function getMarcasByCategoria(idCategoria) {
  if (!db) return []
  
  try {
    const result = db.exec(
      'SELECT * FROM marcas WHERE idCategoria = ? ORDER BY nombreMarca',
      [idCategoria]
    )
    if (result.length > 0) {
      const marcas = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const marca = {}
        columns.forEach((col, index) => {
          marca[col] = row[index]
        })
        marcas.push(marca)
      })
      return marcas
    }
    return []
  } catch (error) {
    console.error('Error al obtener marcas por categoría:', error)
    return []
  }
}

function createMarca(datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si ya existe una marca con ese nombre en la misma categoría
    const existing = db.exec(
      'SELECT COUNT(*) as count FROM marcas WHERE nombreMarca = ? AND idCategoria = ?',
      [datos.nombreMarca, datos.idCategoria]
    )
    if (existing[0].values[0][0] > 0) {
      return { success: false, error: 'Ya existe una marca con ese nombre en esta categoría' }
    }
    
    // Verificar que la categoría exista
    const categoriaExists = db.exec(
      'SELECT COUNT(*) as count FROM categorias WHERE idCategoria = ?',
      [datos.idCategoria]
    )
    if (categoriaExists[0].values[0][0] === 0) {
      return { success: false, error: 'La categoría seleccionada no existe' }
    }
    
    // Obtener el siguiente ID (MAX + 1)
    const maxIdResult = db.exec('SELECT COALESCE(MAX(idMarca), 0) + 1 as nextId FROM marcas')
    const nextId = maxIdResult[0].values[0][0]
    
    db.run(
      `INSERT INTO marcas (idMarca, nombreMarca, descripcion, idCategoria)
       VALUES (?, ?, ?, ?)`,
      [nextId, datos.nombreMarca, datos.descripcion || null, datos.idCategoria]
    )
    
    saveDatabase()
    return { success: true, id: nextId }
  } catch (error) {
    console.error('Error al crear marca:', error)
    return { success: false, error: error.message }
  }
}

function updateMarca(id, datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    const fields = []
    const values = []
    
    if (datos.nombreMarca !== undefined) {
      fields.push('nombreMarca = ?')
      values.push(datos.nombreMarca)
    }
    
    if (datos.descripcion !== undefined) {
      fields.push('descripcion = ?')
      values.push(datos.descripcion)
    }
    
    if (datos.idCategoria !== undefined) {
      // Verificar que la categoría exista
      const categoriaExists = db.exec(
        'SELECT COUNT(*) as count FROM categorias WHERE idCategoria = ?',
        [datos.idCategoria]
      )
      if (categoriaExists[0].values[0][0] === 0) {
        return { success: false, error: 'La categoría seleccionada no existe' }
      }
      fields.push('idCategoria = ?')
      values.push(datos.idCategoria)
    }
    
    if (fields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' }
    }
    
    values.push(id)
    
    db.run(
      `UPDATE marcas SET ${fields.join(', ')} WHERE idMarca = ?`,
      values
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar marca:', error)
    return { success: false, error: error.message }
  }
}

function deleteMarca(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si hay productos con esta marca
    const productsCount = db.exec(
      'SELECT COUNT(*) as count FROM productos WHERE idMarca = ?',
      [id]
    )
    if (productsCount[0].values[0][0] > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar la marca porque tiene productos asociados' 
      }
    }
    
    db.run('DELETE FROM marcas WHERE idMarca = ?', [id])
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar marca:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// FUNCIONES DE PROVEEDORES
// =====================================================

function getAllProveedores() {
  if (!db) return []
  
  try {
    const result = db.exec('SELECT * FROM proveedores ORDER BY nombreProveedor')
    if (result.length > 0) {
      const proveedores = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const proveedor = {}
        columns.forEach((col, index) => {
          proveedor[col] = row[index]
        })
        proveedores.push(proveedor)
      })
      return proveedores
    }
    return []
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    return []
  }
}

function getProveedorById(id) {
  if (!db) return null
  
  try {
    const result = db.exec('SELECT * FROM proveedores WHERE idProveedor = ?', [id])
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0]
      const columns = result[0].columns
      const proveedor = {}
      columns.forEach((col, index) => {
        proveedor[col] = row[index]
      })
      return proveedor
    }
    return null
  } catch (error) {
    console.error('Error al obtener proveedor:', error)
    return null
  }
}

function searchProveedores(searchTerm) {
  if (!db) return []
  
  try {
    const result = db.exec(`
      SELECT * FROM proveedores 
      WHERE nombreProveedor LIKE ? OR contacto LIKE ?
      ORDER BY nombreProveedor
    `, [`%${searchTerm}%`, `%${searchTerm}%`])
    
    if (result.length > 0) {
      const proveedores = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const proveedor = {}
        columns.forEach((col, index) => {
          proveedor[col] = row[index]
        })
        proveedores.push(proveedor)
      })
      return proveedores
    }
    return []
  } catch (error) {
    console.error('Error al buscar proveedores:', error)
    return []
  }
}

function createProveedor(datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si ya existe un proveedor con ese nombre
    const existing = db.exec(
      'SELECT COUNT(*) as count FROM proveedores WHERE nombreProveedor = ?',
      [datos.nombreProveedor]
    )
    if (existing[0].values[0][0] > 0) {
      return { success: false, error: 'Ya existe un proveedor con ese nombre' }
    }
    
    // Obtener el siguiente ID
    const maxIdResult = db.exec('SELECT COALESCE(MAX(idProveedor), 0) + 1 as nextId FROM proveedores')
    const nextId = maxIdResult[0].values[0][0]
    
    db.run(
      `INSERT INTO proveedores (idProveedor, nombreProveedor, contacto, descripcion)
       VALUES (?, ?, ?, ?)`,
      [
        nextId,
        datos.nombreProveedor,
        datos.contacto || null,
        datos.descripcion || null
      ]
    )
    
    saveDatabase()
    return { success: true, id: nextId }
  } catch (error) {
    console.error('Error al crear proveedor:', error)
    return { success: false, error: error.message }
  }
}

function updateProveedor(id, datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    const fields = []
    const values = []
    
    if (datos.nombreProveedor !== undefined) {
      // Verificar que no exista otro proveedor con ese nombre
      const existing = db.exec(
        'SELECT COUNT(*) as count FROM proveedores WHERE nombreProveedor = ? AND idProveedor != ?',
        [datos.nombreProveedor, id]
      )
      if (existing[0].values[0][0] > 0) {
        return { success: false, error: 'Ya existe otro proveedor con ese nombre' }
      }
      fields.push('nombreProveedor = ?')
      values.push(datos.nombreProveedor)
    }
    
    if (datos.contacto !== undefined) {
      fields.push('contacto = ?')
      values.push(datos.contacto)
    }
    
    if (datos.descripcion !== undefined) {
      fields.push('descripcion = ?')
      values.push(datos.descripcion)
    }
    
    if (fields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' }
    }
    
    values.push(id)
    
    db.run(
      `UPDATE proveedores SET ${fields.join(', ')} WHERE idProveedor = ?`,
      values
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar proveedor:', error)
    return { success: false, error: error.message }
  }
}

function deleteProveedor(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si el proveedor tiene compras asociadas
    const hasCompras = db.exec(
      'SELECT COUNT(*) as count FROM detalle_compras WHERE idProveedor = ?',
      [id]
    )
    if (hasCompras[0].values[0][0] > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar el proveedor porque tiene compras asociadas' 
      }
    }
    
    db.run('DELETE FROM proveedores WHERE idProveedor = ?', [id])
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar proveedor:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// FUNCIONES DE CLIENTES
// =====================================================

function getAllClientes(filtroEstado = 'activo') {
  if (!db) return []
  
  try {
    let query = 'SELECT *, COALESCE(estado, "activo") as estado FROM clientes'
    
    // Filtrar por estado si se especifica
    if (filtroEstado === 'activo') {
      query += ' WHERE COALESCE(estado, "activo") = "activo"'
    } else if (filtroEstado === 'inactivo') {
      query += ' WHERE estado = "inactivo"'
    }
    // Si es 'todos', no agregamos filtro
    
    query += ' ORDER BY nombreCliente'
    
    const result = db.exec(query)
    if (result.length > 0) {
      const clientes = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const cliente = {}
        columns.forEach((col, index) => {
          cliente[col] = row[index]
        })
        clientes.push(cliente)
      })
      return clientes
    }
    return []
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return []
  }
}

function getClienteById(id) {
  if (!db) return null
  
  try {
    const result = db.exec('SELECT * FROM clientes WHERE idCliente = ?', [id])
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0]
      const columns = result[0].columns
      const cliente = {}
      columns.forEach((col, index) => {
        cliente[col] = row[index]
      })
      return cliente
    }
    return null
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return null
  }
}

function searchClientes(searchTerm) {
  if (!db) return []
  
  try {
    const result = db.exec(`
      SELECT * FROM clientes 
      WHERE nombreCliente LIKE ? OR contacto LIKE ?
      ORDER BY nombreCliente
    `, [`%${searchTerm}%`, `%${searchTerm}%`])
    
    if (result.length > 0) {
      const clientes = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const cliente = {}
        columns.forEach((col, index) => {
          cliente[col] = row[index]
        })
        clientes.push(cliente)
      })
      return clientes
    }
    return []
  } catch (error) {
    console.error('Error al buscar clientes:', error)
    return []
  }
}

function createCliente(datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Verificar si ya existe un cliente con ese nombre
    const existing = db.exec(
      'SELECT COUNT(*) as count FROM clientes WHERE nombreCliente = ?',
      [datos.nombreCliente]
    )
    if (existing[0].values[0][0] > 0) {
      return { success: false, error: 'Ya existe un cliente con ese nombre' }
    }
    
    // Obtener el siguiente ID
    const maxIdResult = db.exec('SELECT COALESCE(MAX(idCliente), 0) + 1 as nextId FROM clientes')
    const nextId = maxIdResult[0].values[0][0]
    
    db.run(
      `INSERT INTO clientes (idCliente, nombreCliente, contacto, descripcion, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nextId,
        datos.nombreCliente,
        datos.contacto || null,
        datos.descripcion || null,
        'activo'
      ]
    )
    
    saveDatabase()
    return { success: true, id: nextId }
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return { success: false, error: error.message }
  }
}

function updateCliente(id, datos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    const fields = []
    const values = []
    
    if (datos.nombreCliente !== undefined) {
      // Verificar que no exista otro cliente con ese nombre
      const existing = db.exec(
        'SELECT COUNT(*) as count FROM clientes WHERE nombreCliente = ? AND idCliente != ?',
        [datos.nombreCliente, id]
      )
      if (existing[0].values[0][0] > 0) {
        return { success: false, error: 'Ya existe otro cliente con ese nombre' }
      }
      fields.push('nombreCliente = ?')
      values.push(datos.nombreCliente)
    }
    
    if (datos.contacto !== undefined) {
      fields.push('contacto = ?')
      values.push(datos.contacto)
    }
    
    if (datos.descripcion !== undefined) {
      fields.push('descripcion = ?')
      values.push(datos.descripcion)
    }
    
    if (fields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' }
    }
    
    values.push(id)
    
    db.run(
      `UPDATE clientes SET ${fields.join(', ')} WHERE idCliente = ?`,
      values
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return { success: false, error: error.message }
  }
}

function deleteCliente(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // En lugar de eliminar, desactivamos el cliente
    db.run('UPDATE clientes SET estado = ? WHERE idCliente = ?', ['inactivo', id])
    saveDatabase()
    return { success: true, message: 'Cliente desactivado correctamente' }
  } catch (error) {
    console.error('Error al desactivar cliente:', error)
    return { success: false, error: error.message }
  }
}

function toggleClienteEstado(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Obtener el estado actual (usando COALESCE para manejar NULL)
    const result = db.exec('SELECT COALESCE(estado, "activo") as estado FROM clientes WHERE idCliente = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) {
      return { success: false, error: 'Cliente no encontrado' }
    }
    
    const estadoActual = result[0].values[0][0]
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    
    db.run('UPDATE clientes SET estado = ? WHERE idCliente = ?', [nuevoEstado, id])
    saveDatabase()
    
    return { 
      success: true, 
      nuevoEstado,
      message: `Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`
    }
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// FUNCIONES DE COMPRAS
// =====================================================

function getAllCompras() {
  if (!db) return []
  
  try {
    const result = db.exec(`
      SELECT 
        c.*,
        COUNT(DISTINCT dc.idDetalleCompra) as cantidadProductos,
        SUM(dc.precioTotal) as totalCompra,
        GROUP_CONCAT(DISTINCT p.nombreProveedor) as proveedores
      FROM compras c
      LEFT JOIN detalle_compras dc ON c.idCompra = dc.idCompra
      LEFT JOIN proveedores p ON dc.idProveedor = p.idProveedor
      GROUP BY c.idCompra
      ORDER BY c.fechaCompra DESC
    `)
    
    if (result.length > 0) {
      const compras = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const compra = {}
        columns.forEach((col, index) => {
          compra[col] = row[index]
        })
        compras.push(compra)
      })
      return compras
    }
    return []
  } catch (error) {
    console.error('Error al obtener compras:', error)
    return []
  }
}

function getCompraById(id) {
  if (!db) return null
  
  try {
    // Obtener datos de la compra
    const compraResult = db.exec('SELECT * FROM compras WHERE idCompra = ?', [id])
    if (compraResult.length === 0 || compraResult[0].values.length === 0) {
      return null
    }
    
    const row = compraResult[0].values[0]
    const columns = compraResult[0].columns
    const compra = {}
    columns.forEach((col, index) => {
      compra[col] = row[index]
    })
    
    // Obtener detalles (productos)
    const detalleResult = db.exec(`
      SELECT 
        dc.*,
        p.nombreProveedor
      FROM detalle_compras dc
      LEFT JOIN proveedores p ON dc.idProveedor = p.idProveedor
      WHERE dc.idCompra = ?
    `, [id])
    
    compra.detalles = []
    if (detalleResult.length > 0) {
      const detColumns = detalleResult[0].columns
      detalleResult[0].values.forEach(detRow => {
        const detalle = {}
        detColumns.forEach((col, index) => {
          detalle[col] = detRow[index]
        })
        compra.detalles.push(detalle)
      })
    }
    
    // Obtener pagos
    const pagosResult = db.exec(`
      SELECT * FROM pagos_compras WHERE idCompra = ? ORDER BY fechaPago DESC
    `, [id])
    
    compra.pagos = []
    if (pagosResult.length > 0) {
      const pagoColumns = pagosResult[0].columns
      pagosResult[0].values.forEach(pagoRow => {
        const pago = {}
        pagoColumns.forEach((col, index) => {
          pago[col] = pagoRow[index]
        })
        compra.pagos.push(pago)
      })
    }
    
    return compra
  } catch (error) {
    console.error('Error al obtener compra:', error)
    return null
  }
}

function getComprasByProveedor(idProveedor) {
  if (!db) return []
  
  try {
    const result = db.exec(`
      SELECT DISTINCT
        c.*,
        COUNT(DISTINCT dc.idDetalleCompra) as cantidadProductos,
        SUM(dc.precioTotal) as totalCompra
      FROM compras c
      INNER JOIN detalle_compras dc ON c.idCompra = dc.idCompra
      WHERE dc.idProveedor = ?
      GROUP BY c.idCompra
      ORDER BY c.fechaCompra DESC
    `, [idProveedor])
    
    if (result.length > 0) {
      const compras = []
      const columns = result[0].columns
      result[0].values.forEach(row => {
        const compra = {}
        columns.forEach((col, index) => {
          compra[col] = row[index]
        })
        compras.push(compra)
      })
      return compras
    }
    return []
  } catch (error) {
    console.error('Error al obtener compras por proveedor:', error)
    return []
  }
}

function createCompra(compraData, detalles, pagos) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Obtener el siguiente ID
    const maxIdResult = db.exec('SELECT COALESCE(MAX(idCompra), 0) + 1 as nextId FROM compras')
    const nextIdCompra = maxIdResult[0].values[0][0]
    
    // Calcular totales
    const totalCompra = detalles.reduce((sum, det) => sum + (det.precioTotal || 0), 0)
    const totalPagado = pagos.reduce((sum, pago) => sum + (pago.montoPago || 0), 0)
    const totalDeuda = totalCompra - totalPagado
    const estadoPago = totalDeuda === 0 ? 'Pagado' : totalDeuda < totalCompra ? 'Parcial' : 'Pendiente'
    
    // Fecha y hora actual del servidor
    const fechaHoraActual = new Date().toISOString().replace('T', ' ').substring(0, 19)
    
    // Insertar compra
    db.run(
      `INSERT INTO compras (
        idCompra, fechaCompra, facturacion, observaciones, 
        totalPagado, totalDeuda, estadoPago, usuarioRegistro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextIdCompra,
        fechaHoraActual,
        compraData.facturacion || 'No especificado',
        compraData.observaciones || null,
        totalPagado,
        totalDeuda,
        estadoPago,
        compraData.usuarioRegistro || 'Sistema'
      ]
    )
    
    // Insertar detalles
    detalles.forEach(detalle => {
      const maxDetIdResult = db.exec('SELECT COALESCE(MAX(idDetalleCompra), 0) + 1 as nextId FROM detalle_compras')
      const nextDetId = maxDetIdResult[0].values[0][0]
      
      db.run(
        `INSERT INTO detalle_compras (
          idDetalleCompra, idCompra, codigoBarras, nombreProducto, 
          idProveedor, unidadesCompradas, precioUnitario, precioTotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextDetId,
          nextIdCompra,
          detalle.codigoBarras,
          detalle.nombreProducto,
          detalle.idProveedor,
          detalle.unidadesCompradas,
          detalle.precioUnitario,
          detalle.precioTotal
        ]
      )
      
      // Actualizar stock del producto (si existe)
      db.run(
        `UPDATE productos SET stockActual = stockActual + ? WHERE codigoBarras = ?`,
        [detalle.unidadesCompradas, detalle.codigoBarras]
      )
    })
    
    // Insertar pagos
    pagos.forEach(pago => {
      const maxPagoIdResult = db.exec('SELECT COALESCE(MAX(idPago), 0) + 1 as nextId FROM pagos_compras')
      const nextPagoId = maxPagoIdResult[0].values[0][0]
      
      db.run(
        `INSERT INTO pagos_compras (
          idPago, idCompra, tipoPago, montoPago, 
          fechaPago, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          nextPagoId,
          nextIdCompra,
          pago.tipoPago,
          pago.montoPago,
          pago.fechaPago || new Date().toISOString(),
          pago.observaciones || null
        ]
      )
    })
    
    saveDatabase()
    return { success: true, id: nextIdCompra, estadoPago, totalDeuda }
  } catch (error) {
    console.error('Error al crear compra:', error)
    return { success: false, error: error.message }
  }
}

function addPagoCompra(idCompra, pago) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Obtener el siguiente ID de pago
    const maxPagoIdResult = db.exec('SELECT COALESCE(MAX(idPago), 0) + 1 as nextId FROM pagos_compras')
    const nextPagoId = maxPagoIdResult[0].values[0][0]
    
    // Insertar pago
    db.run(
      `INSERT INTO pagos_compras (
        idPago, idCompra, tipoPago, montoPago, fechaPago, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nextPagoId,
        idCompra,
        pago.tipoPago,
        pago.montoPago,
        pago.fechaPago || new Date().toISOString(),
        pago.observaciones || null
      ]
    )
    
    // Actualizar totales de la compra
    const pagosResult = db.exec(
      'SELECT SUM(montoPago) as totalPagado FROM pagos_compras WHERE idCompra = ?',
      [idCompra]
    )
    const totalPagado = pagosResult[0].values[0][0] || 0
    
    const compraResult = db.exec(
      'SELECT SUM(precioTotal) as totalCompra FROM detalle_compras WHERE idCompra = ?',
      [idCompra]
    )
    const totalCompra = compraResult[0].values[0][0] || 0
    
    const totalDeuda = totalCompra - totalPagado
    const estadoPago = totalDeuda === 0 ? 'Pagado' : totalDeuda < totalCompra ? 'Parcial' : 'Pendiente'
    
    db.run(
      'UPDATE compras SET totalPagado = ?, totalDeuda = ?, estadoPago = ? WHERE idCompra = ?',
      [totalPagado, totalDeuda, estadoPago, idCompra]
    )
    
    saveDatabase()
    return { success: true, estadoPago, totalDeuda }
  } catch (error) {
    console.error('Error al agregar pago:', error)
    return { success: false, error: error.message }
  }
}

function updateCompra(idCompra, compraData) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    const fields = []
    const values = []
    
    if (compraData.fechaCompra !== undefined) {
      fields.push('fechaCompra = ?')
      values.push(compraData.fechaCompra)
    }
    
    if (compraData.facturacion !== undefined) {
      fields.push('facturacion = ?')
      values.push(compraData.facturacion)
    }
    
    if (compraData.observaciones !== undefined) {
      fields.push('observaciones = ?')
      values.push(compraData.observaciones)
    }
    
    if (fields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' }
    }
    
    values.push(idCompra)
    
    db.run(
      `UPDATE compras SET ${fields.join(', ')} WHERE idCompra = ?`,
      values
    )
    
    saveDatabase()
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar compra:', error)
    return { success: false, error: error.message }
  }
}

function deleteCompra(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }
  
  try {
    // Obtener detalles de la compra para revertir stock
    const detallesResult = db.exec(
      'SELECT codigoBarras, unidadesCompradas FROM detalle_compras WHERE idCompra = ?',
      [id]
    )
    
    // Revertir stock de productos
    if (detallesResult.length > 0 && detallesResult[0].values.length > 0) {
      detallesResult[0].values.forEach(row => {
        const codigoBarras = row[0]
        const unidadesCompradas = row[1]
        
        db.run(
          'UPDATE productos SET stockActual = stockActual - ? WHERE codigoBarras = ?',
          [unidadesCompradas, codigoBarras]
        )
      })
    }
    
    // Eliminar pagos asociados
    db.run('DELETE FROM pagos_compras WHERE idCompra = ?', [id])
    
    // Eliminar detalles
    db.run('DELETE FROM detalle_compras WHERE idCompra = ?', [id])
    
    // Eliminar compra
    db.run('DELETE FROM compras WHERE idCompra = ?', [id])
    
    saveDatabase()
    return { success: true, message: 'Compra eliminada y stock revertido' }
  } catch (error) {
    console.error('Error al eliminar compra:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// VENTAS CRUD
// =====================================================

function getAllVentas() {
  if (!db) return []

  try {
    const result = db.exec(`
      SELECT 
        v.*,
        c.nombreCliente,
        COUNT(DISTINCT dv.idDetalleVenta) as cantidadProductos,
        SUM(dv.precioTotalFinal) as totalVenta
      FROM ventas v
      LEFT JOIN clientes c ON v.idCliente = c.idCliente
      LEFT JOIN detalle_ventas dv ON v.idVenta = dv.idVenta
      GROUP BY v.idVenta
      ORDER BY v.fechaVenta DESC
    `)
    
    if (result.length === 0) return []
    
    const columns = result[0].columns
    const ventas = result[0].values.map(row => {
      const venta = {}
      columns.forEach((col, index) => {
        venta[col] = row[index]
      })
      return venta
    })
    
    return ventas
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return []
  }
}

function getVentaById(id) {
  if (!db) return null
  
  try {
    // Obtener datos de la venta
    const ventaResult = db.exec('SELECT * FROM ventas WHERE idVenta = ?', [id])
    if (ventaResult.length === 0 || ventaResult[0].values.length === 0) {
      return null
    }
    
    const row = ventaResult[0].values[0]
    const columns = ventaResult[0].columns
    const venta = {}
    columns.forEach((col, index) => {
      venta[col] = row[index]
    })
    
    // Obtener cliente
    if (venta.idCliente) {
      const clienteResult = db.exec('SELECT nombreCliente FROM clientes WHERE idCliente = ?', [venta.idCliente])
      if (clienteResult.length > 0 && clienteResult[0].values.length > 0) {
        venta.nombreCliente = clienteResult[0].values[0][0]
      }
    }
    
    // Obtener detalles (productos)
    const detalleResult = db.exec(`
      SELECT * FROM detalle_ventas WHERE idVenta = ?
    `, [id])
    
    venta.detalles = []
    if (detalleResult.length > 0) {
      const detColumns = detalleResult[0].columns
      detalleResult[0].values.forEach(detRow => {
        const detalle = {}
        detColumns.forEach((col, index) => {
          detalle[col] = detRow[index]
        })
        venta.detalles.push(detalle)
      })
    }
    
    // Obtener pagos
    const pagosResult = db.exec(`
      SELECT * FROM pagos_ventas WHERE idVenta = ? ORDER BY fechaPago DESC
    `, [id])
    
    venta.pagos = []
    if (pagosResult.length > 0) {
      const pagoColumns = pagosResult[0].columns
      pagosResult[0].values.forEach(pagoRow => {
        const pago = {}
        pagoColumns.forEach((col, index) => {
          pago[col] = pagoRow[index]
        })
        venta.pagos.push(pago)
      })
    }
    
    return venta
  } catch (error) {
    console.error('Error al obtener venta:', error)
    return null
  }
}

function createVenta(ventaData, detalles, pagos, usuarioRegistro) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }

  try {
    db.exec('BEGIN TRANSACTION;')

    const maxIdResult = db.exec('SELECT COALESCE(MAX(idVenta), 0) + 1 as nextId FROM ventas')
    const nextIdVenta = maxIdResult[0].values[0][0]

    const totalVenta = detalles.reduce((sum, det) => sum + (det.precioTotalFinal || 0), 0)
    const totalPagado = pagos.reduce((sum, pago) => sum + (pago.montoPago || 0), 0)
    const totalDeuda = totalVenta - totalPagado
    const estadoPago = totalDeuda === 0 ? 'pagado' : totalDeuda < totalVenta ? 'parcial' : 'pendiente'

    db.run(
      `INSERT INTO ventas (
        idVenta, idCliente, fechaVenta, facturacion, observaciones, 
        totalPagado, totalDeuda, estadoPago, fechaRegistro, usuarioRegistro
      ) VALUES (?, ?, STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'), ?, ?, ?, ?, ?, STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'), ?)`,
      [
        nextIdVenta,
        ventaData.idCliente && ventaData.idCliente !== '' ? parseInt(ventaData.idCliente) : null,
        ventaData.facturacion || 'No especificado',
        ventaData.observaciones || null,
        totalPagado,
        totalDeuda,
        estadoPago,
        usuarioRegistro
      ]
    )

    detalles.forEach(detalle => {
      const maxDetIdResult = db.exec('SELECT COALESCE(MAX(idDetalleVenta), 0) + 1 as nextId FROM detalle_ventas')
      const nextDetId = maxDetIdResult[0].values[0][0]

      db.run(
        `INSERT INTO detalle_ventas (
          idDetalleVenta, idVenta, codigoBarras, nombreProducto, 
          idCliente, unidadesVendidas, precioUnitario, precioTotal, 
          descuento, precioTotalFinal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextDetId,
          nextIdVenta,
          detalle.codigoBarras,
          detalle.nombreProducto,
          ventaData.idCliente && ventaData.idCliente !== '' ? parseInt(ventaData.idCliente) : null,
          detalle.unidadesVendidas,
          detalle.precioUnitario,
          detalle.precioTotal,
          detalle.descuento || 0,
          detalle.precioTotalFinal
        ]
      )

      // Restar stock
      db.run(
        `UPDATE productos SET stockActual = stockActual - ? WHERE codigoBarras = ?`,
        [detalle.unidadesVendidas, detalle.codigoBarras]
      )
    })

    pagos.forEach(pago => {
      const maxPagoIdResult = db.exec('SELECT COALESCE(MAX(idPago), 0) + 1 as nextId FROM pagos_ventas')
      const nextPagoId = maxPagoIdResult[0].values[0][0]

      db.run(
        `INSERT INTO pagos_ventas (
          idPago, idVenta, tipoPago, montoPago, 
          fechaPago, observaciones, fechaCreacion
        ) VALUES (?, ?, ?, ?, ?, ?, STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))`,
        [
          nextPagoId,
          nextIdVenta,
          pago.tipoPago,
          pago.montoPago,
          pago.fechaPago || new Date().toISOString(),
          pago.observaciones || null
        ]
      )
    })

    db.exec('COMMIT;')
    saveDatabase()
    return { success: true, id: nextIdVenta, estadoPago, totalDeuda }
  } catch (error) {
    db.exec('ROLLBACK;')
    console.error('Error al crear venta:', error)
    return { success: false, error: error.message }
  }
}

function updateVenta(id, ventaData, nuevosPagos, usuarioActualizacion) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }

  try {
    db.exec('BEGIN TRANSACTION;')

    // Actualizar datos generales de la venta
    db.run(
      `UPDATE ventas SET 
        facturacion = ?, 
        observaciones = ?,
        fechaActualizacion = STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'),
        usuarioActualizacion = ?
      WHERE idVenta = ?`,
      [
        ventaData.facturacion,
        ventaData.observaciones,
        usuarioActualizacion,
        id
      ]
    )

    // Agregar nuevos pagos si los hay
    if (nuevosPagos && nuevosPagos.length > 0) {
      nuevosPagos.forEach(pago => {
        const maxPagoIdResult = db.exec('SELECT COALESCE(MAX(idPago), 0) + 1 as nextId FROM pagos_ventas')
        const nextPagoId = maxPagoIdResult[0].values[0][0]

        db.run(
          `INSERT INTO pagos_ventas (
            idPago, idVenta, tipoPago, montoPago, 
            fechaPago, observaciones, fechaCreacion
          ) VALUES (?, ?, ?, ?, ?, ?, STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))`,
          [
            nextPagoId,
            id,
            pago.tipoPago,
            pago.montoPago,
            pago.fechaPago || new Date().toISOString(),
            pago.observaciones || null
          ]
        )
      })

      // Recalcular totales
      const pagosResult = db.exec('SELECT SUM(montoPago) as total FROM pagos_ventas WHERE idVenta = ?', [id])
      const totalPagado = pagosResult[0].values[0][0] || 0

      const detalleResult = db.exec('SELECT SUM(precioTotalFinal) as total FROM detalle_ventas WHERE idVenta = ?', [id])
      const totalVenta = detalleResult[0].values[0][0] || 0

      const totalDeuda = totalVenta - totalPagado
      const estadoPago = totalDeuda === 0 ? 'pagado' : totalDeuda < totalVenta ? 'parcial' : 'pendiente'

      db.run(
        `UPDATE ventas SET totalPagado = ?, totalDeuda = ?, estadoPago = ? WHERE idVenta = ?`,
        [totalPagado, totalDeuda, estadoPago, id]
      )
    }

    db.exec('COMMIT;')
    saveDatabase()
    return { success: true }
  } catch (error) {
    db.exec('ROLLBACK;')
    console.error('Error al actualizar venta:', error)
    return { success: false, error: error.message }
  }
}

function addPagoVenta(idVenta, pago, usuarioRegistro) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }

  try {
    db.exec('BEGIN TRANSACTION;')

    const maxPagoIdResult = db.exec('SELECT COALESCE(MAX(idPago), 0) + 1 as nextId FROM pagos_ventas')
    const nextPagoId = maxPagoIdResult[0].values[0][0]

    db.run(
      `INSERT INTO pagos_ventas (
        idPago, idVenta, tipoPago, montoPago, 
        fechaPago, observaciones, fechaCreacion
      ) VALUES (?, ?, ?, ?, ?, ?, STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))`,
      [
        nextPagoId,
        idVenta,
        pago.tipoPago,
        pago.montoPago,
        pago.fechaPago || new Date().toISOString(),
        pago.observaciones || null
      ]
    )

    // Recalcular totales
    const pagosResult = db.exec('SELECT SUM(montoPago) as total FROM pagos_ventas WHERE idVenta = ?', [idVenta])
    const totalPagado = pagosResult[0].values[0][0] || 0

    const detalleResult = db.exec('SELECT SUM(precioTotalFinal) as total FROM detalle_ventas WHERE idVenta = ?', [idVenta])
    const totalVenta = detalleResult[0].values[0][0] || 0

    const totalDeuda = totalVenta - totalPagado
    const estadoPago = totalDeuda === 0 ? 'pagado' : totalDeuda < totalVenta ? 'parcial' : 'pendiente'

    db.run(
      `UPDATE ventas SET totalPagado = ?, totalDeuda = ?, estadoPago = ? WHERE idVenta = ?`,
      [totalPagado, totalDeuda, estadoPago, idVenta]
    )

    db.exec('COMMIT;')
    saveDatabase()
    return { success: true, estadoPago, totalDeuda }
  } catch (error) {
    db.exec('ROLLBACK;')
    console.error('Error al agregar pago a venta:', error)
    return { success: false, error: error.message }
  }
}

function deleteVenta(id) {
  if (!db) return { success: false, error: 'Base de datos no disponible' }

  try {
    db.exec('BEGIN TRANSACTION;')

    // Revertir stock de los productos
    const detalleResult = db.exec('SELECT codigoBarras, unidadesVendidas FROM detalle_ventas WHERE idVenta = ?', [id])
    if (detalleResult.length > 0) {
      detalleResult[0].values.forEach(row => {
        const codigoBarras = row[0]
        const unidadesVendidas = row[1]
        
        db.run(
          `UPDATE productos SET stockActual = stockActual + ? WHERE codigoBarras = ?`,
          [unidadesVendidas, codigoBarras]
        )
      })
    }

    // Eliminar pagos asociados
    db.run('DELETE FROM pagos_ventas WHERE idVenta = ?', [id])

    // Eliminar detalles
    db.run('DELETE FROM detalle_ventas WHERE idVenta = ?', [id])

    // Eliminar venta
    db.run('DELETE FROM ventas WHERE idVenta = ?', [id])

    db.exec('COMMIT;')
    
    saveDatabase()
    return { success: true, message: 'Venta eliminada y stock revertido' }
  } catch (error) {
    db.exec('ROLLBACK;')
    console.error('Error al eliminar venta:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// EXPORTAR BASE DE DATOS A SQL
// =====================================================

function exportDatabaseToSQL() {
  if (!db) return { success: false, error: 'Base de datos no disponible' }

  try {
    let sqlContent = []
    
    // Encabezado del archivo SQL
    sqlContent.push('-- =====================================================')
    sqlContent.push('-- BACKUP DE BASE DE DATOS')
    sqlContent.push(`-- Fecha: ${new Date().toLocaleString('es-AR')}`)
    sqlContent.push('-- Sistema: POS - Supermercado')
    sqlContent.push('-- =====================================================')
    sqlContent.push('')
    sqlContent.push('BEGIN TRANSACTION;')
    sqlContent.push('')

    // Obtener todas las tablas
    const tablesResult = db.exec(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `)

    if (tablesResult.length === 0) {
      return { success: false, error: 'No se encontraron tablas en la base de datos' }
    }

    const tables = tablesResult[0].values.map(row => row[0])

    // Para cada tabla, generar CREATE TABLE y INSERT statements
    for (const tableName of tables) {
      // Obtener el CREATE TABLE statement
      const createTableResult = db.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`)
      
      if (createTableResult.length > 0 && createTableResult[0].values.length > 0) {
        const createSQL = createTableResult[0].values[0][0]
        if (createSQL) {
          sqlContent.push(`-- Tabla: ${tableName}`)
          sqlContent.push(createSQL + ';')
          sqlContent.push('')
        }
      }

      // Obtener todos los datos de la tabla
      const dataResult = db.exec(`SELECT * FROM ${tableName}`)
      
      if (dataResult.length > 0) {
        const columns = dataResult[0].columns
        const values = dataResult[0].values

        if (values.length > 0) {
          sqlContent.push(`-- Datos de la tabla: ${tableName}`)
          
          // Generar INSERT statements en lotes para mejor rendimiento
          for (const row of values) {
            const columnNames = columns.join(', ')
            const rowValues = row.map((val) => {
              if (val === null || val === undefined) return 'NULL'
              // Detectar tipo de dato para formatear correctamente
              if (typeof val === 'string') {
                // Escapar comillas simples y backslashes
                const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "''")
                return `'${escaped}'`
              }
              if (typeof val === 'number') {
                return val.toString()
              }
              if (typeof val === 'boolean') {
                return val ? '1' : '0'
              }
              // Para otros tipos, convertir a string y escapar
              return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`
            }).join(', ')
            
            sqlContent.push(`INSERT INTO ${tableName} (${columnNames}) VALUES (${rowValues});`)
          }
          sqlContent.push('')
        }
      }
    }

    sqlContent.push('COMMIT;')
    sqlContent.push('')
    sqlContent.push('-- =====================================================')
    sqlContent.push('-- FIN DEL BACKUP')
    sqlContent.push('-- =====================================================')

    const sqlString = sqlContent.join('\n')
    
    return { success: true, sql: sqlString }
  } catch (error) {
    console.error('Error al exportar base de datos:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

module.exports = {
  initializeDatabase,
  saveDatabase,
  // Productos
  getAllProductos,
  getProductoById,
  getProductByBarcode,
  searchProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  toggleProductEstado,
  updateProductStock,
  getLowStockProducts,
  getAllProducts, // Compatibilidad
  // Ventas
  createSale,
  getTodaySales,
  getTodayTotal,
  getAllVentas,
  getVentaById,
  createVenta,
  updateVenta,
  addPagoVenta,
  deleteVenta,
  // Usuarios
  authenticateUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  // Categorías
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  // Marcas
  getAllMarcas,
  getMarcaById,
  getMarcasByCategoria,
  createMarca,
  updateMarca,
  deleteMarca,
  // Proveedores
  getAllProveedores,
  getProveedorById,
  searchProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  // Clientes
  getAllClientes,
  getClienteById,
  searchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  toggleClienteEstado,
  // Compras
  getAllCompras,
  getCompraById,
  getComprasByProveedor,
  createCompra,
  updateCompra,
  deleteCompra,
  addPagoCompra,
  // Backup
  exportDatabaseToSQL
}

