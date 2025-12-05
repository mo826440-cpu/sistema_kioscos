// =====================================================
// PROCESO PRINCIPAL DE ELECTRON
// =====================================================
//
// ¿Qué hace este archivo?
// Es el "cerebro" de la aplicación Electron.
// - Crea la ventana de la aplicación
// - Gestiona eventos del sistema (abrir, cerrar, minimizar)
// - Se comunica con el proceso de renderizado (React)
// - Inicializa la base de datos y los handlers IPC
//
// =====================================================

const { app, BrowserWindow } = require('electron')
const path = require('path')
const database = require('./database')
const { registerIPCHandlers } = require('./ipc')

// Variable para guardar la ventana principal
let mainWindow

// =====================================================
// Función para crear la ventana principal
// =====================================================
function createWindow() {
  // Crea una ventana de navegador
  mainWindow = new BrowserWindow({
    width: 1024,           // Ancho en píxeles
    height: 768,           // Alto en píxeles
    minWidth: 800,         // Ancho mínimo
    minHeight: 600,        // Alto mínimo
    title: 'POS - Supermercado',
    
    // Configuración de seguridad y Node.js
    webPreferences: {
      // Desactivar nodeIntegration por seguridad
      nodeIntegration: false,
      // Activar contextIsolation para mayor seguridad
      contextIsolation: true,
      // Script preload que expone APIs seguras
      preload: path.join(__dirname, 'preload.js')
    },
    
    // Opciones visuales
    autoHideMenuBar: true,  // Oculta la barra de menú
    // frame: false,         // Descomentar para ventana sin bordes
    // fullscreen: true,     // Descomentar para pantalla completa
  })

  // =====================================================
  // Cargar la aplicación React
  // =====================================================
  
  // En desarrollo: carga desde el servidor de Vite
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173')
    // Abre las herramientas de desarrollo (consola) - Comentado para no mostrarla automáticamente
    // mainWindow.webContents.openDevTools()
  } 
  // En producción: carga el HTML compilado
  else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // =====================================================
  // Eventos de la ventana
  // =====================================================
  
  // Cuando se cierra la ventana
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// =====================================================
// Eventos de la aplicación
// =====================================================

// Cuando Electron está listo, crea la ventana
app.whenReady().then(async () => {
  console.log('🚀 Electron iniciado')
  
  // Inicializar base de datos
  console.log('📊 Inicializando base de datos...')
  await database.initializeDatabase()
  
  // Registrar handlers IPC
  registerIPCHandlers()
  
  // Crear ventana
  createWindow()

  // En macOS, re-crear la ventana si se activa y no hay ventanas abiertas
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Cuando se cierran todas las ventanas
app.on('window-all-closed', () => {
  // En macOS, las apps suelen quedarse activas hasta que el usuario sale con Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// =====================================================
// Exportar la ventana (para usarla en otros módulos si es necesario)
// =====================================================
module.exports = { getMainWindow: () => mainWindow }

