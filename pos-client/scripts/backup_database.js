// =====================================================
// SCRIPT: Crear backup de la base de datos SQLite
// =====================================================

const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(
  process.env.APPDATA || process.env.HOME,
  'pos-client',
  'pos.db'
)

const BACKUP_DIR = path.join(
  process.env.APPDATA || process.env.HOME,
  'pos-client',
  'backups'
)

function createBackup() {
  try {
    console.log('💾 CREANDO BACKUP DE LA BASE DE DATOS')
    console.log('=' .repeat(60))
    console.log('')

    // Verificar que existe la BD
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ No se encuentra la base de datos en:', DB_PATH)
      return
    }

    // Crear directorio de backups si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
      console.log('📁 Creado directorio de backups:', BACKUP_DIR)
    }

    // Nombre del backup con fecha y hora
    const now = new Date()
    const timestamp = now.toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '_')
    
    const backupName = `pos_backup_${timestamp}.db`
    const backupPath = path.join(BACKUP_DIR, backupName)

    // Copiar archivo
    console.log('📋 Copiando base de datos...')
    fs.copyFileSync(DB_PATH, backupPath)

    // Verificar copia
    const originalStats = fs.statSync(DB_PATH)
    const backupStats = fs.statSync(backupPath)

    console.log('')
    console.log('✅ BACKUP CREADO EXITOSAMENTE')
    console.log('─'.repeat(60))
    console.log(`📂 Ubicación: ${backupPath}`)
    console.log(`📊 Tamaño: ${(backupStats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📅 Fecha: ${now.toLocaleString('es-AR')}`)
    console.log('')

    // Listar todos los backups
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f)
        const stats = fs.statSync(filePath)
        return {
          name: f,
          size: stats.size,
          date: stats.mtime
        }
      })
      .sort((a, b) => b.date - a.date)

    console.log('📚 Backups disponibles:')
    backups.forEach((backup, i) => {
      const sizeMB = (backup.size / 1024 / 1024).toFixed(2)
      const date = backup.date.toLocaleString('es-AR')
      const marker = i === 0 ? '← NUEVO' : ''
      console.log(`   ${i + 1}. ${backup.name} (${sizeMB} MB) - ${date} ${marker}`)
    })

    console.log('')
    console.log('💡 Para restaurar un backup:')
    console.log(`   1. Cierra la aplicación`)
    console.log(`   2. Copia el archivo de backup deseado`)
    console.log(`   3. Reemplaza: ${DB_PATH}`)
    console.log('')

  } catch (error) {
    console.error('❌ ERROR:', error.message)
    console.error(error.stack)
  }
}

createBackup()

