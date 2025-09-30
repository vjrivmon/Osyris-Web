# 🔑 Credenciales de Administrador - Panel de Control

## 👨‍💼 Usuario Administrador Creado

He creado exitosamente un usuario administrador en la base de datos local para que puedas probar todas las funcionalidades del panel de control.

### 📋 Credenciales de Acceso

```
Email:    admin@grupoosyris.es
Password: OsyrisAdmin2024!
Rol:      admin
```

### 🌐 URLs de Acceso

- **Panel de Administración:** http://localhost:3000/dashboard/admin
- **Login:** http://localhost:3000/login

## 🚀 Cómo Acceder

1. **Iniciar el servidor de desarrollo:**
   ```bash
   ./scripts/dev-start.sh
   ```

2. **Ir al login:**
   - Visita: http://localhost:3000/login
   - Introduce las credenciales de arriba

3. **Acceder al panel:**
   - Una vez logueado, ve a: http://localhost:3000/dashboard/admin
   - O navega desde el dashboard principal

## 🎯 Funcionalidades que Puedes Probar

### 📤 **Tab "Archivos"**
- Drag & drop de archivos
- Preview de imágenes
- Gestión por carpetas
- Copiar URLs automáticamente

### ✏️ **Tab "Páginas"**
- Editor de contenido Markdown
- 3 páginas predefinidas editables
- Vista previa en tiempo real
- Guardado con confirmación

### 👥 **Tab "Usuarios"**
- Crear nuevos usuarios
- Activar/desactivar usuarios
- Asignar roles y secciones
- Badges de colores por sección

### ⚙️ **Tab "Configuración"**
- Ajustes generales del sitio
- Modo mantenimiento
- Crear backups
- Limpiar caché
- Estadísticas del sistema

## 🎨 Mejoras Visuales Implementadas

- ✅ **Sidebar colapsable** con botón toggle
- ✅ **Navegación limpia** sin elementos mock
- ✅ **Botón logout** con confirmación seguún design system
- ✅ **Totalmente responsivo** para móvil y desktop

## 🔒 Seguridad

- **Protección:** Los usuarios admin no pueden ser eliminados
- **Validaciones:** Emails únicos y campos obligatorios
- **Confirmaciones:** Alertas para acciones destructivas

## ⚠️ Notas Importantes

1. **Cambiar contraseña:** Se recomienda cambiar la contraseña después del primer login
2. **Solo desarrollo:** Estas credenciales son solo para testing local
3. **Backup:** El panel puede crear backups automáticos de prueba

¡Ya puedes probar todas las funcionalidades del panel de administración completo!