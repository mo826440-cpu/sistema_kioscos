# 🔌 API - Servidor Backend

## ¿Qué es esta carpeta?

Este es el **servidor backend** que gestiona la lógica de negocio, la base de datos central y la comunicación entre las cajas y el backoffice.

## Tecnologías

- **Node.js**: Entorno de ejecución para JavaScript en el servidor
- **Express**: Framework web para crear APIs REST
- **SQLite/MySQL**: Base de datos (SQLite para desarrollo, MySQL para producción)

## ¿Qué contiene?

```
api/
├── src/
│   ├── routes/            → Rutas de la API (endpoints)
│   ├── controllers/       → Lógica de negocio
│   ├── models/            → Modelos de datos (productos, ventas)
│   ├── services/          → Servicios (sincronización, etc.)
│   └── database/          → Configuración de base de datos
├── tests/                 → Tests automatizados
├── package.json           → Configuración del proyecto
└── README.md              → Este archivo
```

## Endpoints principales

Estos son los endpoints (URLs) que la API va a tener:

### Productos
- `GET /api/products` → Listar todos los productos
- `GET /api/products/:id` → Obtener un producto por ID
- `GET /api/products/barcode/:code` → Buscar producto por código de barras
- `POST /api/products` → Crear nuevo producto
- `PUT /api/products/:id` → Actualizar producto
- `DELETE /api/products/:id` → Eliminar producto

### Ventas
- `GET /api/sales` → Listar todas las ventas
- `GET /api/sales/:id` → Obtener una venta por ID
- `POST /api/sales` → Registrar nueva venta
- `GET /api/sales/reports/daily` → Reporte de ventas del día

### Sincronización
- `POST /api/sync/sales` → Sincronizar ventas pendientes desde POS
- `GET /api/sync/products` → Obtener productos actualizados

## Próximos pasos

En la **Fase 4** vamos a crear:
- La estructura básica del servidor Express
- Los endpoints de productos y ventas
- La conexión a la base de datos
- Sistema de autenticación básico

## Estado

🚧 **En construcción** - Fase 2 completada (estructura creada)

