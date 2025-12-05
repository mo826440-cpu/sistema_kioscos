// =====================================================
// AGREGAR CAMPO ESTADO A PRODUCTOS
// =====================================================

const path = require('path')
const initSqlJs = require('sql.js')
const fs = require('fs')

// Ruta de la base de datos
const dbPath = path.join(
  process.env.APPDATA || 
  (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.local/share'),
  'pos-client',
  'pos.db'
)

async function addEstadoField() {
  console.log('🔧 AGREGANDO CAMPO ESTADO A PRODUCTOS')
  console.log('============================================================')
  console.log('📂 Base de datos:', dbPath)
  
  try {
    // Verificar que existe la BD
    if (!fs.existsSync(dbPath)) {
      console.error('❌ No se encontró la base de datos en:', dbPath)
      process.exit(1)
    }
    
    // Cargar la BD
    const SQL = await initSqlJs()
    const buffer = fs.readFileSync(dbPath)
    const db = new SQL.Database(buffer)
    
    console.log('\n🔍 Verificando estructura actual...')
    
    // Verificar si ya existe el campo estado
    const tableInfo = db.exec('PRAGMA table_info(productos)')
    const hasEstado = tableInfo[0].values.some(row => row[1] === 'estado')
    
    if (hasEstado) {
      console.log('✅ El campo "estado" ya existe en la tabla productos')
      console.log('   No es necesario hacer cambios')
      return
    }
    
    console.log('📝 Agregando campo "estado" a la tabla productos...')
    
    // Agregar el campo estado (por defecto 'activo')
    db.run(`ALTER TABLE productos ADD COLUMN estado TEXT DEFAULT 'activo'`)
    
    // Actualizar todos los productos existentes a 'activo'
    db.run(`UPDATE productos SET estado = 'activo' WHERE estado IS NULL`)
    
    console.log('✅ Campo agregado exitosamente')
    
    // Verificar
    const countResult = db.exec('SELECT COUNT(*) as total FROM productos')
    const total = countResult[0].values[0][0]
    
    console.log(`\n📊 Total de productos: ${total}`)
    console.log('   Todos marcados como "activo"')
    
    // Guardar cambios
    const data = db.export()
    fs.writeFileSync(dbPath, data)
    
    console.log('\n💾 Base de datos actualizada')
    console.log('============================================================')
    console.log('✅ PROCESO COMPLETADO')
    console.log('============================================================')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
    process.exit(1)
  }
}

addEstadoField()

