// =====================================================
// MÓDULO DE BASE DE DATOS SQLITE
// =====================================================
//
// ¿Qué hace este archivo?
// - Crea y gestiona la conexión a la base de datos SQLite
// - Inicializa las tablas (si no existen)
// - Proporciona funciones para consultar y modificar datos
//
// SQLite es una base de datos "en un archivo", no necesita
// servidor. Todo se guarda en un archivo .db en tu computadora.
//
// Usamos sql.js que es SQLite compilado a WebAssembly
// (funciona sin problemas de compilación en cualquier sistema)
//
// =====================================================

const initSqlJs = require('sql.js')
const path = require('path')
const fs = require('fs')

// =====================================================
// Configuración de la base de datos
// =====================================================

// Ruta donde se guardará el archivo de base de datos
// Usamos el directorio de la aplicación
const DB_PATH = path.join(__dirname, '../../data/pos.db')

// Crear directorio si no existe
const dbDir = path.dirname(DB_PATH)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Variable para la base de datos
let db = null

// Inicializar sql.js (es asíncrono)
async function initializeDatabase() {
  const SQL = await initSqlJs()
  
  // Cargar base de datos existente o crear nueva
  try {
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH)
      db = new SQL.Database(buffer)
      console.log('📊 Base de datos cargada desde archivo')
    } else {
      db = new SQL.Database()
      console.log('📊 Nueva base de datos creada')
    }
  } catch (error) {
    console.error('Error al cargar base de datos:', error)
    db = new SQL.Database()
  }
  
  return db
}

// Función para guardar la base de datos en disco
function saveDatabase() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(DB_PATH, buffer)
  }
}

// =====================================================
// INICIALIZAR TABLAS
// =====================================================

function initTables() {
  if (!db) {
    console.error('Error: Base de datos no inicializada')
    return
  }
  
  console.log('📊 Inicializando tablas...')

  // ===== TABLA: PRODUCTS =====
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

  // Índices para búsquedas rápidas
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`)
  
  // ===== TABLA: SALES =====
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

  db.run(`CREATE INDEX IF NOT EXISTS idx_sales_number ON sales(sale_number)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at)`)

  // ===== TABLA: SALE_ITEMS =====
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

  db.run(`CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id)`)

  // ===== TABLA: SYNC_QUEUE =====
  db.run(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      data TEXT NOT NULL,
      retries INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME
    )
  `)

  // Guardar cambios
  saveDatabase()
  console.log('✅ Tablas inicializadas correctamente')
}

// =====================================================
// FUNCIONES DE PRODUCTOS
// =====================================================

// Buscar producto por código de barras
function getProductByBarcode(barcode) {
  if (!db) return null
  
  const result = db.exec('SELECT * FROM products WHERE barcode = ? AND active = 1', [barcode])
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
}

// Obtener todos los productos
function getAllProducts() {
  if (!db) return []
  
  const result = db.exec('SELECT * FROM products WHERE active = 1 ORDER BY name')
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
}

// Crear producto
function createProduct(product) {
  if (!db) return null
  
  db.run(
    `INSERT INTO products (barcode, name, description, price, cost, stock, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      product.barcode,
      product.name,
      product.description || '',
      product.price,
      product.cost || 0,
      product.stock || 0,
      product.category || ''
    ]
  )
  saveDatabase()
  return true
}

// Actualizar stock de producto
function updateProductStock(productId, quantity) {
  if (!db) return null
  
  db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, productId])
  saveDatabase()
  return true
}

// =====================================================
// FUNCIONES DE VENTAS
// =====================================================

// Crear venta completa (venta + items)
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
    return saleId
  } catch (error) {
    console.error('Error al crear venta:', error)
    return null
  }
}

// Obtener ventas del día
function getTodaySales() {
  if (!db) return []
  
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
}

// Obtener total de ventas del día
function getTodayTotal() {
  if (!db) return 0
  
  const result = db.exec(`
    SELECT COALESCE(SUM(total), 0) as total
    FROM sales 
    WHERE DATE(created_at) = DATE('now') AND status = 'completed'
  `)
  
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0]
  }
  return 0
}

// =====================================================
// DATOS DE PRUEBA
// =====================================================

function loadSampleData() {
  if (!db) return
  
  // Verificar si ya hay productos
  const result = db.exec('SELECT COUNT(*) as count FROM products')
  const count = result[0]?.values[0]?.[0] || 0
  
  if (count > 0) {
    console.log('ℹ️  Ya existen productos en la base de datos')
    return
  }

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

  for (const product of products) {
    createProduct(product)
  }

  console.log(`✅ ${products.length} productos cargados correctamente`)
}

// =====================================================
// INICIALIZAR AL IMPORTAR
// =====================================================

// Función principal de inicialización
async function init() {
  await initializeDatabase()
  initTables()
  loadSampleData()
  console.log('✅ Sistema de base de datos listo')
}

// Inicializar automáticamente
init().catch(error => {
  console.error('Error al inicializar base de datos:', error)
})

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

module.exports = {
  // Inicialización
  init,
  saveDatabase,
  // Productos
  getProductByBarcode,
  getAllProducts,
  createProduct,
  updateProductStock,
  // Ventas
  createSale,
  getTodaySales,
  getTodayTotal,
}

