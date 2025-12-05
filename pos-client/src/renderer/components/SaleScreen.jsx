// =====================================================
// PANTALLA DE VENTA - Componente principal del POS
// =====================================================
//
// ¿Qué hace este componente?
// Es la pantalla principal de la caja registradora donde:
// - El cajero escanea productos
// - Ve el carrito con los productos escaneados
// - Ve el total de la venta
// - Finaliza la venta
//
// =====================================================

import React, { useState, useRef, useEffect } from 'react'
import '../styles/SaleScreen.css'

// Usar la API expuesta por el preload script
const db = window.api

function SaleScreen() {
  // ===== ESTADOS =====
  // Estado para el código de barras que se está escribiendo
  const [barcode, setBarcode] = useState('')
  
  // Estado para los productos en el carrito
  const [cart, setCart] = useState([])
  
  // Estado para mensajes de error o info
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Referencia al input para mantener el foco
  const inputRef = useRef(null)

  // ===== EFECTOS =====
  // Mantener el foco en el input siempre
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [cart]) // Se ejecuta cada vez que cambia el carrito

  // ===== FUNCIONES =====

  // Calcular el total del carrito
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0)
  }

  // Mostrar mensaje temporal
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  // Buscar y agregar producto al carrito
  const handleScanProduct = async (e) => {
    e.preventDefault()
    
    if (!barcode.trim()) {
      showMessage('Ingresá un código de barras', 'error')
      return
    }

    try {
      // Buscar producto en la base de datos
      const product = await db.getProductByBarcode(barcode.trim())
      
      if (!product) {
        showMessage(`Producto no encontrado: ${barcode}`, 'error')
        setBarcode('')
        return
      }

      // Verificar stock
      if (product.stock <= 0) {
        showMessage(`Sin stock disponible: ${product.name}`, 'error')
        setBarcode('')
        return
      }

      // Verificar si el producto ya está en el carrito
      const existingItem = cart.find(item => item.product_id === product.id)
      
      if (existingItem) {
        // Si ya existe, aumentar cantidad
        if (existingItem.quantity >= product.stock) {
          showMessage('Stock insuficiente', 'error')
          setBarcode('')
          return
        }
        
        setCart(cart.map(item => 
          item.product_id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
                stock: product.stock  // Agregar stock al item
              }
            : item
        ))
        showMessage(`✓ ${product.name} - Stock disponible: ${product.stock}`, 'success')
      } else {
        // Si no existe, agregar nuevo item
        const newItem = {
          product_id: product.id,
          barcode: product.barcode,
          product_name: product.name,
          unit_price: product.price,
          quantity: 1,
          subtotal: product.price,
          stock: product.stock  // Agregar stock al item
        }
        setCart([...cart, newItem])
        showMessage(`✓ ${product.name} - Stock disponible: ${product.stock}`, 'success')
      }

      // Limpiar el input
      setBarcode('')
    } catch (error) {
      console.error('Error al buscar producto:', error)
      showMessage('Error al buscar producto', 'error')
      setBarcode('')
    }
  }

  // Eliminar producto del carrito
  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
    showMessage('Producto eliminado', 'info')
  }

  // Cambiar cantidad de un producto
  const handleChangeQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId)
      return
    }

    // Buscar el producto para verificar stock
    const cartItem = cart.find(item => item.product_id === productId)
    const product = await db.getProductByBarcode(cartItem.barcode)
    
    if (product && newQuantity > product.stock) {
      showMessage('Stock insuficiente', 'error')
      return
    }

    setCart(cart.map(item => 
      item.product_id === productId
        ? { 
            ...item, 
            quantity: newQuantity,
            subtotal: newQuantity * item.unit_price
          }
        : item
    ))
  }

  // Finalizar venta
  const handleFinishSale = async () => {
    if (cart.length === 0) {
      showMessage('El carrito está vacío', 'error')
      return
    }

    try {
      const total = calculateTotal()
      
      // Generar número de venta
      const saleNumber = `V-${Date.now()}`
      
      // Crear la venta
      const sale = {
        sale_number: saleNumber,
        total: total,
        payment_method: 'cash' // Por ahora solo efectivo
      }

      // Guardar en la base de datos
      const saleId = await db.createSale(sale, cart)
      
      console.log('✅ Venta guardada:', saleId)
      
      // Limpiar el carrito
      setCart([])
      
      // Mostrar mensaje de éxito
      showMessage(`Venta finalizada: ${saleNumber} - Total: $${total.toFixed(2)}`, 'success')
      
      // En el futuro aquí iría la impresión del ticket
      console.log('🎫 Ticket:')
      console.log('========================')
      console.log(`Venta: ${saleNumber}`)
      console.log('========================')
      cart.forEach(item => {
        console.log(`${item.product_name} x${item.quantity} = $${item.subtotal.toFixed(2)}`)
      })
      console.log('========================')
      console.log(`TOTAL: $${total.toFixed(2)}`)
      console.log('========================')
      
    } catch (error) {
      console.error('Error al finalizar venta:', error)
      showMessage('Error al guardar la venta', 'error')
    }
  }

  // Cancelar venta
  const handleCancelSale = () => {
    if (cart.length === 0) return
    
    if (window.confirm('¿Estás seguro de cancelar esta venta?')) {
      setCart([])
      showMessage('Venta cancelada', 'info')
    }
  }

  // ===== RENDER =====
  return (
    <div className="sale-screen">
      {/* Header */}
      <header className="sale-header">
        <h1>🛒 Punto de Venta - Supermercado</h1>
        <div className="sale-info">
          <span className="date">{new Date().toLocaleDateString('es-AR')}</span>
          <span className="time">{new Date().toLocaleTimeString('es-AR')}</span>
        </div>
      </header>

      {/* Mensaje de notificación */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Contenido principal */}
      <div className="sale-content">
        
        {/* Panel izquierdo: Scanner y carrito */}
        <div className="left-panel">
          
          {/* Campo de escaneo */}
          <div className="scanner-section">
            <form onSubmit={handleScanProduct}>
              <label htmlFor="barcode-input">Escanear código de barras:</label>
              <div className="scanner-input-group">
                <input
                  id="barcode-input"
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Escanea o escribe el código..."
                  autoFocus
                  autoComplete="off"
                />
                <button type="submit" className="btn-scan">
                  Buscar
                </button>
              </div>
            </form>
            <p className="scanner-hint">
              💡 Tip: El scanner funciona como un teclado. Simplemente escanea el producto.
            </p>
          </div>

          {/* Carrito de productos */}
          <div className="cart-section">
            <h2>Carrito ({cart.length} productos)</h2>
            
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>🛒 El carrito está vacío</p>
                <p>Escanea un producto para empezar</p>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.product_id} className="cart-item">
                    <div className="item-info">
                      <h3>{item.product_name}</h3>
                      <p className="item-barcode">{item.barcode}</p>
                      <p className="item-stock">
                        📦 Stock: <span className={item.stock <= 10 ? 'stock-low' : 'stock-ok'}>
                          {item.stock}
                        </span>
                      </p>
                    </div>
                    <div className="item-quantity">
                      <button
                        onClick={() => handleChangeQuantity(item.product_id, item.quantity - 1)}
                        className="btn-qty"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleChangeQuantity(item.product_id, item.quantity + 1)}
                        className="btn-qty"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-price">
                      <p className="unit-price">${item.unit_price.toFixed(2)}</p>
                      <p className="subtotal">${item.subtotal.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="btn-remove"
                      title="Eliminar producto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: Total y acciones */}
        <div className="right-panel">
          <div className="total-section">
            <h2>Total</h2>
            <div className="total-amount">
              ${calculateTotal().toFixed(2)}
            </div>
            <div className="total-items">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </div>
          </div>

          <div className="actions-section">
            <button
              onClick={handleFinishSale}
              className="btn-finish"
              disabled={cart.length === 0}
            >
              ✓ Finalizar Venta
            </button>
            <button
              onClick={handleCancelSale}
              className="btn-cancel"
              disabled={cart.length === 0}
            >
              ✕ Cancelar Venta
            </button>
          </div>

          {/* Información adicional */}
          <div className="info-section">
            <h3>Métodos de pago</h3>
            <ul>
              <li>💵 Efectivo</li>
              <li>💳 Tarjeta (próximamente)</li>
              <li>📱 Transferencia (próximamente)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaleScreen

