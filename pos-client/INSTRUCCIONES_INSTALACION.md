# 📋 INSTRUCCIONES DE INSTALACIÓN
## Sistema POS - Supermercado

Este documento explica paso a paso cómo instalar y configurar el Sistema POS en una nueva computadora.

---

## 📦 REQUISITOS PREVIOS

Antes de comenzar, necesitás tener instalado:

### 1. Node.js y npm
- **Descargar**: https://nodejs.org/
- **Versión recomendada**: Node.js 18.x o superior
- **Verificar instalación**: Abrir PowerShell y ejecutar:
  ```powershell
  node --version
  npm --version
  ```
  Deberías ver números de versión (ej: v18.17.0 y 9.6.7)

### 2. Git (Opcional, solo si vas a clonar desde repositorio)
- **Descargar**: https://git-scm.com/download/win
- Si solo vas a copiar archivos, no es necesario

---

## 📁 PASO 1: COPIAR ARCHIVOS DEL PROYECTO

### Ubicación recomendada:
```
C:\Sistema_VisualStudio\pos-client
```

### Estructura de carpetas necesaria:
```
C:\Sistema_VisualStudio\
└── pos-client\
    ├── src\
    │   ├── main\
    │   ├── renderer\
    │   └── ...
    ├── scripts\
    ├── node_modules\ (se crea después de npm install)
    ├── package.json
    ├── package-lock.json
    └── ... (todos los archivos del proyecto)
```

### Pasos:
1. Crear la carpeta `C:\Sistema_VisualStudio` si no existe
2. Copiar toda la carpeta `pos-client` completa a esa ubicación
3. Asegurarse de que se copiaron todos los archivos y carpetas

---

## 🔧 PASO 2: INSTALAR DEPENDENCIAS

1. Abrir **PowerShell** como Administrador
2. Navegar a la carpeta del proyecto:
   ```powershell
   cd C:\Sistema_VisualStudio\pos-client
   ```
3. Instalar todas las dependencias:
   ```powershell
   npm install
   ```
4. Esperar a que termine la instalación (puede tardar varios minutos)
5. Verificar que se creó la carpeta `node_modules`

---

## 💾 PASO 3: CONFIGURAR LA BASE DE DATOS

### Opción A: Si tenés un backup de la base de datos (.db o .sql)

1. La base de datos se crea automáticamente en:
   ```
   C:\Users\[TU_USUARIO]\AppData\Roaming\pos-client\pos.db
   ```

2. Si tenés un archivo `.db`:
   - Copiar el archivo `pos.db` a la ubicación mencionada arriba
   - Reemplazar si ya existe

3. Si tenés un archivo `.sql`:
   - Instalar **DB Browser for SQLite** (ver sección de herramientas)
   - Abrir DB Browser
   - Crear nueva base de datos: `Archivo > Nueva Base de Datos`
   - Guardar como: `C:\Users\[TU_USUARIO]\AppData\Roaming\pos-client\pos.db`
   - Ir a: `Ejecutar SQL`
   - Abrir el archivo `.sql` y ejecutarlo
   - Guardar cambios

### Opción B: Si no tenés backup (base de datos nueva)

