# 🔐 Migrar Contraseñas a Hash (bcrypt)

## 📋 ¿Qué hace esta migración?

Convierte las contraseñas que están en **texto plano** en la base de datos a **contraseñas hasheadas** usando bcrypt, mejorando significativamente la seguridad del sistema.

**Antes:**
```
admin123    ← Se ve la contraseña tal cual
```

**Después:**
```
$2a$10$N9qo8uLOickgx2ZMRZoMye.IHgr.gw3fZP7YPbRcF32b3  ← Hash seguro
```

---

## ⚠️ IMPORTANTE

- **Solo ejecutar UNA VEZ** después de actualizar el código
- **Cerrar la aplicación POS** antes de ejecutar el script
- El script detecta automáticamente las contraseñas que ya están hasheadas
- Las contraseñas originales (admin123, etc.) seguirán funcionando para login

---

## 🚀 Cómo Ejecutar la Migración

### Paso 1: Cerrar la Aplicación

Asegurate de cerrar completamente el Sistema POS antes de continuar.

### Paso 2: Ejecutar el Script

Abrí PowerShell y ejecutá:

```powershell
cd C:\Sistema_VisualStudio\pos-client
node scripts/migrate_passwords.js
```

### Paso 3: Verificar la Migración

Deberías ver algo como:

```
🔐 MIGRACIÓN DE CONTRASEÑAS
==================================================

📂 Base de datos: C:\Users\...\AppData\Roaming\pos-client\pos.db

✅ Base de datos cargada

👥 Usuarios encontrados: 3

✅ admin: Contraseña hasheada
✅ DarioM: Contraseña hasheada
✅ AngelaP: Contraseña hasheada

==================================================
✅ MIGRACIÓN COMPLETADA
   - 3 contraseñas hasheadas
   - 0 ya estaban hasheadas
==================================================
```

### Paso 4: Verificar en DB Browser

1. Abrí DB Browser for SQLite
2. Abrí la base de datos: `%APPDATA%\pos-client\pos.db`
3. Tabla `users`, columna `password`
4. Deberías ver los hashes: `$2a$10$...`

### Paso 5: Probar el Login

1. Abrí el Sistema POS
2. Ingresá con las credenciales normales (admin/admin123)
3. Debería funcionar igual que antes

---

## 🔍 Verificar si Necesitas Migrar

Si no estás seguro si necesitás ejecutar la migración, podés verificar en DB Browser:

- **Necesita migración:** Si las contraseñas se ven como texto normal (`admin123`, `Everes1`, etc.)
- **Ya migrado:** Si las contraseñas empiezan con `$2a$` o `$2b$`

---

## 🐛 Solución de Problemas

### Error: "No se encontró el archivo de base de datos"

La base de datos no existe. Iniciá el Sistema POS al menos una vez para crear la base de datos.

### El script dice "Ya está hasheado, omitiendo"

Perfecto, eso significa que esas contraseñas ya fueron migradas. No necesitás hacer nada.

### No puedo hacer login después de migrar

1. Verificá que estés usando la contraseña correcta
2. Si no recordás la contraseña, podés resetearla:
   - Abrí DB Browser
   - Ejecutá este SQL para resetear la contraseña del admin a "admin123":
   ```sql
   UPDATE users 
   SET password = '$2a$10$rBV2/.pXJhEbXzBbV.YAMOmL8qLhRHZf/wQx0qQWLxHqZ7h8NnqPe'
   WHERE username = 'admin'
   ```

---

## 📚 Información Técnica

### ¿Qué es bcrypt?

bcrypt es un algoritmo de hashing de contraseñas diseñado específicamente para ser lento y costoso computacionalmente, lo que lo hace resistente a ataques de fuerza bruta.

### ¿Por qué es más seguro?

1. **Irreversible:** No se puede "deshacer" el hash para obtener la contraseña original
2. **Salt automático:** Cada contraseña genera un hash único
3. **Resistente a rainbow tables:** Pre-computar hashes es inútil
4. **Configurable:** El factor de trabajo (10 en nuestro caso) puede aumentarse

### ¿Qué cambió en el código?

- `createDefaultAdmin()`: Hashea la contraseña del admin al crear la base de datos
- `authenticateUser()`: Compara el hash en lugar de comparar texto plano
- `createUser()`: Hashea la contraseña al crear un nuevo usuario
- `updateUser()`: Hashea la contraseña al cambiarla

---

## ✅ Confirmación

Después de ejecutar el script y probar el login exitosamente, las contraseñas de tu sistema están ahora protegidas con bcrypt.

Para nuevos usuarios que crees, las contraseñas se hashearán automáticamente.

