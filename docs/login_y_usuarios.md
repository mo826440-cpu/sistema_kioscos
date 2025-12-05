# 👥 Sistema de Login y Gestión de Usuarios

## 📋 Resumen

El sistema ahora incluye autenticación completa con:
- Pantalla de login al iniciar
- Gestión de usuarios y permisos
- Diferentes roles de acceso
- Sesión persistente

---

## 🔐 Credenciales Por Defecto

Al iniciar por primera vez, el sistema crea automáticamente un usuario administrador:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

⚠️ **IMPORTANTE:** Cambiá esta contraseña después del primer login.

---

## 👤 Roles de Usuario

El sistema soporta 4 tipos de roles:

### 1. 👑 **Administrador (admin)**
- Acceso total al sistema
- Puede gestionar usuarios
- Puede ver todas las secciones
- Permisos completos de edición

### 2. 📊 **Gerente (manager)**
- Acceso a reportes y estadísticas
- Puede gestionar productos y ventas
- No puede gestionar usuarios

### 3. 💰 **Cajero (cashier)**
- Acceso principalmente a la pantalla de Ventas
- Puede registrar ventas
- Acceso limitado a otras secciones

### 4. 👁️ **Visor (viewer)**
- Solo lectura
- Puede ver información pero no editarla

---

## 🎯 Cómo Usar el Sistema de Usuarios

### Crear un Nuevo Usuario

1. Ingresá al sistema con un usuario administrador
2. Andá a la sección **"Usuarios"** en el sidebar
3. Hacé clic en **"➕ Nuevo Usuario"**
4. Completá el formulario:
   - **Usuario:** Nombre de usuario único (Ej: `jperez`)
   - **Nombre Completo:** Nombre real del empleado
   - **Contraseña:** Mínimo 4 caracteres
   - **Rol:** Seleccioná el rol apropiado
5. Hacé clic en **"Crear Usuario"**

### Editar un Usuario

1. En la pantalla de Usuarios, hacé clic en el botón **✏️** (Editar)
2. Modificá los datos necesarios
3. Para cambiar la contraseña, ingresá una nueva (dejá vacío para no cambiarla)
4. Hacé clic en **"Guardar Cambios"**

### Desactivar un Usuario

En lugar de eliminar usuarios, podés desactivarlos:

1. Hacé clic en el botón **🔒** (Desactivar)
2. El usuario no podrá iniciar sesión pero mantendrá su historial
3. Para reactivarlo, hacé clic en **🔓** (Activar)

### Eliminar un Usuario

1. Hacé clic en el botón **🗑️** (Eliminar)
2. Confirmá la acción

⚠️ **Restricciones:**
- No podés eliminar el usuario administrador principal (ID: 1)
- No podés eliminarte a vos mismo

---

## 🚪 Cerrar Sesión

Para cerrar sesión:

1. Hacé clic en **"Cerrar Sesión"** al final del sidebar
2. Confirmá la acción
3. Volverás a la pantalla de login

---

## 💾 Base de Datos

### Tabla de Usuarios

Los usuarios se guardan en la tabla `users` con la siguiente estructura:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier',
  permissions TEXT NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Ubicación del Archivo

La base de datos se encuentra en:
```
C:\Users\[TuUsuario]\AppData\Roaming\pos-client\pos.db
```

Podés abrirla con **DB Browser for SQLite** para ver o modificar datos directamente.

---

## 🔧 Configuración Adicional

### Cambiar la Ruta del Proyecto

Si instalaste el proyecto en otra ubicación, editá el script de acceso directo:

1. Abrí `setup/crear_acceso_directo.ps1`
2. Modificá la línea:
   ```powershell
   $projectPath = "C:\Sistema_VisualStudio\pos-client"
   ```
3. Reemplazá con tu ruta

### Sesión Persistente

El sistema guarda la sesión en `localStorage`, lo que significa que:
- No tenés que volver a iniciar sesión cada vez que abrís la app
- Para forzar el cierre de sesión, hacé clic en "Cerrar Sesión"

---

## 🐛 Resolución de Problemas

### No puedo iniciar sesión

1. Verificá que estés usando las credenciales correctas
2. Si olvidaste la contraseña, podés:
   - Abrir la base de datos con DB Browser
   - Ejecutar: `UPDATE users SET password = 'nueva123' WHERE username = 'admin'`

### La pantalla de login no aparece

1. Cerrá la aplicación completamente
2. Abrí DevTools (F12)
3. En la consola, ejecutá: `localStorage.clear()`
4. Reiniciá la aplicación

### El botón "Usuarios" no aparece

El menú de Usuarios solo es visible para usuarios con rol de **Administrador**.

---

## ⚠️ Notas de Seguridad

**IMPORTANTE para producción:**

1. Las contraseñas actualmente se guardan en texto plano
2. En un entorno real, deberías usar **bcrypt** para encriptarlas
3. El sistema está pensado para uso local/interno
4. No expongas la base de datos directamente a internet

---

## 📚 Próximos Pasos

Con el sistema de usuarios implementado, ahora podés:

1. ✅ Crear usuarios para cada empleado
2. ✅ Asignar roles según responsabilidades
3. 🔄 Implementar permisos granulares por sección
4. 🔄 Agregar registro de auditoría (quién hizo qué)
5. 🔄 Implementar recuperación de contraseña

---

¿Necesitás ayuda con algo específico del sistema de usuarios?

