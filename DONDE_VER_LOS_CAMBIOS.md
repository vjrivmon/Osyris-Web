# 🎯 DÓNDE VER LOS CAMBIOS - Guía Actualizada (Oct 2025)

## 🔧 CAMBIOS IMPLEMENTADOS

Se ha **refactorizado completamente** el sistema de autenticación para resolver el problema de que no aparecía el botón "Editar Página".

### ✅ Soluciones Aplicadas

1. **Ruta de verificación creada:** `app/api/auth/verify/route.ts`
   - Proxy al backend para verificar tokens JWT
   - Retorna información del usuario autenticado

2. **useEffect corregido:** `contexts/EditModeContext.tsx`
   - El parámetro `?editMode=true` ahora funciona correctamente
   - Se puede salir del modo edición y volver a entrar

3. **Componentes editables integrados:** `app/page.tsx`
   - La landing page ya usa `EditableText` y `EditableImage`
   - Listo para edición en vivo

4. **Backend verificado:**
   - Endpoints `/api/content/*` funcionando
   - Middleware de autenticación correcto
   - Rol `admin` y `editor` soportados

---

## ✅ CÓMO PROBAR EL SISTEMA AHORA

### Paso 1: Preparar Base de Datos

```bash
# Aplicar schema de contenido editable
docker exec -i osyris-postgres psql -U osyris_user -d osyris_db < api-osyris/database/schema-content-editor.sql

# Insertar datos de prueba para la landing
docker exec -i osyris-postgres psql -U osyris_user -d osyris_db < api-osyris/database/seed-landing-content.sql
```

### Paso 2: Crear Usuario Admin (si no existe)

```bash
# Verificar usuario admin
docker exec -it osyris-postgres psql -U osyris_user -d osyris_db

# En psql:
SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'admin';

# Si no existe, crear uno:
# 1. Generar hash de contraseña
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"

# 2. Insertar usuario (reemplaza $2a$... con el hash generado)
INSERT INTO usuarios (nombre, apellidos, email, password, rol, activo)
VALUES ('Admin', 'Test', 'admin@osyris.com', '$2a$10$...tu-hash-aqui...', 'admin', true);
```

### Paso 3: Hacer Login
```
URL: http://localhost:3000/login
Email: admin@osyris.com  (o el que hayas creado)
Password: admin123
```

### Paso 4: Activar Modo Edición

**Opción A: URL con parámetro (RECOMENDADO)**
```
http://localhost:3000/?editMode=true
```

**Opción B: Botón en esquina superior derecha**
1. Ve a: http://localhost:3000
2. Busca el botón "Editar Página" (✏️) en la esquina superior derecha
3. Haz click en él

### Paso 5: Verificar UI de Edición

Deberías ver:
- ✅ **Toggle en esquina superior derecha:** "Salir Edición"
- ✅ **Toolbar flotante:** Con "Guardar", "Descartar", contador de cambios
- ✅ **Bordes editables:** Elementos con borde punteado (EditableText/EditableImage)

### Paso 6: Editar Contenido

1. **Haz click en el título:** "Grupo Scout Osyris"
2. **Edita el texto**
3. **Haz click fuera** para confirmar
4. **Verifica contador:** Debe decir "1 cambio pendiente"
5. **Haz click en "Guardar Cambios"**
6. **Recarga la página:** Verifica que el cambio persiste

---

## 🔍 URLs CORRECTAS vs INCORRECTAS

| ❌ NO aparecerá el botón | ✅ SÍ aparecerá el botón |
|--------------------------|--------------------------|
| http://localhost:3000/dashboard | http://localhost:3000 |
| http://localhost:3000/admin | http://localhost:3000/?editMode=true |
| http://localhost:3000/aula-virtual | http://localhost:3000/secciones/castores |
|  | http://localhost:3000/contacto |

---

## 🐛 Troubleshooting

### El botón "Editar Página" no aparece

**Solución 1: Verificar autenticación**
```javascript
// Abrir DevTools (F12) → Console
document.cookie  // Debe contener 'auth_token'
```

**Solución 2: Verificar endpoint de verificación**
```bash
# Ver logs del frontend
# Busca si hay errores en la llamada a /api/auth/verify
```

**Solución 3: Verificar rol de usuario**
```sql
-- En PostgreSQL
docker exec -it osyris-postgres psql -U osyris_user -d osyris_db

SELECT nombre, email, rol FROM usuarios WHERE email = 'admin@osyris.com';
-- El rol DEBE ser 'admin' o 'editor'
```

### Error 404 al guardar cambios

**Verificar backend:**
```bash
curl http://localhost:5000/api/content/1

# Debería retornar JSON con contenido, no 404
```

### Los cambios no persisten

**Verificar en base de datos:**
```sql
SELECT id, identificador, contenido_texto, version
FROM contenido_editable
WHERE seccion = 'landing'
ORDER BY id;
```

---

## 📚 Documentación Adicional

- **Guía de Prueba Completa:** [GUIA_PRUEBA_EDICION.md](GUIA_PRUEBA_EDICION.md)
- **Diagnóstico Completo:** [DIAGNOSTICO_EDICION.md](DIAGNOSTICO_EDICION.md)
- **Cambios Implementados:** [RESUMEN_CAMBIOS_EDICION.md](RESUMEN_CAMBIOS_EDICION.md)

---

## 🚨 RESUMEN RÁPIDO

1. **Login:** http://localhost:3000/login (admin@osyris.com / admin123)
2. **Activar edición:** http://localhost:3000/?editMode=true
3. **Editar contenido:** Click en texto → Editar → Guardar
4. **Verificar persistencia:** Recargar página

**Si algo falla, consulta:** [GUIA_PRUEBA_EDICION.md](GUIA_PRUEBA_EDICION.md)

---

**Última actualización:** 4 de octubre de 2025
**Versión:** 2.0 (Sistema refactorizado)
