-- =====================================================
-- DATOS DE PRUEBA - Productos de Ejemplo
-- =====================================================
--
-- Este archivo contiene productos de ejemplo para probar
-- el sistema sin tener que cargarlos manualmente.
--
-- Como usar:
-- 1. Primero crea las tablas con el esquema (schemas/products.sql)
-- 2. Luego ejecuta este archivo para insertar datos de prueba
--
-- =====================================================

-- Limpiar productos existentes (solo para desarrollo)
-- DELETE FROM products;

-- Reiniciar autoincrement
-- DELETE FROM sqlite_sequence WHERE name='products';

-- =====================================================
-- CATEGORÍA: BEBIDAS
-- =====================================================

INSERT INTO products (barcode, name, description, price, cost, stock, category, active)
VALUES 
    ('7790310981011', 'Coca Cola 2.25L', 'Gaseosa Coca Cola sabor original 2.25 litros', 350.00, 220.00, 50, 'Bebidas', 1),
    ('7790310981028', 'Coca Cola 1.5L', 'Gaseosa Coca Cola sabor original 1.5 litros', 280.00, 180.00, 60, 'Bebidas', 1),
    ('7790310981035', 'Sprite 2.25L', 'Gaseosa Sprite sabor lima-limon 2.25 litros', 330.00, 210.00, 45, 'Bebidas', 1),
    ('7791813100027', 'Agua Villavicencio 2L', 'Agua mineral sin gas 2 litros', 180.00, 120.00, 80, 'Bebidas', 1),
    ('7798097570014', 'Cerveza Quilmes 1L', 'Cerveza Quilmes clasica 1 litro', 420.00, 280.00, 35, 'Bebidas', 1);

-- =====================================================
-- CATEGORÍA: LACTEOS
-- =====================================================

INSERT INTO products (barcode, name, description, price, cost, stock, category, active)
VALUES 
    ('7790315001438', 'Leche La Serenisima 1L', 'Leche entera larga vida 1 litro', 280.00, 190.00, 100, 'Lacteos', 1),
    ('7790315001445', 'Yogur La Serenisima 1Kg', 'Yogur entero firme sabor vainilla 1kg', 450.00, 300.00, 40, 'Lacteos', 1),
    ('7790742100011', 'Queso Cremoso Mendicrim 200g', 'Queso cremoso 200 gramos', 380.00, 250.00, 30, 'Lacteos', 1),
    ('7790895000027', 'Manteca La Paulina 200g', 'Manteca sin sal 200 gramos', 320.00, 210.00, 50, 'Lacteos', 1);

-- =====================================================
-- CATEGORÍA: PANADERIA
-- =====================================================

INSERT INTO products (barcode, name, description, price, cost, stock, category, active)
VALUES 
    ('7790040662001', 'Pan Lactal Bimbo', 'Pan de molde lactal 500g', 420.00, 280.00, 60, 'Panaderia', 1),
    ('7790040662018', 'Pan Salvado Bimbo', 'Pan integral con salvado 500g', 450.00, 300.00, 50, 'Panaderia', 1),
    ('7790040662025', 'Tostadas Bimbo', 'Tostadas clasicas x120g', 320.00, 210.00, 70, 'Panaderia', 1);

-- =====================================================
-- CATEGORÍA: ALMACEN
-- =====================================================

INSERT INTO products (barcode, name, description, price, cost, stock, category, active)
VALUES 
    ('7790387110012', 'Fideos Matarazzo 500g', 'Fideos secos tallarines 500g', 280.00, 180.00, 90, 'Almacen', 1),
    ('7790261054011', 'Arroz Gallo Oro 1Kg', 'Arroz largo fino tipo 00000 1kg', 420.00, 280.00, 80, 'Almacen', 1),
    ('7790070660015', 'Aceite Cocinero 900ml', 'Aceite de girasol 900ml', 850.00, 600.00, 40, 'Almacen', 1),
    ('7790040755017', 'Azucar Ledesma 1Kg', 'Azucar blanca refinada 1kg', 380.00, 250.00, 100, 'Almacen', 1),
    ('7790310800011', 'Yerba Playadito 1Kg', 'Yerba mate con palo 1kg', 980.00, 680.00, 70, 'Almacen', 1);

-- =====================================================
-- CATEGORÍA: LIMPIEZA
-- =====================================================

INSERT INTO products (barcode, name, description, price, cost, stock, category, active)
VALUES 
    ('7791290003019', 'Detergente Magistral 500ml', 'Detergente liquido concentrado 500ml', 420.00, 280.00, 50, 'Limpieza', 1),
    ('7798015490017', 'Lavandina Ayudin 2L', 'Lavandina clasica 2 litros', 350.00, 230.00, 60, 'Limpieza', 1),
    ('7791290004016', 'Suavizante Vivere 1L', 'Suavizante para ropa 1 litro', 480.00, 320.00, 40, 'Limpieza', 1);

-- =====================================================
-- CATEGORÍA: SNACKS
-- =====================================================

INSERT INTO products (barcode, name, description, price, cost, stock, category, active)
VALUES 
    ('7790040170018', 'Papas Lays 170g', 'Papas fritas sabor clasico 170g', 520.00, 350.00, 80, 'Snacks', 1),
    ('7622210801012', 'Chocolate Milka 100g', 'Chocolate con leche alpina 100g', 580.00, 390.00, 60, 'Snacks', 1),
    ('7790310790019', 'Galletitas Oreo 118g', 'Galletitas rellenas sabor vainilla 118g', 380.00, 250.00, 90, 'Snacks', 1);

-- =====================================================
-- RESUMEN DE DATOS INSERTADOS
-- =====================================================
-- Total: 25 productos
-- Categorias: Bebidas, Lacteos, Panaderia, Almacen, Limpieza, Snacks
-- Todos activos y con stock disponible
-- =====================================================

-- Ver todos los productos insertados
-- SELECT * FROM products;

-- Ver resumen por categoria
-- SELECT category, COUNT(*) as cantidad, SUM(stock) as stock_total
-- FROM products
-- GROUP BY category;

