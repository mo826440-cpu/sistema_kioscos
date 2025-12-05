// =====================================================
// Configuración de Vite - Empaquetador moderno
// =====================================================
//
// ¿Qué hace este archivo?
// Configura Vite para que compile React y lo prepare
// para funcionar con Electron.
//
// Vite es como el "cocinero" que toma tu código React
// y lo convierte en algo que el navegador (Electron) entiende.
//
// =====================================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Plugin de React para Vite
  plugins: [react()],
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,  // Puerto donde corre el servidor (http://localhost:5173)
    strictPort: true  // Si el puerto está ocupado, falla (no busca otro)
  },
  
  // Configuración de construcción
  build: {
    outDir: 'dist',  // Carpeta donde se guarda el código compilado
    emptyOutDir: true  // Limpia la carpeta antes de compilar
  },
  
  // Configuración base
  base: './',  // Rutas relativas (importante para Electron)
})

