// =====================================================
// BASE DE DATOS SIMULADA EN MEMORIA (PARA DESARROLLO)
// =====================================================
//
// Esta es una versión simplificada de la base de datos
// que funciona directamente en el navegador sin necesitar
// Node.js ni archivos externos.
//
// Los datos se guardan en memoria (se pierden al cerrar)
// Ideal para desarrollo y pruebas rápidas.
//
// =====================================================

// ===== PRODUCTOS DE EJEMPLO =====
const SAMPLE_PRODUCTS = [
  // BEBIDAS
  { id: 1, barcode: '7790310981011', name: 'Coca Cola 2.25L', price: 350.00, cost: 220.00, stock: 50, category: 'Bebidas' },
  { id: 2, barcode: '7790310981028', name: 'Coca Cola 1.5L', price: 280.00, cost: 180.00, stock: 60, category: 'Bebidas' },
  { id: 3, barcode: '7790310981035', name: 'Sprite 2.25L', price: 330.00, cost: 210.00, stock: 45, category: 'Bebidas' },
  { id: 4, barcode: '7791813100027', name: 'Agua Villavicencio 2L', price: 180.00, cost: 120.00, stock: 80, category: 'Bebidas' },
  { id: 5, barcode: '7798097570014', name: 'Cerveza Quilmes 1L', price: 420.00, cost: 280.00, stock: 35, category: 'Bebidas' },
  
  // LACTEOS
  { id: 6, barcode: '7790315001438', name: 'Leche La Serenisima 1L', price: 280.00, cost: 190.00, stock: 100, category: 'Lacteos' },
  { id: 7, barcode: '7790315001445', name: 'Yogur La Serenisima 1Kg', price: 450.00, cost: 300.00, stock: 40, category: 'Lacteos' },
  { id: 8, barcode: '7790742100011', name: 'Queso Cremoso Mendicrim 200g', price: 380.00, cost: 250.00, stock: 30, category: 'Lacteos' },
  
  // ALMACEN
  { id: 9, barcode: '7790387110012', name: 'Fideos Matarazzo 500g', price: 280.00, cost: 180.00, stock: 90, category: 'Almacen' },
  { id: 10, barcode: '7790261054011', name: 'Arroz Gallo Oro 1Kg', price: 420.00, cost: 280.00, stock: 80, category: 'Almacen' },
  { id: 11, barcode: '7790070660015', name: 'Aceite Cocinero 900ml', price: 850.00, cost: 600.00, stock: 40, category: 'Almacen' },
  { id: 12, barcode: '7790040755017', name: 'Azucar Ledesma 1Kg', price: 380.00, cost: 250.00, stock: 100, category: 'Almacen' },
  
  // SNACKS
  { id: 13, barcode: '7790040170018', name: 'Papas Lays 170g', price: 520.00, cost: 350.00, stock: 80, category: 'Snacks' },
  { id: 14, barcode: '7622210801012', name: 'Chocolate Milka 100g', price: 580.00, cost: 390.00, stock: 60, category: 'Snacks' },
  { id: 15, barcode: '7790310790019', name: 'Galletitas Oreo 118g', price: 380.00, cost: 250.00, stock: 90, category: 'Snacks' },
]

// Base de datos en memoria
let products = [...SAMPLE_PRODUCTS]
let sales = []
let saleIdCounter = 1

// =====================================================
// FUNCIONES DE PRODUCTOS
// =====================================================

export function getProductByBarcode(barcode) {
  return products.find(p => p.barcode === barcode && p.stock > 0) || null
}

export function getAllProducts() {
  return [...products]
}

export function updateProductStock(productId, quantity) {
  const product = products.find(p => p.id === productId)
  if (product) {
    product.stock -= quantity
    if (product.stock < 0) product.stock = 0
  }
}

// =====================================================
// FUNCIONES DE VENTAS
// =====================================================

export function createSale(sale, items) {
  const newSale = {
    id: saleIdCounter++,
    sale_number: sale.sale_number,
    total: sale.total,
    payment_method: sale.payment_method,
    status: 'completed',
    created_at: new Date().toISOString(),
    items: items
  }
  
  // Actualizar stock de cada producto
  items.forEach(item => {
    updateProductStock(item.product_id, item.quantity)
  })
  
  sales.push(newSale)
  
  console.log('✅ Venta guardada:', newSale)
  return newSale.id
}

export function getTodaySales() {
  const today = new Date().toISOString().split('T')[0]
  return sales.filter(s => s.created_at.startsWith(today))
}

export function getTodayTotal() {
  const todaySales = getTodaySales()
  return todaySales.reduce((sum, sale) => sum + sale.total, 0)
}

// =====================================================
// RESET (para desarrollo)
// =====================================================

export function resetDatabase() {
  products = [...SAMPLE_PRODUCTS]
  sales = []
  saleIdCounter = 1
  console.log('🔄 Base de datos reiniciada')
}

// Exponer en la consola para debugging
if (typeof window !== 'undefined') {
  window.mockDB = {
    products,
    sales,
    reset: resetDatabase,
    getProducts: getAllProducts,
    getSales: getTodaySales
  }
}

