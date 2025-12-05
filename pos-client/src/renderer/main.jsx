// =====================================================
// PUNTO DE ENTRADA DE REACT
// =====================================================
//
// ¿Qué hace este archivo?
// Es el "arranque" de React. Aquí se monta la aplicación
// en el DOM (el HTML).
//
// Este archivo:
// 1. Importa React
// 2. Importa el componente principal (App)
// 3. Lo "monta" en el div con id="root" del HTML
//
// =====================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// Obtener el elemento del DOM donde se montará React
const rootElement = document.getElementById('root')

// Crear la raíz de React
const root = ReactDOM.createRoot(rootElement)

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('🚀 Aplicación React iniciada')