1. La base de datos se creará automáticamente al ejecutar el sistema por primera vez
2. Se creará un usuario administrador por defecto:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`
   - ⚠️ **IMPORTANTE**: Cambiar la contraseña después del primer inicio

---

## 🛠️ PASO 4: HERRAMIENTAS ADICIONALES (Opcionales)

### DB Browser for SQLite
**Para qué sirve**: Ver y editar la base de datos manualmente

**Instalación**:
1. Descargar desde: https://sqlitebrowser.org/dl/
2. Instalar el ejecutable
3. Abrir DB Browser
4. Para abrir la base de datos:
   - `Archivo > Abrir Base de Datos`
   - Navegar a: `C:\Users\[TU_USUARIO]\AppData\Roaming\pos-client\pos.db`

**Nota**: Esta herramienta es opcional, solo necesaria si querés ver o modificar la base de datos manualmente.

---

## 🚀 PASO 5: EJECUTAR EL SISTEMA

### Modo Desarrollo (para probar):

1. Abrir **PowerShell**
2. Navegar a la carpeta:
   ```powershell
   cd C:\Sistema_VisualStudio\pos-client
   ```
3. Ejecutar:
   ```powershell
   npm run dev
   ```
4. El sistema se abrirá automáticamente

### Modo Producción (compilado):

1. Abrir **PowerShell**
2. Navegar a la carpeta:
   ```powershell
   cd C:\Sistema_VisualStudio\pos-client
   ```
3. Compilar el proyecto:
   ```powershell
   npm run build
   ```
   ⚠️ **Nota**: Este proceso puede tardar varios minutos la primera vez
4. El ejecutable se creará en:
   ```
   C:\Sistema_VisualStudio\pos-client\dist-build\win-unpacked\
   ```
5. Buscar el archivo `.exe` y ejecutarlo

---

## 🖥️ PASO 6: CREAR ACCESO DIRECTO EN EL ESCRITORIO

### Opción A: Acceso directo para modo desarrollo

1. Crear un nuevo archivo de texto en el escritorio
2. Renombrarlo a: `Iniciar_Sistema.bat`
3. Click derecho > Editar
4. Pegar el siguiente contenido:
   ```batch
   @echo off
   cd /d "C:\Sistema_VisualStudio\pos-client"
   echo Iniciando sistema POS...
   npm run dev
   pause
   ```
5. Guardar y cerrar
6. (Opcional) Click derecho > Propiedades > Cambiar icono

### Opción B: Acceso directo sin ventana de terminal (recomendado)

1. Crear un nuevo archivo de texto en el escritorio
2. Renombrarlo a: `Iniciar_Sistema.vbs`
3. Click derecho > Editar
4. Pegar el siguiente contenido:
   ```vbscript
   Set WshShell = CreateObject("WScript.Shell")
   WshShell.CurrentDirectory = "C:\Sistema_VisualStudio\pos-client"
   WshShell.Run "npm run dev", 0, false
   Set WshShell = Nothing
   ```
5. Guardar y cerrar
6. Doble click en el archivo `.vbs` para iniciar el sistema

### Opción C: Acceso directo al ejecutable compilado

1. Navegar a: `C:\Sistema_VisualStudio\pos-client\dist-build\win-unpacked\`
2. Buscar el archivo `.exe` (ej: `POS Supermercado.exe`)
3. Click derecho > Crear acceso directo
4. Arrastrar el acceso directo al escritorio
5. (Opcional) Renombrar a: "POS - Supermercado"

---

## ✅ PASO 7: VERIFICAR QUE TODO FUNCIONA

1. **Ejecutar el sistema** usando uno de los métodos del Paso 6
2. **Verificar login**:
   - Usuario: `admin`
   - Contraseña: `admin123`
3. **Verificar que se cargan los datos**:
   - Productos
   - Clientes
   - Ventas
   - Compras
4. **Probar una funcionalidad básica**:
   - Agregar un producto
   - Crear una venta
   - Ver reportes

---

## 🔐 PASO 8: CONFIGURACIÓN INICIAL (Primera vez)

### Cambiar contraseña del administrador:

1. Iniciar sesión con: `admin` / `admin123`
2. Ir a: **Usuarios** (si está visible en el menú)
3. Editar el usuario `admin`
4. Cambiar la contraseña
5. Guardar cambios

### Configurar datos básicos:

1. **Catálogo**: Agregar categorías y marcas
2. **Productos**: Agregar productos al sistema
3. **Proveedores**: Agregar proveedores
4. **Clientes**: Agregar clientes (opcional)

---

## 📝 ESTRUCTURA DE CARPETAS IMPORTANTES

```
C:\Sistema_VisualStudio\pos-client\
├── src\                          # Código fuente
│   ├── main\                    # Proceso principal (Electron)
│   │   ├── main.js             # Punto de entrada
│   │   ├── database.js         # Funciones de base de datos
│   │   ├── ipc.js              # Comunicación IPC
│   │   └── preload.js          # Bridge de seguridad
│   └── renderer\                # Interfaz de usuario (React)
│       ├── views\              # Vistas principales
│       ├── components\         # Componentes reutilizables
│       └── styles\             # Estilos CSS
├── scripts\                     # Scripts de utilidad
│   ├── backup_database.js      # Backup de BD
│   └── ...
├── node_modules\               # Dependencias (se crea con npm install)
├── package.json                # Configuración del proyecto
└── dist-build\                 # Ejecutables compilados (se crea con npm run build)

