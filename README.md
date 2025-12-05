# 🛒 Sistema POS para Supermercado

**Sistema completo de Punto de Venta** con gestión offline, sincronización, hardware y backoffice.

---

## 📖 ¿Qué es este proyecto?

Este es un **sistema completo de caja registradora** para supermercados que incluye:

- 💳 **Punto de Venta (POS)**: Aplicación de caja para registrar ventas
- 🖨️ **Hardware**: Conexión con scanner de códigos de barras e impresoras térmicas
- 📡 **Offline First**: Funciona sin internet y sincroniza después
- 📊 **Backoffice**: Panel de administración para gestionar productos y ver reportes
- 💾 **Base de datos local**: Todo guardado en tu computadora (SQLite)

---

## 🎯 Estado del Proyecto

Este proyecto está en **desarrollo activo** y se está construyendo **por fases**.

### Checklist de Desarrollo

- [x] **Fase 0**: Verificar herramientas necesarias ✅
- [x] **Fase 1**: Elegir stack tecnológico ✅
- [x] **Fase 2**: Crear estructura de carpetas ✅
- [x] **Fase 3**: Implementar POS básico (MVP) ✅ **COMPLETADO**
  - ⚠️ **PENDIENTE**: Configurar base de datos persistente (actualmente en memoria, se borra al cerrar)
- [ ] **Fase 3.5**: Configurar base de datos SQLite persistente ⏳ SIGUIENTE
- [ ] **Fase 4**: Crear backend/API
- [ ] **Fase 5**: Simular hardware (scanner, impresora)
- [ ] **Fase 6**: Sistema de sincronización offline
- [ ] **Fase 7**: Panel de administración (Backoffice)

---

## 🚀 Inicio Rápido

### 1. Verificá las Herramientas

Antes de empezar, necesitás tener instalado:

- ✅ **Node.js** (v16 o superior)
- ✅ **npm** (viene con Node.js)
- 🌟 **Git** (recomendado)
- 🌟 **Editor de código** (Cursor o VS Code)

**¿No sabés si tenés todo?** Ejecutá este comando:

#### Windows (PowerShell):
```powershell
.\setup\check_environment.ps1
```

#### Linux/Mac (Terminal):
```bash
chmod +x setup/check_environment.sh
./setup/check_environment.sh
```

El script te va a decir qué tenés instalado y qué te falta.

### 2. Instalá las Herramientas que Falten

Si te falta algo, seguí la guía completa en:  
📚 **[docs/herramientas_necesarias.md](docs/herramientas_necesarias.md)**

---

## 📁 Estructura del Proyecto

```
C:\Sistema_VisualStudio\
│
├── docs/                           # 📚 Documentación del proyecto
│   ├── prompt_inicial.md           # Documento maestro del proyecto
│   └── herramientas_necesarias.md  # Guía de herramientas
│
├── setup/                          # ⚙️ Scripts de configuración
│   ├── check_environment.ps1       # Verificación (Windows)
│   └── check_environment.sh        # Verificación (Linux/Mac)
│
├── pos-client/                     # 🖥️ Aplicación de caja (Electron + React)
│   ├── src/                        # Código fuente
│   │   ├── main/                   # Proceso principal de Electron
│   │   ├── renderer/               # Interfaz visual (React)
│   │   └── database/               # Configuración de SQLite
│   ├── public/                     # Archivos estáticos
│   ├── package.json                # Configuración del módulo
│   └── README.md                   # Documentación del POS Client
│
├── api/                            # 🔌 Servidor backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/                 # Rutas de la API (endpoints)
│   │   ├── controllers/            # Lógica de negocio
│   │   ├── models/                 # Modelos de datos
│   │   ├── services/               # Servicios (sincronización)
│   │   └── database/               # Configuración de BD
│   ├── tests/                      # Tests automatizados
│   ├── package.json                # Configuración del módulo
│   └── README.md                   # Documentación de la API
│
├── database/                       # 💾 Esquemas y datos de la BD
│   ├── schemas/                    # Esquemas SQL de las tablas
│   │   ├── products.sql            # Tabla de productos
│   │   ├── sales.sql               # Tablas de ventas
│   │   └── sync_queue.sql          # Cola de sincronización
│   ├── seeds/                      # Datos de prueba
│   │   └── sample_products.sql     # Productos de ejemplo
│   └── README.md                   # Documentación de la BD
│
├── shared/                         # 🔄 Código compartido
│   ├── types/                      # Definiciones de tipos (TypeScript)
│   ├── constants/                  # Constantes del sistema
│   ├── validators/                 # Validaciones comunes
│   ├── utils/                      # Funciones útiles
│   ├── package.json                # Configuración del módulo
│   └── README.md                   # Documentación de shared
│
├── package.json                    # Configuración principal del proyecto
├── .gitignore                      # Archivos ignorados por Git
└── README.md                       # Este archivo
```

---

## 📚 Documentación

- **[docs/prompt_inicial.md](docs/prompt_inicial.md)**: Documento maestro con todas las instrucciones del proyecto
- **[docs/herramientas_necesarias.md](docs/herramientas_necesarias.md)**: Guía completa de herramientas

---

## 🔄 Continuar el Proyecto

Si estás volviendo después de un tiempo, ejecutá:

```
Cursor, leé docs/prompt_inicial.md y continuemos.
```

Esto carga todo el contexto del proyecto y continúa desde donde se dejó.

---

## 🛠️ Próximos Pasos

### Fase 1: Elegir Stack Tecnológico

Tenés que elegir con qué tecnologías vas a construir el sistema:

**Opción A - Electron + React + Node + SQLite** (Recomendado)
- ✅ Aplicación instalable (como un programa normal)
- ✅ Funciona 100% offline
- ✅ Ideal para cajas registradoras
- ⚠️ Ocupa más espacio en disco

**Opción B - React Web + Node (PWA)**
- ✅ Aplicación web que funciona como app
- ✅ Fácil de actualizar
- ⚠️ Necesita internet (o cache)

**Opción C - .NET + SQL Server**
- ✅ Nativo de Windows
- ✅ Muy potente
- ⚠️ Solo funciona en Windows
- ⚠️ Más complejo de aprender

---

## ❓ ¿Necesitás Ayuda?

### Si tenés problemas técnicos:
1. Leé los mensajes de error completos
2. Consultá la documentación en `docs/`
3. Buscá el error en Google
4. Preguntale al asistente

### Si no entendés algo:
- Todo está explicado en lenguaje simple
- Cada archivo tiene comentarios explicando qué hace
- Podés preguntar lo que sea

---

## 👤 Información del Proyecto

- **Ubicación**: `C:\Sistema_VisualStudio`
- **Sistema**: Windows 10
- **Fecha de inicio**: 21 de Noviembre, 2025
- **Estado**: Fase 0 completada ✅

---

## 📝 Notas Importantes

- ⚠️ Este proyecto está en **desarrollo**
- 💡 Se construye **paso a paso**, sin saltear fases
- ❓ Siempre preguntamos antes de crear/modificar archivos
- 📚 Todo está documentado de forma simple

---

**¡Listo para empezar!** 🚀

El siguiente paso es elegir el stack tecnológico (Fase 1).

