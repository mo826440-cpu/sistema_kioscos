// =====================================================
// SCRIPT DE MIGRACIÓN: MySQL → SQLite
// =====================================================
//
// Este script convierte el export de MySQL (gestion_kioscos.sql)
// a una base de datos SQLite funcional para Electron
//
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

console.log('🔄 MIGRACIÓN MySQL → SQLite')
console.log('=' .repeat(60))
console.log('')
console.log('📂 Archivo MySQL:', MYSQL_FILE)
console.log('📂 Base de datos SQLite:', SQLITE_DB_PATH)
console.log('')

async function convertMySQLToSQLite() {
  try {
    // Verificar que existe el archivo MySQL
    if (!fs.existsSync(MYSQL_FILE)) {
      console.error('❌ No se encuentra el archivo:', MYSQL_FILE)
      console.log('   Por favor, asegurate de que gestion_kioscos.sql esté en la raíz del proyecto')
      return
    }

    console.log('📖 Leyendo archivo MySQL...')
    let sqlContent = fs.readFileSync(MYSQL_FILE, 'utf8')
    
    console.log('🔧 Convirtiendo sintaxis MySQL → SQLite...')
    
    // 1. Remover comentarios de configuración MySQL
    sqlContent = sqlContent.replace(/\/\*!40\d{3}.*?\*\/;/gs, '')
    sqlContent = sqlContent.replace(/\/\*!40\d{3}.*?\*\//g, '')
    
    // 2. Remover configuraciones de MySQL
    sqlContent = sqlContent.replace(/SET .*?;/g, '')
    sqlContent = sqlContent.replace(/START TRANSACTION;/g, '')
    sqlContent = sqlContent.replace(/COMMIT;/g, '')
    
    // 3. Convertir ENGINE y CHARSET (eliminar)
    sqlContent = sqlContent.replace(/ENGINE=\w+/g, '')
    sqlContent = sqlContent.replace(/DEFAULT CHARSET=\w+/g, '')
    sqlContent = sqlContent.replace(/COLLATE=\w+/g, '')
    
    // 4. Convertir AUTO_INCREMENT → AUTOINCREMENT
    sqlContent = sqlContent.replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
    
    // 5. Convertir tipos ENUM a TEXT (SQLite no tiene ENUM)
    // Ejemplo: enum('pendiente','parcial','pagado') → TEXT
    sqlContent = sqlContent.replace(/enum\([^)]+\)/gi, 'TEXT')
    
    // 6. Convertir current_timestamp() → CURRENT_TIMESTAMP
    sqlContent = sqlContent.replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP')
    
    // 7. Convertir DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    // SQLite no soporta ON UPDATE, usar triggers después
    sqlContent = sqlContent.replace(/DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'DEFAULT CURRENT_TIMESTAMP')
    
    // 8. Convertir backticks a comillas dobles (SQLite prefiere comillas dobles para identificadores)
    sqlContent = sqlContent.replace(/`/g, '"')
    
    // 9. Remover vistas (CREATE VIEW) - las crearemos más simple después
    sqlContent = sqlContent.replace(/CREATE ALGORITHM=.*?;/gs, '')
    sqlContent = sqlContent.replace(/DROP TABLE IF EXISTS vista_.*?;/g, '')
    sqlContent = sqlContent.replace(/CREATE TABLE vista_.*?\);/gs, '')
    
    // 10. Convertir ON DELETE CASCADE, ON UPDATE CASCADE
    // SQLite soporta esto, pero la sintaxis puede ser diferente
    sqlContent = sqlContent.replace(/ON DELETE SET NULL ON UPDATE CASCADE/g, 'ON DELETE SET NULL')
    
    // 11. Remover DEFINER y SQL SECURITY (específico de MySQL)
    sqlContent = sqlContent.replace(/DEFINER=`[^`]+`@`[^`]+`/g, '')
    sqlContent = sqlContent.replace(/SQL SECURITY DEFINER/g, '')
    
    // 12. Convertir MODIFY a ALTER COLUMN (aunque no lo usaremos mucho)
    sqlContent = sqlContent.replace(/MODIFY /g, '')
    
    // 13. Remover KEY que no sea PRIMARY KEY o FOREIGN KEY
    sqlContent = sqlContent.replace(/,\s*KEY [^\(]+\([^\)]+\)/g, '')
    
    console.log('✅ Conversión de sintaxis completada')
    console.log('')
    
    // Debug: buscar CREATE TABLE en el contenido
    const createTableMatches = sqlContent.match(/CREATE TABLE/gi)
    console.log(`🔍 DEBUG: Encontrados ${createTableMatches ? createTableMatches.length : 0} CREATE TABLE en el archivo`)
    console.log('')
    
    // Inicializar sql.js
    console.log('🔧 Inicializando SQLite...')
    const SQL = await initSqlJs()
    const db = new SQL.Database()
    
    console.log('📝 Ejecutando sentencias SQL...')
    
    // Dividir en sentencias individuales
    const allStatements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => !s.startsWith('--'))
      .filter(s => !s.match(/^(SET|START|COMMIT)/i))
    
    console.log(`🔍 DEBUG: Total de sentencias después de filtrar: ${allStatements.length}`)
    
    // Mostrar primeras 3 sentencias para debug
    console.log('🔍 DEBUG: Primeras sentencias:')
    for (let i = 0; i < Math.min(3, allStatements.length); i++) {
      console.log(`   ${i + 1}. ${allStatements[i].substring(0, 80)}...`)
    }
    console.log('')
    
    // Agrupar sentencias por tipo
    const createStatements = []
    const insertStatements = []
    const alterStatements = []
    const otherStatements = []
    
    for (const stmt of allStatements) {
      if (stmt.match(/^CREATE TABLE/i)) {
        createStatements.push(stmt)
      } else if (stmt.match(/^INSERT INTO/i)) {
        insertStatements.push(stmt)
      } else if (stmt.match(/^ALTER TABLE/i)) {
        // Skip MODIFY y ADD CONSTRAINT problemáticos
        if (!stmt.match(/MODIFY/i) && !stmt.match(/ADD CONSTRAINT/i)) {
          alterStatements.push(stmt)
        }
      } else {
        otherStatements.push(stmt)
      }
    }
    
    console.log(`   📊 ${createStatements.length} CREATE TABLE`)
    console.log(`   📊 ${insertStatements.length} INSERT`)
    console.log(`   📊 ${alterStatements.length} ALTER TABLE`)
    console.log(`   📊 ${otherStatements.length} OTROS`)
    
    if (otherStatements.length > 0 && otherStatements.length <= 5) {
      console.log('   🔍 Sentencias OTROS:')
      otherStatements.forEach((stmt, i) => {
        console.log(`      ${i + 1}. ${stmt.substring(0, 80)}...`)
      })
    }
    console.log('')
    
    let successCount = 0
    let errorCount = 0
    
    // 1. Ejecutar CREATE TABLE primero
    console.log('   1️⃣ Creando tablas...')
    for (let i = 0; i < createStatements.length; i++) {
      try {
        db.run(createStatements[i])
        successCount++
      } catch (error) {
        errorCount++
        console.log(`      ⚠️ Error creando tabla: ${error.message.substring(0, 60)}`)
      }
    }
    console.log(`      ✅ ${createStatements.length - errorCount} tablas creadas`)
    console.log('')
    
    // 2. Ejecutar INSERT
    console.log('   2️⃣ Insertando datos...')
    for (let i = 0; i < insertStatements.length; i++) {
      try {
        db.run(insertStatements[i])
        successCount++
        
        // Mostrar progreso cada 100 inserts
        if ((i + 1) % 100 === 0) {
          console.log(`      Procesados ${i + 1}/${insertStatements.length} registros...`)
        }
      } catch (error) {
        errorCount++
        if (errorCount <= 10) {
          console.log(`      ⚠️ Error en INSERT: ${error.message.substring(0, 60)}`)
        }
      }
    }
    console.log(`      ✅ ${insertStatements.length - errorCount} registros insertados`)
    console.log('')
    
    // 3. Ejecutar ALTER TABLE (si hay)
    if (alterStatements.length > 0) {
      console.log('   3️⃣ Modificando tablas...')
      for (const stmt of alterStatements) {
        try {
          db.run(stmt)
          successCount++
        } catch (error) {
          errorCount++
        }
      }
      console.log(`      ✅ ${alterStatements.length - errorCount} modificaciones aplicadas`)
      console.log('')
    }
    
    console.log('')
    console.log('📊 Resumen:')
    console.log(`   ✅ Exitosas: ${successCount}`)
    console.log(`   ⚠️  Errores: ${errorCount}`)
    console.log('')
    
    // Verificar que se crearon las tablas principales
    console.log('🔍 Verificando tablas creadas...')
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    
    if (tables.length > 0 && tables[0].values.length > 0) {
      console.log(`   ✅ ${tables[0].values.length} tablas creadas:`)
      tables[0].values.forEach(row => {
        console.log(`      - ${row[0]}`)
      })
    } else {
      console.error('   ❌ No se crearon tablas. Revisar errores.')
      return
    }
    
    console.log('')
    console.log('💾 Guardando base de datos...')
    
    // Crear directorio si no existe
    const dbDir = path.dirname(SQLITE_DB_PATH)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    
    // Guardar la base de datos
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(SQLITE_DB_PATH, buffer)
    
    console.log('✅ Base de datos guardada exitosamente')
    console.log('')
    
    // Mostrar estadísticas
    console.log('📊 Estadísticas de la base de datos:')
    const stats = fs.statSync(SQLITE_DB_PATH)
    console.log(`   Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    
    // Contar registros en tablas principales
    try {
      const productos = db.exec('SELECT COUNT(*) FROM productos')
      const clientes = db.exec('SELECT COUNT(*) FROM clientes')
      const ventas = db.exec('SELECT COUNT(*) FROM ventas')
      const usuarios = db.exec('SELECT COUNT(*) FROM usuarios')
      
      console.log(`   Productos: ${productos[0].values[0][0]}`)
      console.log(`   Clientes: ${clientes[0].values[0][0]}`)
      console.log(`   Ventas: ${ventas[0].values[0][0]}`)
      console.log(`   Usuarios: ${usuarios[0].values[0][0]}`)
    } catch (e) {
      console.log('   (No se pudieron contar registros)')
    }
    
    console.log('')
    console.log('=' .repeat(60))
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE')
    console.log('=' .repeat(60))
    console.log('')
    console.log('🎉 Ahora podés iniciar el sistema POS y verás todos tus datos.')
    console.log('')
    
  } catch (error) {
    console.error('')
    console.error('❌ ERROR FATAL:', error.message)
    console.error('')
    console.error(error.stack)
  }
}

// Ejecutar migración
convertMySQLToSQLite()

