# 🖥️ POS Client - Aplicación de Caja

## ¿Qué es esta carpeta?

Esta es la **aplicación de caja registradora** que van a usar los cajeros en el supermercado.

## Tecnologías

- **Electron**: Convierte la aplicación web en un programa instalable de Windows
- **React**: Crea la interfaz visual (pantallas, botones, formularios)
- **SQLite**: Base de datos local para guardar productos y ventas

## ¿Qué contiene?

```
pos-client/
├── src/                    → Código fuente de la aplicación
│   ├── main/              → Proceso principal de Electron (backend)
│   ├── renderer/          → Interfaz visual (React)
│   └── database/          → Configuración de SQLite
├── public/                → Archivos estáticos (imágenes, iconos)
├── package.json           → Configuración del proyecto
└── README.md              → Este archivo
```

## Funcionalidades principales

1. **Pantalla de venta**
   - Escanear productos (por código de barras)
   - Agregar productos al carrito
   - Calcular total
   - Finalizar venta

2. **Conexión con hardware**
   - Scanner de códigos de barras
   - Impresora térmica de tickets

3. **Base de datos local**
   - Productos sincronizados
   - Ventas registradas
   - Cola de sincronización (offline)

## Próximos pasos

En la **Fase 3** vamos a crear:
- La pantalla principal de caja
- El sistema de escaneo
- La lógica de venta básica
- La base de datos SQLite

## Estado

✅ **Fase 3 completada** - POS básico funcional (21/11/2025)

### ⚠️ Nota Importante

Actualmente usa **base de datos en memoria** (`src/renderer/utils/mockDatabase.js`):
- ✅ Funciona perfectamente para desarrollo y pruebas
- ❌ Los datos se borran al cerrar la aplicación
- ⏳ **Pendiente**: Implementar base de datos persistente con SQLite (Fase 3.5)

**Para implementar persistencia**: Leer `docs/fase_3.5_pendiente.md`

