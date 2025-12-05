// =====================================================
// SCRIPT: Mostrar estructura de la base de datos SQLite
// =====================================================

const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const SQLITE_DB_PATH = path.join(
  process.env.APPDATA || process.env.HOME,
  'pos-client',
  'pos.db'
)

async function showStructure() {
  try {
    console.log('📊 ESTRUCTURA DE LA BASE DE DATOS')
    console.log('=' .repeat(80))
    console.log('')

    if (!fs.existsSync(SQLITE_DB_PATH)) {
      console.error('❌ No se encuentra la base de datos en:', SQLITE_DB_PATH)
      return
    }

    const SQL = await initSqlJs()
    const dbBuffer = fs.readFileSync(SQLITE_DB_PATH)
    const db = new SQL.Database(dbBuffer)

    // Obtener todas las tablas
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    
    if (!tables.length || !tables[0].values.length) {
      console.log('❌ No hay tablas en la base de datos')
      return
    }

    console.log(`📁 Total de tablas: ${tables[0].values.length}`)
    console.log('')

    // Para cada tabla, mostrar estructura y contar registros
    for (const [tableName] of tables[0].values) {
      console.log('─'.repeat(80))
      console.log(`📋 TABLA: ${tableName}`)
      console.log('─'.repeat(80))
      
      // Obtener esquema
      const schema = db.exec(`PRAGMA table_info(${tableName})`)
      
      if (schema.length && schema[0].values.length) {
        console.log('\n🔹 Campos:')
        schema[0].values.forEach(([cid, name, type, notnull, dflt_value, pk]) => {
          let info = `   ${name} (${type})`
          if (pk) info += ' 🔑 PRIMARY KEY'
          if (notnull) info += ' NOT NULL'
          if (dflt_value !== null) info += ` DEFAULT ${dflt_value}`
          console.log(info)
        })
      }

      // Contar registros
      try {
        const count = db.exec(`SELECT COUNT(*) as total FROM ${tableName}`)
        const total = count[0].values[0][0]
        console.log(`\n📊 Total de registros: ${total}`)
      } catch (e) {
        console.log('\n⚠️  No se pudo contar registros')
      }

      // Mostrar ejemplo de 1 registro (si existe)
      try {
        const sample = db.exec(`SELECT * FROM ${tableName} LIMIT 1`)
        if (sample.length && sample[0].values.length) {
          console.log('\n🔍 Ejemplo de registro:')
          const columns = sample[0].columns
          const values = sample[0].values[0]
          columns.forEach((col, i) => {
            let val = values[i]
            if (typeof val === 'string' && val.length > 50) {
              val = val.substring(0, 50) + '...'
            }
            console.log(`   ${col}: ${val}`)
          })
        }
      } catch (e) {
        console.log('\n⚠️  No se pudo obtener ejemplo')
      }

      console.log('')
    }

    console.log('=' .repeat(80))
    console.log('✅ FIN DE LA ESTRUCTURA')
    console.log('=' .repeat(80))

    db.close()

  } catch (error) {
    console.error('❌ ERROR:', error.message)
    console.error(error.stack)
  }
}

showStructure()

