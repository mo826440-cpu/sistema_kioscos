# 🛠️ Herramientas Necesarias para el Sistema POS

Este documento explica **qué herramientas necesitás** para trabajar en el proyecto, **para qué sirven** y **cómo instalarlas**.

---

## ✅ Herramientas IMPRESCINDIBLES

Estas herramientas son **obligatorias**. Sin ellas, el proyecto no va a funcionar.

### 1. Node.js

**¿Qué es?**  
Node.js es un programa que te permite ejecutar código JavaScript en tu computadora (no solo en el navegador). Es como el "motor" que hace funcionar nuestro sistema.

**¿Para qué lo necesitamos?**  
- Ejecutar el servidor backend (la parte que gestiona la base de datos)
- Ejecutar herramientas de desarrollo
- Hacer funcionar Electron (para la aplicación de escritorio)

**Cómo verificar si lo tenés instalado:**

**Windows (PowerShell):**
```powershell
node --version
```

**Linux/Mac (Terminal):**
```bash
node --version
```

Si lo tenés, vas a ver algo como: `v18.17.0` o `v20.10.0`

**Cómo instalarlo:**

**Windows:**
1. Andá a: https://nodejs.org/
2. Descargá la versión **LTS** (Long Term Support - la más estable)
3. Ejecutá el instalador (.msi)
4. Seguí los pasos (todo "Siguiente, Siguiente...")
5. Reiniciá la terminal

**Linux (Ubuntu/Debian):**
```bash
# Instalá usando el gestor de paquetes
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Mac:**
```bash
# Opción 1: Homebrew (recomendado)
brew install node

# Opción 2: Descargá desde https://nodejs.org/
```

---

### 2. npm (Node Package Manager)

**¿Qué es?**  
npm es como una "tienda de código". Te permite descargar e instalar librerías (paquetes de código) que otros programadores ya hicieron.

**¿Para qué lo necesitamos?**  
- Instalar React, Electron, SQLite y otras herramientas
- Gestionar las versiones de las librerías
- Ejecutar scripts del proyecto

**Cómo verificar si lo tenés instalado:**

**Windows (PowerShell):**
```powershell
npm --version
```

**Linux/Mac (Terminal):**
```bash
npm --version
```

**Cómo instalarlo:**  
**¡Buenas noticias!** npm viene incluido automáticamente cuando instalás Node.js. Si instalaste Node.js, ya tenés npm.

Si por alguna razón no lo tenés:
```bash
# Reinstalá Node.js, npm viene con él
```

---

## 🌟 Herramientas RECOMENDADAS

Estas herramientas no son obligatorias, pero hacen todo **mucho más fácil**.

### 3. Git

**¿Qué es?**  
Git es un sistema de "control de versiones". Es como un "historial" de todos los cambios que hacés en tu código.

**¿Para qué lo necesitamos?**  
- Guardar versiones del código (como puntos de guardado en un videojuego)
- Volver atrás si algo se rompe
- Trabajar en equipo sin pisar el código del otro
- Subir el código a GitHub o GitLab

**Cómo verificar si lo tenés instalado:**

**Windows (PowerShell):**
```powershell
git --version
```

**Linux/Mac (Terminal):**
```bash
git --version
```

**Cómo instalarlo:**

**Windows:**
1. Andá a: https://git-scm.com/download/win
2. Descargá el instalador
3. Ejecutalo (todo "Siguiente, Siguiente...")
4. En la opción "Adjusting your PATH environment", elegí: **"Git from the command line and also from 3rd-party software"**

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install git
```

**Mac:**
```bash
# Si tenés Homebrew
brew install git

# Si no tenés Homebrew, descargalo desde:
# https://git-scm.com/download/mac
```

---

### 4. Editor de Código (VS Code o Cursor)

**¿Qué es?**  
Un editor de código es como el "Word" pero para programadores. Te ayuda a escribir código de forma más cómoda con colores, sugerencias y correcciones.

