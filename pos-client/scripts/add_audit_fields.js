// =====================================================
// AGREGAR CAMPOS DE AUDITORÍA
// Agrega campos para registrar usuario y fecha/hora de creación
// =====================================================

const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const dbPath = path.join(process.env.APPDATA || process.env.HOME, 'pos-client', 'pos.db')

console.log('🔧 AGREGANDO CAMPOS DE AUDITORÍA')
console.log('============================================================')
console.log('📂 Base de datos:', dbPath)

if (!fs.existsSync(dbPath)) {
  console.error('❌ No se encontró la base de datos')
  process.exit(1)
}

async function agregarCampos() {
  const SQL = await initSqlJs()
  const db = new SQL.Database(fs.readFileSync(dbPath))

try {
  // Compras
  console.log('\n📦 Tabla: compras')
  try {
    db.run('ALTER TABLE compras ADD COLUMN usuarioRegistro TEXT')
    console.log('✅ Campo usuarioRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioRegistro ya existe')
    } else {
      throw e
    }
  }

  // Productos
  console.log('\n📦 Tabla: productos')
  try {
    db.run('ALTER TABLE productos ADD COLUMN usuarioRegistro TEXT')
    console.log('✅ Campo usuarioRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioRegistro ya existe')
    } else {
      throw e
    }
  }

  // Clientes
  console.log('\n📦 Tabla: clientes')
  try {
    db.run('ALTER TABLE clientes ADD COLUMN usuarioRegistro TEXT')
    db.run('ALTER TABLE clientes ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campos agregados')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campos ya existen')
    } else {
      throw e
    }
  }

  // Proveedores
  console.log('\n📦 Tabla: proveedores')
  try {
    db.run('ALTER TABLE proveedores ADD COLUMN usuarioRegistro TEXT')
    db.run('ALTER TABLE proveedores ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campos agregados')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campos ya existen')
    } else {
      throw e
    }
  }

  // Ventas
  console.log('\n📦 Tabla: ventas')
  try {
    db.run('ALTER TABLE ventas ADD COLUMN usuarioRegistro TEXT')
    console.log('✅ Campo usuarioRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioRegistro ya existe')
    } else {
      throw e
    }
  }

  // Guardar cambios
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)

  db.close()

  console.log('\n============================================================')
  console.log('✅ CAMPOS DE AUDITORÍA AGREGADOS CORRECTAMENTE')
  console.log('============================================================')
} catch (error) {
  console.error('\n❌ ERROR:', error.message)
  process.exit(1)
}
}

// Ejecutar función asíncrona
agregarCampos().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
