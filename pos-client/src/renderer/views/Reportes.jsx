// =====================================================
// REPORTES - Generación de Reportes
// =====================================================

import React, { useState } from 'react'
import '../styles/CommonView.css'

function Reportes() {
  const [backupLoading, setBackupLoading] = useState(false)
  const [backupMessage, setBackupMessage] = useState({ text: '', type: '' })

  const handleBackup = async () => {
    setBackupLoading(true)
    setBackupMessage({ text: '', type: '' })

    try {
      // Exportar base de datos a SQL
      const exportResult = await window.api.exportDatabaseToSQL()
      
      if (!exportResult.success) {
        setBackupMessage({ text: `❌ Error al exportar: ${exportResult.error}`, type: 'error' })
        setBackupLoading(false)
        return
      }

      // Guardar el backup en la carpeta de descargas
      const saveResult = await window.api.saveBackup(exportResult.sql)
      
      if (!saveResult.success) {
        setBackupMessage({ text: `❌ Error al guardar: ${saveResult.error}`, type: 'error' })
        setBackupLoading(false)
        return
      }

      setBackupMessage({ 
        text: `✅ Backup creado exitosamente: ${saveResult.fileName}`, 
        type: 'success' 
      })
    } catch (error) {
      console.error('Error al crear backup:', error)
      setBackupMessage({ 
        text: `❌ Error al crear backup: ${error.message}`, 
        type: 'error' 
      })
    } finally {
      setBackupLoading(false)
    }
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>📈 Reportes</h1>
        <p>Generación y exportación de reportes</p>
      </div>

      <div className="view-content">
        <div className="reports-grid">
          {/* Tarjeta de Backup de Base de Datos */}
          <div className="report-card report-card-backup">
            <div className="report-icon">💾</div>
            <h3>Backup de Base de Datos</h3>
            <p>Crear una copia de seguridad completa de toda la base de datos en formato SQL</p>
            <button 
              className="btn-backup"
              onClick={handleBackup}
              disabled={backupLoading}
            >
              {backupLoading ? '⏳ Creando backup...' : '💾 Crear Backup'}
            </button>
            {backupMessage.text && (
              <div className={`backup-message ${backupMessage.type}`}>
                {backupMessage.text}
              </div>
            )}
          </div>

          <div className="report-card">
            <div className="report-icon">💰</div>
            <h3>Reporte de Ventas</h3>
            <p>Exportar historial de ventas filtrado por fecha</p>
            <div className="report-formats">
              <button className="btn-format">📄 PDF</button>
              <button className="btn-format">📊 Excel</button>
              <button className="btn-format">💾 SQL</button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-icon">📦</div>
            <h3>Reporte de Productos</h3>
            <p>Listado completo de productos con stock</p>
            <div className="report-formats">
              <button className="btn-format">📄 PDF</button>
              <button className="btn-format">📊 Excel</button>
              <button className="btn-format">💾 SQL</button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-icon">🛒</div>
            <h3>Reporte de Compras</h3>
            <p>Historial de compras a proveedores</p>
            <div className="report-formats">
              <button className="btn-format">📄 PDF</button>
              <button className="btn-format">📊 Excel</button>
              <button className="btn-format">💾 SQL</button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-icon">📊</div>
            <h3>Reporte Financiero</h3>
            <p>Balance de ingresos y egresos</p>
            <div className="report-formats">
              <button className="btn-format">📄 PDF</button>
              <button className="btn-format">📊 Excel</button>
              <button className="btn-format">💾 SQL</button>
            </div>
          </div>
        </div>

        <div className="coming-soon-note">
          <p>⚠️ Los demás reportes estarán funcionales próximamente</p>
        </div>
      </div>
    </div>
  )
}

export default Reportes

