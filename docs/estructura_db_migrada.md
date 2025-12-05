# 📊 Estructura de Base de Datos Migrada

## Resumen de la Migración

✅ **Migración exitosa:** MySQL → SQLite  
📁 **15 tablas creadas**  
📦 **Tamaño:** 0.23 MB  
📍 **Ubicación:** `%APPDATA%\pos-client\pos.db`

---

## 📋 Tablas y Registros

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| **productos** | 282 | Catálogo de productos con código de barras, precio, stock, categoría y marca |
| **ventas** | 669 | Registro de ventas con cliente, fecha, facturación, pagos y deudas |
| **detalle_ventas** | 851 | Detalle de productos vendidos en cada venta |
| **pagos_ventas** | 649 | Pagos realizados para cada venta (múltiples pagos por venta) |
| **clientes** | 45 | Información de clientes |
| **categorias** | 20 | Categorías de productos |
| **compras** | 22 | Registro de compras a proveedores |
| **detalle_compras** | 24 | Detalle de productos comprados |
| **pagos_compras** | 19 | Pagos realizados a proveedores |
| **proveedores** | 19 | Información de proveedores |
| **pagos_generales** | 28 | Pagos generales de clientes (liquidaciones de deuda) |
| **detalle_pagos_generales** | 8 | Detalle de qué ventas se pagaron en pagos generales |
| **permisos_usuarios** | 36 | Permisos granulares por usuario y página |
| **usuarios** | 4 | Usuarios del sistema con contraseñas hasheadas |
| **marcas** | 0 | Marcas de productos (vacía) |

---

## 🔍 Cambios Principales vs Estructura Anterior

### PRODUCTOS
**Antes:**
```sql
- id, barcode, name, price, stock, category, brand, supplier, cost
```

**Ahora:**
```sql
- idProducto, codigoBarras, nombreProducto, precioVenta, stockActual
- idCategoria (FK), idMarca (FK)
- descuento, precioFinal, fechaFinalDescuento
- fechaActualizacion
```

**Diferencias:**
- ✅ Categorías y marcas son tablas separadas (relacional)
- ✅ Soporte para descuentos temporales
- ✅ Precio final calculado
- ❌ Ya no tiene `supplier` ni `cost` en productos

---

### VENTAS
**Antes:**
```sql
sales: id, total, date, items (JSON)
sale_items: id, sale_id, product_id, quantity, price
```

**Ahora:**
```sql
ventas: idVenta, idCliente, fechaVenta, facturacion, observaciones,
        totalPagado, totalDeuda, estadoPago

detalle_ventas: idDetalleVenta, idVenta, codigoBarras, nombreProducto,
                idCliente, unidadesVendidas, precioUnitario, precioTotal,
                descuento, precioTotalFinal

pagos_ventas: idPago, idVenta, tipoPago, montoPago, fechaPago,
              observaciones, fechaCreacion, fechaActualizacion
```

**Diferencias:**
- ✅ Múltiples formas de pago por venta
- ✅ Gestión de deudas (totalPagado, totalDeuda, estadoPago)
- ✅ Facturación y observaciones
- ✅ Descuentos por producto
- ✅ Cliente asociado a la venta

---

### CLIENTES (NUEVO)
```sql
- idCliente, nombreCliente, contacto, descripcion
```

**Funcionalidad:**
- Registro de clientes
- Asociación con ventas
- Historial de compras
- Gestión de deudas

---

### COMPRAS (NUEVO)
```sql
compras: idCompra, fechaCompra, facturacion, observaciones,
         totalPagado, totalDeuda, estadoPago

detalle_compras: idDetalleCompra, idCompra, codigoBarras, nombreProducto,
                 idProveedor, unidadesCompradas, precioUnitario, precioTotal

pagos_compras: idPago, idCompra, tipoPago, montoPago, fechaPago,
               observaciones
```

**Funcionalidad:**
- Registro de compras a proveedores
- Múltiples formas de pago
- Gestión de deudas con proveedores
- Actualización automática de stock

---

### PROVEEDORES (NUEVO)
```sql
- idProveedor, nombreProveedor, contacto, descripcion
```

---

### PAGOS GENERALES (NUEVO)
```sql
pagos_generales: idPagoGeneral, idCliente, montoTotal, tipoPago,
                 observaciones, fechaPago, fechaRegistro, estado

detalle_pagos_generales: idDetalle, idPagoGeneral, idVenta, montoAplicado,
                         deudaAnterior, deudaRestante, fechaAplicacion
```

**Funcionalidad:**
- Cliente paga varias deudas a la vez
- Distribución automática del pago entre ventas pendientes
- Seguimiento de cómo se aplicó cada pago

---

### PERMISOS USUARIOS (MEJORADO)
**Antes:**
```sql
- Solo role: 'admin' | 'user'
```

**Ahora:**
```sql
- idPermiso, idUsuario, pagina, nombre_pagina, tiene_acceso
```

**Funcionalidad:**
- Permisos granulares por pantalla
- Control de acceso por usuario
- Pantallas: dashboard, productos, clientes, ventas, compras, proveedores, catalogo, reportes, usuarios

---

## 🎯 Plan de Acción

### Fase 1: Actualizar Capa de Datos
1. ✅ Migrar base de datos MySQL → SQLite
2. ⏳ Crear nuevas funciones en `database.js`:
   - CRUD Productos (con categorías y marcas)
   - CRUD Clientes
   - CRUD Ventas (con múltiples pagos)
   - CRUD Compras
   - CRUD Proveedores
   - CRUD Categorías y Marcas
   - Gestión de Pagos Generales
   - Permisos granulares

### Fase 2: Actualizar IPC y Preload
3. ⏳ Agregar nuevos handlers IPC
4. ⏳ Exponer nuevas APIs en preload.js

### Fase 3: Actualizar Vistas
5. ⏳ **Productos:** Integrar categorías, marcas, descuentos
6. ⏳ **Ventas:** Múltiples pagos, descuentos, cliente, deudas
7. ⏳ **Clientes:** CRUD completo, ver deudas, historial
8. ⏳ **Compras:** CRUD completo, proveedores, stock
9. ⏳ **Proveedores:** CRUD completo
10. ⏳ **Catálogo:** Gestión de categorías y marcas
11. ⏳ **Dashboard:** Nuevas estadísticas
12. ⏳ **Usuarios:** Permisos granulares

### Fase 4: Testing
13. ⏳ Probar todas las funcionalidades
14. ⏳ Verificar integridad de datos

---

## 📝 Notas Importantes

### Contraseñas
- Las contraseñas ya vienen hasheadas con bcrypt (`$2y$10$...`)
- Compatible con `bcryptjs` (usar `bcrypt.compare()`)

### IDs
- Todos los IDs son numéricos (int)
- Las tablas usan nombres en español (idProducto, nombreProducto, etc.)

### Tipos de Pago
- Los tipos de pago se guardan como TEXT ('efectivo', 'transferencia', 'mercadopago', etc.)

### Estados de Pago
- ventas.estadoPago: 'pendiente' | 'pagado' | 'parcial'
- compras.estadoPago: 'Pendiente' | 'Pagado' (mayúscula en primera letra)

### Descuentos
- productos.descuento: % de descuento (ej: 10.5 = 10.5%)
- detalle_ventas.descuento: % aplicado en esa venta específica

---

## 🚀 Próximos Pasos

1. **Revisar esta estructura** y confirmar que es correcta
2. **Decidir el orden de implementación** de las funcionalidades
3. **Comenzar con la actualización del código**

---

Generado automáticamente el {{ fecha }}