**¿Para qué lo necesitamos?**  
- Escribir código de forma más fácil
- Ver errores antes de ejecutar
- Autocompletar código
- Depurar (buscar bugs)

**Opciones recomendadas:**

#### Opción A: Cursor (Recomendado - tiene IA integrada)
- **Qué es**: Editor moderno con inteligencia artificial
- **Descarga**: https://cursor.sh/
- **Ventaja**: Te ayuda a escribir código con IA (como ChatGPT pero dentro del editor)

#### Opción B: Visual Studio Code (VS Code)
- **Qué es**: El editor más popular del mundo
- **Descarga**: https://code.visualstudio.com/
- **Ventaja**: Toneladas de extensiones y comunidad gigante

**Cómo instalarlo:**
1. Entrá al link de arriba
2. Descargá el instalador para tu sistema operativo
3. Ejecutalo y seguí los pasos
4. Abrilo y empezá a usar

---

## 🔧 Herramientas OPCIONALES

Estas herramientas pueden ser útiles, pero **NO son necesarias** para empezar.

### 5. Python

**¿Qué es?**  
Otro lenguaje de programación (no lo vamos a usar directamente, pero algunas herramientas lo necesitan).

**¿Para qué podría ser útil?**  
- Algunas librerías de Node.js lo usan para compilar
- Scripts de automatización
- Herramientas de testing avanzadas

**Cómo instalarlo:**

**Windows:**
- Descargá desde: https://www.python.org/downloads/
- **IMPORTANTE**: Marcá la opción "Add Python to PATH" durante la instalación

**Linux:**
```bash
sudo apt-get install python3
```

**Mac:**
```bash
brew install python3
```

---

## 📋 Checklist de Instalación

Usá esta lista para verificar qué tenés instalado:

- [ ] **Node.js** (v16 o superior) - IMPRESCINDIBLE
- [ ] **npm** (viene con Node.js) - IMPRESCINDIBLE
- [ ] **Git** - RECOMENDADO
- [ ] **Editor de código** (Cursor o VS Code) - RECOMENDADO
- [ ] **Python** - OPCIONAL

---

## 🚀 Cómo Verificar Todo de una Vez

Creamos scripts que verifican todo automáticamente:

**Windows:**
```powershell
cd C:\Sistema_VisualStudio
.\setup\check_environment.ps1
```

**Linux/Mac:**
```bash
cd ~/Sistema_VisualStudio
chmod +x setup/check_environment.sh
./setup/check_environment.sh
```

---

## ❓ Preguntas Frecuentes

### ¿Cuánto espacio ocupan estas herramientas?
- Node.js: ~50 MB
- Git: ~300 MB
- VS Code/Cursor: ~200-300 MB
- **Total**: aproximadamente 500-600 MB

### ¿Puedo usar otras versiones?
- Node.js: Cualquier versión **16 o superior** funciona
- npm: Versión 7 o superior
- Git: Cualquier versión moderna funciona

### ¿Necesito conexión a internet?
- **Para instalar**: Sí, necesitás internet
- **Para desarrollar**: No necesariamente (después de instalar todo)
- **Para descargar librerías**: Sí, cada vez que instales paquetes nuevos

### ¿Hay alternativas?
- **Node.js**: No, es imprescindible para este proyecto
- **npm**: Podés usar `yarn` o `pnpm` (alternativas más rápidas)
- **Git**: Podés trabajar sin él, pero no es recomendable

---

## 🆘 ¿Problemas?

Si tenés problemas instalando algo:

1. **Leé los mensajes de error** (aunque parezcan complicados, suelen tener la solución)
2. **Buscá en Google**: Copia el error y pegalo en Google con "windows" o "linux"
3. **Preguntame**: Describime el error y te ayudo a resolverlo

---

**Siguiente paso**: Una vez que tengas todo instalado, ejecutá el script de verificación y pasamos a la **Fase 1: Elegir Stack Tecnológico** 🚀

