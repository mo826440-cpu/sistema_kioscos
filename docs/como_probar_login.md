# 🚀 Cómo Probar el Sistema de Login y Usuarios

## 📝 Resumen de lo que Implementamos

Acabamos de agregar:
- ✅ Sistema completo de autenticación
- ✅ Pantalla de login profesional
- ✅ Gestión de usuarios (crear, editar, eliminar, activar/desactivar)
- ✅ Roles y permisos
- ✅ Sesión persistente
- ✅ Usuario administrador por defecto
- ✅ Script para crear acceso directo en el escritorio

---

## 🎯 PASO 1: Reiniciar la Aplicación

Como hicimos cambios importantes, necesitás cerrar completamente la aplicación y volver a iniciarla.

### Opción A: Desde PowerShell

```powershell
cd C:\Sistema_VisualStudio\pos-client
npm start
```

### Opción B: Si ya tenés el acceso directo

1. Ejecutá el script para crear el acceso directo:
   ```powershell
   cd C:\Sistema_VisualStudio
   .\setup\crear_acceso_directo.ps1
   ```

2. Luego hacé doble clic en el acceso directo "Sistema POS" en tu escritorio

---

## 🔐 PASO 2: Probar el Login

Al iniciar, deberías ver una **pantalla de login** con un diseño moderno.

### Credenciales por defecto:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

1. Ingresá las credenciales
2. Hacé clic en **"Ingresar"**
3. Deberías entrar al sistema y ver el Dashboard

---

## 👤 PASO 3: Verificar el Usuario Logueado

En el **sidebar** (barra lateral izquierda), ahora deberías ver:

- Tu avatar: 👤
- Tu nombre: **Administrador**
- Tu rol: **Administrador**

Y al final del sidebar, el botón: **🚪 Cerrar Sesión**

---

## 👥 PASO 4: Probar la Gestión de Usuarios

### Ver Usuarios Actuales

1. Hacé clic en **"👤 Usuarios"** en el sidebar
2. Deberías ver una tabla con el usuario **admin**

### Crear un Nuevo Usuario

1. Hacé clic en **"➕ Nuevo Usuario"**
2. Completá el formulario:
   - **Usuario:** `cajero1`
   - **Nombre Completo:** `Juan Pérez`
   - **Contraseña:** `1234`
   - **Rol:** `Cajero`
3. Hacé clic en **"Crear Usuario"**
4. Deberías ver un mensaje de éxito
5. El nuevo usuario aparecerá en la tabla

### Editar un Usuario

1. Hacé clic en el botón **✏️** (editar) junto al usuario `cajero1`
2. Cambiá el nombre completo a `Juan Carlos Pérez`
3. Hacé clic en **"Guardar Cambios"**
4. El cambio debería reflejarse en la tabla

### Desactivar un Usuario

1. Hacé clic en el botón **🔒** (desactivar) junto al usuario `cajero1`
2. El estado debería cambiar a **"✗ Inactivo"**
3. La fila debería verse grisada

### Activar un Usuario

1. Hacé clic en el botón **🔓** (activar) junto al usuario `cajero1`
2. El estado debería volver a **"✓ Activo"**

---

## 🚪 PASO 5: Probar Cerrar Sesión

1. Hacé clic en **"🚪 Cerrar Sesión"** al final del sidebar
2. Confirmá que querés cerrar sesión
3. Deberías volver a la pantalla de login

---

## 🔄 PASO 6: Probar Login con Otro Usuario

1. Ingresá con el usuario que creaste:
   - **Usuario:** `cajero1`
   - **Contraseña:** `1234`
2. Observá que:
   - El nombre en el sidebar ahora es "Juan Carlos Pérez"
   - El rol dice "Cajero"
   - **No aparece el menú "Usuarios"** (porque los cajeros no tienen permiso)

---

## 🗂️ PASO 7: Ver la Base de Datos

### Con DB Browser for SQLite

1. Abrí **DB Browser for SQLite**
2. Hacé clic en **"Open Database"**
3. Navegá a: `C:\Users\[TuUsuario]\AppData\Roaming\pos-client\pos.db`
4. Hacé clic en la pestaña **"Browse Data"**
5. Seleccioná la tabla **"users"**
6. Deberías ver los 2 usuarios creados (admin y cajero1)

---

## ✅ Lista de Verificación

Marcá cada ítem a medida que lo probás:

- [ ] La pantalla de login aparece al iniciar
- [ ] Puedo ingresar con las credenciales por defecto
- [ ] El sidebar muestra mi nombre y rol
- [ ] Puedo acceder a la sección "Usuarios"
- [ ] Puedo crear un nuevo usuario
- [ ] Puedo editar un usuario existente
- [ ] Puedo desactivar/activar un usuario
- [ ] Puedo cerrar sesión
- [ ] Puedo ingresar con el nuevo usuario creado
- [ ] Los cajeros NO ven el menú "Usuarios"
- [ ] La base de datos muestra los usuarios correctamente

---

## 🐛 Si algo no funciona

### La pantalla de login no aparece

1. Abrí DevTools (F12)
2. Mirá si hay errores en la consola
3. Ejecutá: `localStorage.clear()`
4. Recargá la página (Ctrl + R)

### No puedo crear usuarios

1. Verificá que estés logueado como administrador
2. Abrí DevTools (F12) y mirá la consola para ver el error
3. Verificá que la base de datos exista en `%APPDATA%\pos-client\pos.db`

### El botón "Usuarios" no aparece

Esto es normal si no estás logueado como administrador. Solo los admins pueden gestionar usuarios.

---

## 📞 Próximos Pasos Sugeridos

Ahora que tenés login y usuarios funcionando, podés:

1. **Crear usuarios reales** para cada empleado de tu negocio
2. **Asignar roles apropiados** según las responsabilidades
3. **Implementar la pantalla de Productos** completa para gestionar el catálogo
4. **Agregar el acceso directo** para facilitar el inicio desde el escritorio
5. **Explorar otras funcionalidades** del sistema

---

¿Todo funcionó bien? ¿Encontraste algún problema?

