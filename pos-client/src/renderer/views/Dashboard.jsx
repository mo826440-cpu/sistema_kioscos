// =====================================================
// DASHBOARD - Vista Principal con Datos Reales
// =====================================================

import React, { useState, useEffect, useMemo } from 'react'
import '../styles/Dashboard.css'
import { formatCurrency } from '../utils/formatters'

const db = window.api

function Dashboard() {
  // Estados para datos reales
  const [todayTotal, setTodayTotal] = useState(0)
  const [todaySales, setTodaySales] = useState([])
  const [products, setProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados para filtros del gráfico
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroProducto, setFiltroProducto] = useState('')

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData()
    // Actualizar cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Función para cargar todos los datos
  const loadDashboardData = async () => {
    try {
      // Cargar datos en paralelo
      const [total, sales, prods, comprasData] = await Promise.all([
        db.getTodayTotal(),
        db.getTodaySales(),
        db.getAllProductos('activo'),
        db.getAllCompras()
      ])

      setTodayTotal(total)
      setTodaySales(sales)
      setProducts(prods)
      setCompras(comprasData || [])
      
      // Filtrar productos con stock bajo (≤ 10)
      const lowStock = prods.filter(p => (p.stockActual || 0) <= 10)
      setLowStockProducts(lowStock)
      
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
      setLoading(false)
    }
  }

  // Función para parsear fecha SQLite
  const parsearFechaSQLite = (fechaStr) => {
    if (!fechaStr) return null
    const fecha = new Date(fechaStr)
    fecha.setHours(0, 0, 0, 0)
    return fecha
  }

  // Calcular datos del gráfico según filtros
  const datosGrafico = useMemo(() => {
    let comprasFiltradas = [...compras]

    // Filtrar por fecha
    if (filtroFechaDesde) {
      const fechaDesde = parsearFechaSQLite(filtroFechaDesde)
      comprasFiltradas = comprasFiltradas.filter(c => {
        const fechaCompra = parsearFechaSQLite(c.fechaCompra)
        return fechaCompra && fechaCompra >= fechaDesde
      })
    }

    if (filtroFechaHasta) {
      const fechaHasta = parsearFechaSQLite(filtroFechaHasta)
      comprasFiltradas = comprasFiltradas.filter(c => {
        const fechaCompra = parsearFechaSQLite(c.fechaCompra)
        return fechaCompra && fechaCompra <= fechaHasta
      })
    }

    // Filtrar por producto (si está seleccionado)
    // Nota: Para filtrar por producto necesitaríamos cargar los detalles de cada compra
    // Por ahora, el filtro por producto está deshabilitado funcionalmente
    // pero se puede implementar cargando getCompraById para cada compra
    if (filtroProducto) {
      // TODO: Implementar filtrado por producto cargando detalles de compras
      // Por ahora, mostramos todas las compras del período
    }

    // Calcular totales
    const totalCompras = comprasFiltradas.reduce((sum, c) => {
      // Usar totalCompra si está disponible, sino calcular desde totalPagado + totalDeuda
      return sum + (c.totalCompra || (c.totalPagado || 0) + (c.totalDeuda || 0))
    }, 0)

    const totalDeudas = comprasFiltradas.reduce((sum, c) => {
      return sum + (c.totalDeuda || 0)
    }, 0)

    return {
      totalCompras,
      totalDeudas,
      cantidadCompras: comprasFiltradas.length
    }
  }, [compras, filtroFechaDesde, filtroFechaHasta, filtroProducto])

  // Calcular altura máxima para el gráfico
  const maxValor = Math.max(datosGrafico.totalCompras, datosGrafico.totalDeudas, 1)

  if (loading) {
    return (
      <div className="view-container">
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>📊 Dashboard</h1>
        <p>Panel de control y estadísticas en tiempo real</p>
      </div>

      <div className="dashboard-grid">
        {/* Tarjeta: Ventas del Día */}
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Ventas del Día</h3>
            <p className="stat-value">${todayTotal.toFixed(2)}</p>
            <p className="stat-label">{todaySales.length} ventas</p>
          </div>
        </div>

        {/* Tarjeta: Productos */}
        <div className="stat-card stat-card-success">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Productos</h3>
            <p className="stat-value">{products.length}</p>
            <p className="stat-label">En catálogo</p>
          </div>
        </div>

        {/* Tarjeta: Clientes */}
        <div className="stat-card stat-card-info">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Clientes</h3>
            <p className="stat-value">0</p>
            <p className="stat-label">Registrados</p>
          </div>
        </div>

        {/* Tarjeta: Stock Bajo */}
        <div className={`stat-card ${lowStockProducts.length > 0 ? 'stat-card-warning' : 'stat-card-success'}`}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Stock Bajo</h3>
            <p className="stat-value">{lowStockProducts.length}</p>
            <p className="stat-label">Productos</p>
          </div>
        </div>
      </div>

      {/* Sección: Gráfico de Compras y Deudas */}
      <div className="dashboard-section chart-section">
        <h2>📊 Compras y Deudas</h2>
        
        {/* Filtros */}
        <div className="chart-filters">
          <div className="filter-group">
            <label>Desde:</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Hasta:</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Producto:</label>
            <select
              value={filtroProducto}
              onChange={(e) => setFiltroProducto(e.target.value)}
            >
              <option value="">Todos los productos</option>
              {products.map((p) => (
                <option key={p.idProducto} value={p.idProducto}>
                  {p.nombreProducto}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-clear-filters"
            onClick={() => {
              setFiltroFechaDesde('')
              setFiltroFechaHasta('')
              setFiltroProducto('')
            }}
          >
            🔄 Limpiar
          </button>
        </div>

        {/* Gráfico de barras */}
        <div className="chart-container">
          <div className="chart-bars">
            <div className="chart-bar-wrapper">
              <div className="chart-bar-label">Total Compras</div>
              <div className="chart-bar-container">
                <div
                  className="chart-bar chart-bar-compras"
                  style={{
                    height: `${(datosGrafico.totalCompras / maxValor) * 100}%`,
                    minHeight: datosGrafico.totalCompras > 0 ? '20px' : '0'
                  }}
                >
                  <span className="chart-bar-value">
                    {formatCurrency(datosGrafico.totalCompras)}
                  </span>
                </div>
              </div>
            </div>
            <div className="chart-bar-wrapper">
              <div className="chart-bar-label">Total Deudas</div>
              <div className="chart-bar-container">
                <div
                  className="chart-bar chart-bar-deudas"
                  style={{
                    height: `${(datosGrafico.totalDeudas / maxValor) * 100}%`,
                    minHeight: datosGrafico.totalDeudas > 0 ? '20px' : '0'
                  }}
                >
                  <span className="chart-bar-value">
                    {formatCurrency(datosGrafico.totalDeudas)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="chart-info">
            <p><strong>{datosGrafico.cantidadCompras}</strong> compras en el período</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Sección: Ventas Recientes */}
        <div className="dashboard-section">
          <h2>📈 Ventas Recientes</h2>
          {todaySales.length === 0 ? (
            <div className="empty-list">
              <p>No hay ventas registradas hoy</p>
              <small>Las ventas aparecerán aquí automáticamente</small>
            </div>
          ) : (
            <div className="sales-list">
              {todaySales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="sale-item">
                  <div className="sale-info">
                    <span className="sale-number">{sale.sale_number}</span>
                    <span className="sale-time">
                      {new Date(sale.created_at).toLocaleTimeString('es-AR')}
                    </span>
                  </div>
                  <div className="sale-amount">${sale.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección: Productos con Stock Bajo */}
        <div className="dashboard-section">
          <h2>⚠️ Stock Bajo</h2>
          {lowStockProducts.length === 0 ? (
            <div className="empty-list success">
              <p>✅ Todos los productos tienen stock suficiente</p>
              <small>Stock mínimo: 10 unidades</small>
            </div>
          ) : (
            <div className="stock-list">
              {lowStockProducts.map((product) => (
                <div key={product.idProducto} className="stock-item">
                  <div className="stock-info">
                    <span className="stock-name">{product.nombreProducto}</span>
                    <span className="stock-category">{product.nombreCategoria || 'Sin categoría'}</span>
                  </div>
                  <div className={`stock-badge ${(product.stockActual || 0) === 0 ? 'stock-zero' : 'stock-low'}`}>
                    {(product.stockActual || 0) === 0 ? 'Sin stock' : `${product.stockActual || 0} unidades`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

