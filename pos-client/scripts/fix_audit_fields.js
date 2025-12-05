// =====================================================
// COMPLETAR CAMPOS DE AUDITORÍA
// Agrega fechaRegistro a las tablas que les falta
// =====================================================

const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const dbPath = path.join(process.env.APPDATA || process.env.HOME, 'pos-client', 'pos.db')

console.log('🔧 COMPLETANDO CAMPOS DE AUDITORÍA')
console.log('============================================================')
console.log('📂 Base de datos:', dbPath)

if (!fs.existsSync(dbPath)) {
  console.error('❌ No se encontró la base de datos')
  process.exit(1)
}

async function completarCampos() {
  const SQL = await initSqlJs()
  const db = new SQL.Database(fs.readFileSync(dbPath))

try {
  // Tabla: compras
  console.log('\n📦 Tabla: compras')
  try {
    db.run('ALTER TABLE compras ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campo fechaRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE compras ADD COLUMN usuarioActualizacion TEXT')
    console.log('✅ Campo usuarioActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioActualizacion ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE compras ADD COLUMN fechaActualizacion TEXT')
    console.log('✅ Campo fechaActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaActualizacion ya existe')
    } else {
      throw e
    }
  }

  // Tabla: productos
  console.log('\n📦 Tabla: productos')
  try {
    db.run('ALTER TABLE productos ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campo fechaRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE productos ADD COLUMN usuarioActualizacion TEXT')
    console.log('✅ Campo usuarioActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioActualizacion ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE productos ADD COLUMN fechaActualizacion TEXT')
    console.log('✅ Campo fechaActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaActualizacion ya existe')
    } else {
      throw e
    }
  }

  // Tabla: ventas
  console.log('\n📦 Tabla: ventas')
  try {
    db.run('ALTER TABLE ventas ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campo fechaRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE ventas ADD COLUMN usuarioActualizacion TEXT')
    console.log('✅ Campo usuarioActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioActualizacion ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE ventas ADD COLUMN fechaActualizacion TEXT')
    console.log('✅ Campo fechaActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaActualizacion ya existe')
    } else {
      throw e
    }
  }

  // Tabla: categorias
  console.log('\n📦 Tabla: categorias')
  try {
    db.run('ALTER TABLE categorias ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campo fechaRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE categorias ADD COLUMN usuarioRegistro TEXT')
    console.log('✅ Campo usuarioRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE categorias ADD COLUMN usuarioActualizacion TEXT')
    console.log('✅ Campo usuarioActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioActualizacion ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE categorias ADD COLUMN fechaActualizacion TEXT')
    console.log('✅ Campo fechaActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaActualizacion ya existe')
    } else {
      throw e
    }
  }

  // Tabla: marcas
  console.log('\n📦 Tabla: marcas')
  try {
    db.run('ALTER TABLE marcas ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campo fechaRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE marcas ADD COLUMN usuarioRegistro TEXT')
    console.log('✅ Campo usuarioRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE marcas ADD COLUMN usuarioActualizacion TEXT')
    console.log('✅ Campo usuarioActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioActualizacion ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE marcas ADD COLUMN fechaActualizacion TEXT')
    console.log('✅ Campo fechaActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaActualizacion ya existe')
    } else {
      throw e
    }
  }

  // Tabla: usuarios
  console.log('\n📦 Tabla: usuarios')
  try {
    db.run('ALTER TABLE usuarios ADD COLUMN fechaRegistro TEXT')
    console.log('✅ Campo fechaRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE usuarios ADD COLUMN usuarioRegistro TEXT')
    console.log('✅ Campo usuarioRegistro agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioRegistro ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE usuarios ADD COLUMN usuarioActualizacion TEXT')
    console.log('✅ Campo usuarioActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo usuarioActualizacion ya existe')
    } else {
      throw e
    }
  }
  
  try {
    db.run('ALTER TABLE usuarios ADD COLUMN fechaActualizacion TEXT')
    console.log('✅ Campo fechaActualizacion agregado')
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('⚠️  Campo fechaActualizacion ya existe')
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
  console.log('✅ TODOS LOS CAMPOS DE AUDITORÍA COMPLETADOS')
  console.log('============================================================')
} catch (error) {
  console.error('\n❌ ERROR:', error.message)
  process.exit(1)
}
}

// Ejecutar función asíncrona
completarCampos().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})

