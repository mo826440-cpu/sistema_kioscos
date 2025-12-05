-- =====================================================
-- Esquema de la tabla PRODUCTS (Productos)
-- =====================================================
--
-- Esta tabla almacena todos los productos del supermercado
--
-- Campos:
--   id: Identificador único del producto
--   barcode: Código de barras (único)
--   name: Nombre del producto
--   description: Descripción detallada
--   price: Precio de venta al público
--   cost: Costo de compra (para calcular ganancia)
--   stock: Cantidad disponible
--   category: Categoría del producto (ej: "Lacteos", "Bebidas")
--   image_url: URL o ruta a la imagen del producto
--   active: Si el producto está activo (1) o deshabilitado (0)
--   created_at: Fecha de creación
--   updated_at: Fecha de última actualización
--
-- =====================================================

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
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

