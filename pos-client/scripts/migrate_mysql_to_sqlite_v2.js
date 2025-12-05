// =====================================================
// SCRIPT DE MIGRACIÓN: MySQL → SQLite (Versión Simple)
// =====================================================

const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const MYSQL_FILE = path.join(__dirname, '../gestion_kioscos.sql')
const SQLITE_DB_PATH = path.join(
  process.env.APPDATA || process.env.HOME,
  'pos-client',
  'pos.db'
)

console.log('🔄 MIGRACIÓN MySQL → SQLite (v2)')
console.log('=' .repeat(60))
console.log('')

async function migrate() {
  try {
    if (!fs.existsSync(MYSQL_FILE)) {
      console.error('❌ No se encuentra:', MYSQL_FILE)
      return
    }

    console.log('📖 Leyendo archivo MySQL...')
    let sql = fs.readFileSync(MYSQL_FILE, 'utf8')
    
    console.log('🔧 Limpiando sintaxis MySQL...')
    
    // Remover líneas de configuración
    sql = sql.split('\n')
      .filter(line => !line.match(/^(SET|START TRANSACTION|COMMIT|\/\*!|--)/))
      .join('\n')
    
    // Convertir sintaxis básica
    sql = sql.replace(/ENGINE=\w+/g, '')
    sql = sql.replace(/DEFAULT CHARSET=\w+/g, '')
    sql = sql.replace(/COLLATE=\w+/g, '')
    sql = sql.replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
    sql = sql.replace(/enum\([^)]+\)/gi, 'TEXT')
    sql = sql.replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP')
    sql = sql.replace(/ON UPDATE CURRENT_TIMESTAMP/gi, '')
    
    // Remover vistas (CREATE VIEW)
    sql = sql.replace(/DROP TABLE IF EXISTS "?vista_[^;]+;/g, '')
    sql = sql.replace(/CREATE[^;]*?"?vista_[^;]+;/gs, '')
    
    console.log('🔧 Inicializando SQLite...')
    const SQL = await initSqlJs()
    const db = new SQL.Database()
    
    console.log('📝 Dividiendo en sentencias...')
    
    // Dividir por ; pero mantener la estructura
    const statements = []
    let currentStmt = ''
    const lines = sql.split('\n')
    
    for (const line of lines) {
      currentStmt += line + '\n'
      if (line.trim().endsWith(';')) {
        const stmt = currentStmt.trim()
        if (stmt.length > 10) {
          statements.push(stmt)
        }
        currentStmt = ''
      }
    }
    
    console.log(`   Total sentencias: ${statements.length}`)
    console.log('')
    
    // Separar por tipo
    const creates = statements.filter(s => s.match(/^CREATE TABLE/i))
    const inserts = statements.filter(s => s.match(/^INSERT INTO/i))
    const alters = statements.filter(s => s.match(/^ALTER TABLE/i) && !s.match(/ADD CONSTRAINT|MODIFY/i))
    
    console.log(`   📊 ${creates.length} CREATE TABLE`)
    console.log(`   📊 ${inserts.length} INSERT INTO`)
    console.log(`   📊 ${alters.length} ALTER TABLE`)
    console.log('')
    
    let success = 0
    let errors = 0
    
    // 1. Crear tablas
    console.log('1️⃣ Creando tablas...')
    for (let i = 0; i < creates.length; i++) {
      try {
        db.run(creates[i])
        success++
        console.log(`   ✅ Tabla ${i + 1}/${creates.length}`)
      } catch (error) {
        errors++
        console.log(`   ❌ Error tabla ${i + 1}: ${error.message.substring(0, 60)}`)
        console.log(`      SQL: ${creates[i].substring(0, 100)}...`)
      }
    }
    console.log('')
    
    // 2. Insertar datos
    console.log('2️⃣ Insertando datos...')
    for (let i = 0; i < inserts.length; i++) {
      try {
        db.run(inserts[i])
        success++
        if ((i + 1) % 100 === 0) {
          console.log(`   📝 ${i + 1}/${inserts.length}...`)
        }
      } catch (error) {
        errors++
        if (errors <= 10) {
          console.log(`   ⚠️ Error INSERT ${i + 1}: ${error.message.substring(0, 60)}`)
        }
      }
    }
    console.log(`   ✅ ${success - creates.length} registros insertados`)
    console.log('')
    
    // Verificar tablas
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    
    if (tables.length > 0 && tables[0].values.length > 0) {
      console.log(`✅ ${tables[0].values.length} tablas creadas:`)
      tables[0].values.forEach(row => console.log(`   - ${row[0]}`))
      console.log('')
      
      // Guardar
      console.log('💾 Guardando base de datos...')
      const dbDir = path.dirname(SQLITE_DB_PATH)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }
      
      const data = db.export()
      fs.writeFileSync(SQLITE_DB_PATH, Buffer.from(data))
      
      const stats = fs.statSync(SQLITE_DB_PATH)
      console.log(`   Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
      console.log('')
      
      // Contar registros
      console.log('📊 Registros:')
      try {
        const productos = db.exec('SELECT COUNT(*) FROM productos')[0].values[0][0]
        const clientes = db.exec('SELECT COUNT(*) FROM clientes')[0].values[0][0]
        const ventas = db.exec('SELECT COUNT(*) FROM ventas')[0].values[0][0]
        const usuarios = db.exec('SELECT COUNT(*) FROM usuarios')[0].values[0][0]
        
        console.log(`   Productos: ${productos}`)
        console.log(`   Clientes: ${clientes}`)
        console.log(`   Ventas: ${ventas}`)
        console.log(`   Usuarios: ${usuarios}`)
      } catch (e) {
        console.log('   (Error contando registros)')
      }
      
      console.log('')
      console.log('=' .repeat(60))
      console.log('✅ MIGRACIÓN COMPLETADA')
      console.log('=' .repeat(60))
      
    } else {
      console.log('❌ No se crearon tablas')
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message)
    console.error(error.stack)
  }
}

migrate()