C:\Users\[USUARIO]\AppData\Roaming\pos-client\
└── pos.db                      # Base de datos SQLite
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "npm no se reconoce como comando"
**Solución**: 
- Verificar que Node.js esté instalado
- Reiniciar PowerShell
- Verificar que Node.js esté en el PATH del sistema

### Error: "Cannot find module"
**Solución**:
```powershell
cd C:\Sistema_VisualStudio\pos-client
npm install
```

### Error: "Base de datos no disponible"
**Solución**:
- Verificar que la carpeta `AppData\Roaming\pos-client` existe
- Verificar permisos de escritura en esa carpeta
- Si existe `pos.db`, verificar que no esté corrupto

### El sistema se abre pero muestra pantalla en blanco
**Solución**:
1. Abrir DevTools (F12 o Ctrl+Shift+I)
2. Ver errores en la consola
3. Verificar que todas las dependencias estén instaladas:
   ```powershell
   npm install
   ```

### No puedo iniciar sesión
**Solución**:
- Verificar que la base de datos existe
- Si es primera vez, usar: `admin` / `admin123`
- Si no funciona, verificar la base de datos con DB Browser

---

## 📞 COMANDOS ÚTILES

### Desarrollo:
```powershell
npm run dev          # Iniciar en modo desarrollo
npm run build        # Compilar para producción
```

### Base de datos:
```powershell
node scripts/backup_database.js     # Crear backup
node scripts/show_db_structure.js   # Ver estructura de BD
```

### Limpiar y reinstalar:
```powershell
rm -r node_modules    # Eliminar dependencias
npm install          # Reinstalar dependencias
```

---

## 📋 CHECKLIST DE INSTALACIÓN

- [ ] Node.js instalado y verificado
- [ ] Proyecto copiado a `C:\Sistema_VisualStudio\pos-client`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Base de datos configurada (backup o nueva)
- [ ] Sistema ejecuta correctamente (`npm run dev`)
- [ ] Login funciona (admin/admin123)
- [ ] Acceso directo creado en escritorio
- [ ] Contraseña de administrador cambiada
- [ ] Datos básicos configurados (categorías, productos, etc.)

---

## 🔄 ACTUALIZAR EL SISTEMA

Si necesitás actualizar el sistema en el futuro:

1. **Hacer backup de la base de datos**:
   - Desde el sistema: Reportes > Crear Backup
   - O manualmente: Copiar `pos.db` a un lugar seguro

2. **Reemplazar archivos del proyecto**:
   - Copiar nuevos archivos sobre los existentes
   - Mantener la carpeta `node_modules` (o reinstalar con `npm install`)

3. **Verificar que funciona**:
   - Ejecutar `npm run dev`
   - Verificar que los datos se cargan correctamente

---

## 📚 INFORMACIÓN ADICIONAL

### Versión del sistema:
- **Versión actual**: 0.1.0
- **Electron**: 28.1.0
- **Node.js**: Requiere 18.x o superior

### Ubicación de logs:
- Los logs del sistema aparecen en la consola de desarrollo (F12)
- La base de datos se guarda automáticamente en cada operación

### Backup automático:
- El sistema permite crear backups desde: **Reportes > Backup de Base de Datos**
- Los backups se guardan en la carpeta de Descargas
- Formato: `backup_pos_YYYY-MM-DDTHH-MM-SS.sql`

---

## ✅ FINALIZACIÓN

Una vez completados todos los pasos, el sistema debería estar funcionando correctamente. 

**Recordá**:
- Mantener backups regulares de la base de datos
- No eliminar la carpeta `node_modules`
- No mover la base de datos de su ubicación por defecto
- Cambiar la contraseña del administrador después del primer uso

---

**¿Necesitás ayuda?** Revisá la sección "Solución de Problemas Comunes" o consultá los logs del sistema (F12 en la aplicación).

---

*Última actualización: 2025-01-XX*

