# ⚠️ Fase 3.5 - Base de Datos Persistente (PENDIENTE)

**Estado**: ⏳ Por hacer  
**Prioridad**: Alta  
**Fecha**: 21/11/2025

---

## 🎯 Objetivo

Configurar la base de datos SQLite para que **persista en disco** y no se pierdan los datos al cerrar la aplicación.

---

## ❌ Problema Actual

Actualmente el POS usa **base de datos en memoria** (`mockDatabase.js`):

- ✅ **Ventaja**: Funciona rápido y sin problemas
- ❌ **Desventaja**: Los datos se borran al cerrar la app
- ❌ **Ubicación**: `pos-client/src/renderer/utils/mockDatabase.js`
- ❌ **Tipo**: Array en JavaScript (no es base de datos real)

### ¿Qué se pierde al cerrar?
- Todas las ventas realizadas
- Cambios en el stock de productos
- Cualquier dato modificado

### ¿Qué NO se pierde?
- Los productos de ejemplo (se recargan al abrir)

---

## ✅ Solución a Implementar

Configurar **SQLite real** con persistencia en disco usando:

1. **IPC (Inter-Process Communication)** entre Electron y React
2. **sql.js** o **better-sqlite3** en el proceso principal
3. **Archivo .db** guardado en disco

---

## 📋 Tareas Necesarias

### 1. Crear módulo de base de datos en el proceso principal
- **Archivo**: `pos-client/src/main/database.js`
- **Función**: Manejar SQLite desde el proceso principal de Electron
- **Tecnología**: sql.js (ya instalado)

### 2. Configurar IPC (comunicación entre procesos)
- **Archivo**: `pos-client/src/main/ipc.js`
- **Función**: Exponer funciones de BD al proceso de renderizado
- **Métodos necesarios**:
  - `getProductByBarcode(barcode)`
  - `createSale(sale, items)`
  - `getAllProducts()`
  - `updateProductStock(id, quantity)`

### 3. Actualizar preload.js
- **Archivo**: `pos-client/src/main/preload.js`
- **Función**: Exponer las funciones IPC de forma segura a React
- **Usar**: `contextBridge.exposeInMainWorld()`

### 4. Modificar SaleScreen.jsx
- **Archivo**: `pos-client/src/renderer/components/SaleScreen.jsx`
- **Cambio**: Reemplazar importación de `mockDatabase.js` por `window.api`
- **Ejemplo**:
  ```javascript
  // Antes
  import * as db from '../utils/mockDatabase'
  
  // Después
  const db = window.api
  ```

### 5. Habilitar contextIsolation
- **Archivo**: `pos-client/src/main/main.js`
- **Cambio**: 
  ```javascript
  webPreferences: {
    nodeIntegration: false,    // Cambiar de true a false
    contextIsolation: true,    // Cambiar de false a true
    preload: path.join(__dirname, 'preload.js')
  }
  ```

---

## 🗂️ Estructura de Archivos Nueva

```
pos-client/src/
├── main/
│   ├── main.js              (✅ Ya existe - modificar)
│   ├── preload.js           (✅ Ya existe - modificar)
│   ├── database.js          (❌ Crear - maneja SQLite)
│   └── ipc.js               (❌ Crear - handlers IPC)
│
├── renderer/
│   ├── components/
│   │   └── SaleScreen.jsx   (✅ Ya existe - modificar)
│   └── utils/
│       └── mockDatabase.js  (✅ Ya existe - DEPRECAR)
│
└── data/
    └── pos.db               (❌ Se crea automáticamente)
```

---

## 🔧 Cambios Técnicos Detallados

### A. En `main/database.js`

```javascript
// Inicializar sql.js
// Crear/abrir archivo pos.db
// Crear tablas si no existen
// Cargar productos de ejemplo
// Exponer funciones para IPC
```

### B. En `main/ipc.js`

```javascript
const { ipcMain } = require('electron')
const db = require('./database')

// Handler para buscar producto
ipcMain.handle('db:getProductByBarcode', async (event, barcode) => {
  return db.getProductByBarcode(barcode)
})

// Handler para crear venta
ipcMain.handle('db:createSale', async (event, sale, items) => {
  return db.createSale(sale, items)
})

// ... más handlers
```

### C. En `main/preload.js`

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getProductByBarcode: (barcode) => 
    ipcRenderer.invoke('db:getProductByBarcode', barcode),
  
  createSale: (sale, items) => 
    ipcRenderer.invoke('db:createSale', sale, items),
  
  // ... más métodos
})
```

### D. En `renderer/components/SaleScreen.jsx`

```javascript
// Cambiar
import * as db from '../utils/mockDatabase'

// Por
const db = window.api

// El resto del código queda igual
```

---

## ⏱️ Tiempo Estimado

- **Tiempo de implementación**: 30-45 minutos
- **Complejidad**: Media
- **Prioridad**: Alta (necesario para producción)

---

## 📚 Referencias

- [Electron IPC Tutorial](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Context Bridge](https://www.electronjs.org/docs/latest/api/context-bridge)
- [sql.js Documentation](https://sql.js.org/)
- [Better-SQLite3 (alternativa)](https://github.com/WiseLibs/better-sqlite3)

---

## 🎯 Comando para retomar

Cuando quieras continuar con esta fase, decí:

```
"Cursor, leé docs/fase_3.5_pendiente.md y continuemos con la base de datos persistente"
```

O simplemente:

```
"Continuemos con la Fase 3.5"
```

---

**Última actualización**: 21 de Noviembre, 2025  
**Estado**: Documentado y listo para implementar

