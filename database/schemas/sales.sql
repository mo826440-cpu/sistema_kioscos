-- =====================================================
-- Esquema de la tabla SALES (Ventas)
-- =====================================================
--
-- Esta tabla almacena las ventas realizadas en cada caja
--
-- Campos:
--   id: Identificador único de la venta
--   sale_number: Número de venta (ej: "V-00001", "V-00002")
--   total: Monto total de la venta
--   payment_method: Método de pago (cash, card, transfer)
--   cashier_id: ID del cajero que realizó la venta
--   pos_id: ID de la caja donde se realizó
--   status: Estado (completed, pending, cancelled)
--   synced: Si ya se sincronizó con el servidor central
--   created_at: Fecha de la venta
--
-- =====================================================

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
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sales_number ON sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_synced ON sales(synced);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- =====================================================
-- Esquema de la tabla SALE_ITEMS (Items de Venta)
-- =====================================================
--
-- Esta tabla almacena los productos de cada venta
-- (cada fila es un producto dentro de una venta)
--
-- Campos:
--   id: Identificador único del item
--   sale_id: ID de la venta a la que pertenece
--   product_id: ID del producto vendido
--   barcode: Código de barras del producto (por si se elimina)
--   product_name: Nombre del producto (por si se elimina)
--   quantity: Cantidad vendida
--   unit_price: Precio unitario al momento de la venta
--   subtotal: Precio * cantidad
--   discount: Descuento aplicado (si lo hay)
--
-- =====================================================

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
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

