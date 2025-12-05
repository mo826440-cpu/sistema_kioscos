// =====================================================
// SCRIPT DE MIGRACIÓN - HASHEAR CONTRASEÑAS EXISTENTES
// =====================================================
//
// Este script convierte las contraseñas en texto plano
// a contraseñas hasheadas con bcrypt.
//
// IMPORTANTE: Solo ejecutar UNA VEZ
//
// =====================================================

const initSqlJs = require('sql.js')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Obtener ruta de la base de datos
const DB_PATH = path.join(
  process.env.APPDATA || process.env.HOME,
  'pos-client',
  'pos.db'
)

console.log('🔐 MIGRACIÓN DE CONTRASEÑAS')
console.log('=' .repeat(50))
console.log('')
console.log('📂 Base de datos:', DB_PATH)
console.log('')

async function migratePasswords() {
  try {
    // Verificar que exista la base de datos
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ No se encontró el archivo de base de datos')
      console.log('   Ubicación esperada:', DB_PATH)
      return
    }

    // Inicializar sql.js
    const SQL = await initSqlJs()
    
    // Cargar base de datos
    const buffer = fs.readFileSync(DB_PATH)
    const db = new SQL.Database(buffer)
    
    console.log('✅ Base de datos cargada')
    console.log('')
    
    // Obtener todos los usuarios
    const result = db.exec('SELECT id, username, password FROM users')
    
    if (result.length === 0 || result[0].values.length === 0) {
      console.log('⚠️  No hay usuarios para migrar')
      return
    }
    
    const users = result[0].values
    console.log(`👥 Usuarios encontrados: ${users.length}`)
    console.log('')
    
    let migrated = 0
    let skipped = 0
    
    // Migrar cada usuario
    for (const [id, username, password] of users) {
      // Verificar si ya está hasheado (bcrypt hashes empiezan con $2a$ o $2b$)
      if (password.startsWith('$2a$') || password.startsWith('$2b$')) {
        console.log(`⏭️  ${username}: Ya está hasheado, omitiendo`)
        skipped++
        continue
      }
      
      // Hashear la contraseña
      const hashedPassword = bcrypt.hashSync(password, 10)
      
      // Actualizar en la base de datos
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id])
      
      console.log(`✅ ${username}: Contraseña hasheada`)
      migrated++
    }
    
    // Guardar cambios
    if (migrated > 0) {
      const data = db.export()
      const bufferToSave = Buffer.from(data)
      fs.writeFileSync(DB_PATH, bufferToSave)
      
      console.log('')
      console.log('=' .repeat(50))
      console.log('✅ MIGRACIÓN COMPLETADA')
      console.log(`   - ${migrated} contraseñas hasheadas`)
      console.log(`   - ${skipped} ya estaban hasheadas`)
      console.log('=' .repeat(50))
    } else {
      console.log('')
      console.log('⚠️  No se realizaron cambios (todas las contraseñas ya estaban hasheadas)')
    }
    
  } catch (error) {
    console.error('')
    console.error('❌ ERROR:', error.message)
    console.error('')
  }
}

// Ejecutar migración
migratePasswords()

