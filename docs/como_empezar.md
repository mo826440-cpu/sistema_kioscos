# 🚀 Cómo Empezar a Trabajar en el Proyecto

Esta guía te explica paso a paso cómo empezar a trabajar en el sistema POS.

---

## ✅ Prerequisitos

Antes de empezar, asegurate de tener todo instalado:

1. **Node.js** (v16 o superior)
2. **npm** (viene con Node.js)
3. **Git** (recomendado)
4. **Editor de código** (Cursor o VS Code)

**¿No estás seguro?** Ejecutá el script de verificación:

```powershell
.\setup\check_environment.ps1
```

---

## 📦 Paso 1: Instalar Dependencias

### Opción A: Instalar en todos los módulos (recomendado)

Desde la carpeta raíz del proyecto:

```powershell
npm run install:all
```

Este comando instala las dependencias en:
- Proyecto principal
- `pos-client/`
- `api/`
- `shared/`

### Opción B: Instalar manualmente en cada módulo

```powershell
# En la raíz del proyecto
npm install

# En pos-client
cd pos-client
npm install
cd ..

# En api
cd api
npm install
cd ..

# En shared
cd shared
npm install
cd ..
```

---

## 🏗️ Paso 2: Entender la Estructura

Lee estos archivos en orden:

1. **README.md** (raíz) → Visión general del proyecto
2. **docs/prompt_inicial.md** → Documento maestro con todas las reglas
3. **pos-client/README.md** → Qué es la aplicación POS
4. **api/README.md** → Qué es el servidor backend
5. **database/README.md** → Cómo funciona la base de datos

---

## 💻 Paso 3: Comandos Disponibles

### Ver información del proyecto

```powershell
npm run info
```

Este comando muestra todos los comandos disponibles.

### Comandos principales (próximamente funcionales)

**Desarrollo:**
```powershell
npm run dev:pos      # Iniciar aplicación POS (Fase 3)
npm run dev:api      # Iniciar servidor API (Fase 4)
npm run dev:all      # Iniciar todo junto (Fase 4+)
```

**Compilación:**
```powershell
npm run build:pos    # Compilar aplicación POS (Fase 3)
npm run build:api    # Compilar API (Fase 4)
npm run build:all    # Compilar todo (Fase 4+)
```

---

## 🗂️ Paso 4: Próximas Tareas

### Fase 3: Implementar POS Básico (Próxima)

En esta fase vamos a crear:

1. **Configuración de Electron**
   - Instalar Electron y dependencias
   - Configurar proceso principal
   - Configurar ventana de la aplicación

2. **Interfaz con React**
   - Instalar React y dependencias
   - Crear componente de pantalla de venta
   - Crear campo para escanear productos

3. **Base de datos SQLite**
   - Instalar biblioteca SQLite
   - Crear conexión a la BD
   - Implementar esquemas de tablas
   - Cargar productos de ejemplo

4. **Funcionalidad básica**
   - Escanear código de barras
   - Buscar producto en BD
   - Agregar al carrito
   - Calcular total
   - Finalizar venta

---

## 🎯 Flujo de Trabajo Recomendado

### 1. **Siempre empezá con Git**

```powershell
# Ver en qué rama estás
git status

# Crear una rama para tu trabajo
git checkout -b fase-3-pos-basico

# Hacer commits frecuentes
git add .
git commit -m "Descripción clara de lo que hiciste"
```

### 2. **Trabaja por componentes**

No intentes hacer todo de una vez. Seguí este orden:

1. Configuración básica
2. Un componente a la vez
3. Probá que funcione
4. Pasá al siguiente

### 3. **Comentá tu código**

Siempre agregá comentarios explicando:
- **¿Qué hace este código?**
- **¿Por qué lo hiciste así?**
- **¿Qué valores espera?**

Ejemplo:

```javascript
// Esta función busca un producto por código de barras
// Parámetro: barcode (string) - Código de barras del producto
// Retorna: Objeto Product o null si no se encuentra
function findProductByBarcode(barcode) {
    // Código aquí...
}
```

### 4. **Probá frecuentemente**

No escribas 500 líneas de código sin probar. Probá cada 10-20 líneas:

```powershell
# Ejecutá la aplicación
npm run dev:pos

# Mirá la consola por errores
# Probá la funcionalidad
# Arreglá errores inmediatamente
```

---

## 📚 Recursos Útiles

### Documentación Oficial

- **Electron**: https://www.electronjs.org/docs/latest/
- **React**: https://react.dev/
- **Node.js**: https://nodejs.org/docs/latest/api/
- **SQLite**: https://www.sqlite.org/docs.html

### Tutoriales Recomendados

- **Electron + React**: https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app
- **React para principiantes**: https://react.dev/learn
- **SQLite en Node.js**: https://github.com/TryGhost/node-sqlite3

---

## 🆘 ¿Problemas?

### Error: "No se puede ejecutar scripts"

Si en PowerShell te sale un error de permisos:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Error: "npm no es reconocido"

Node.js no está en el PATH. Soluciones:

1. Reiniciá la terminal
2. Reinstalá Node.js marcando "Add to PATH"
3. Agregá manualmente al PATH de Windows

### Error: "Cannot find module"

Falta instalar dependencias:

```powershell
npm install
```

### Error en la base de datos

Verificá que el archivo `database/schemas/*.sql` esté correctamente formateado y sin errores de sintaxis.

---

## 📞 Contacto y Ayuda

Si tenés dudas:

1. **Leé la documentación** en `docs/`
2. **Revisá los README** de cada carpeta
3. **Preguntale al asistente** (Cursor)
4. **Buscá en Google** el error específico

---

## ✨ Consejos Finales

1. **No te apures** - Es mejor lento y bien que rápido y mal
2. **Preguntá** - No hay preguntas tontas
3. **Comentá todo** - Tu yo del futuro te lo va a agradecer
4. **Guardá seguido** - Hace commits de Git frecuentes
5. **Divertite** - Estás aprendiendo algo genial 🚀

---

**¡Éxitos y a programar!** 💪

