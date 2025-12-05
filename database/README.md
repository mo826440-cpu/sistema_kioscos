# 💾 Database - Base de Datos

## ¿Qué es esta carpeta?

Aquí están los **esquemas, migraciones y scripts** relacionados con la base de datos del sistema.

## Tecnologías

- **SQLite**: Base de datos local (para cada POS)
- **MySQL/PostgreSQL**: Base de datos central (opcional, para múltiples cajas)

## ¿Qué contiene?

```
database/
├── migrations/            → Scripts de migración (cambios en la BD)
├── seeds/                 → Datos de prueba (productos ejemplo)
├── schemas/               → Esquemas de las tablas
└── README.md              → Este archivo
```

## Estructura de la Base de Datos

### Tablas Principales

**1. products (Productos)**
```
- id (INTEGER, primary key)
- barcode (TEXT, único)
- name (TEXT)
- description (TEXT)
- price (REAL)
- cost (REAL)
- stock (INTEGER)
- category (TEXT)
- image_url (TEXT)
- active (BOOLEAN)
- created_at (DATETIME)
- updated_at (DATETIME)
```

**2. sales (Ventas)**
```
- id (INTEGER, primary key)
- sale_number (TEXT, único)
- total (REAL)
- payment_method (TEXT) → efectivo, tarjeta, etc.
- cashier_id (INTEGER)
- pos_id (INTEGER)
- status (TEXT) → completed, pending, cancelled
- created_at (DATETIME)
- synced (BOOLEAN) → si ya se sincronizó con el servidor
```

**3. sale_items (Items de Venta)**
```
- id (INTEGER, primary key)
- sale_id (INTEGER, foreign key)
- product_id (INTEGER, foreign key)
- quantity (INTEGER)
- unit_price (REAL)
- subtotal (REAL)
- discount (REAL)
```

**4. sync_queue (Cola de Sincronización)**
```
- id (INTEGER, primary key)
- entity_type (TEXT) → 'sale', 'product', etc.
- entity_id (INTEGER)
- action (TEXT) → 'create', 'update', 'delete'
- data (TEXT, JSON)
- retries (INTEGER)
- status (TEXT) → 'pending', 'processing', 'completed', 'failed'
- created_at (DATETIME)
- synced_at (DATETIME)
```

## Próximos pasos

En las próximas fases vamos a crear:
- Scripts de migración automática
- Datos de prueba (productos ejemplo)
- Sistema de backup automático
- Sincronización bidireccional

## Estado

🚧 **En construcción** - Fase 2 completada (estructura creada)

