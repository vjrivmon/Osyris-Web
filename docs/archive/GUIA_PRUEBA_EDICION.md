# 🧪 Guía de Prueba - Sistema de Edición en Vivo

## 📋 Requisitos Previos

1. **PostgreSQL en Docker corriendo** (puerto 5432)
2. **Backend iniciado** (puerto 5000)
3. **Frontend iniciado** (puerto 3000)
4. **Usuario admin creado** en la base de datos

---

## 🚀 Paso 1: Iniciar Servicios

```bash
# En la raíz del proyecto
./scripts/dev-start.sh
```

Este script:
- ✅ Mata procesos previos en puertos 3000 y 5000
- ✅ Inicia PostgreSQL en Docker
- ✅ Inicia backend (puerto 5000)
- ✅ Inicia frontend (puerto 3000)

---

## 🗄️ Paso 2: Preparar Base de Datos

### 2.1. Verificar que la tabla existe

```bash
docker exec -it osyris-postgres psql -U osyris_user -d osyris_db
```

```sql
-- Verificar que exista la tabla
\dt contenido_editable

-- Ver estructura
\d contenido_editable

-- Salir
\q
```

### 2.2. Ejecutar schema si no existe

```bash
docker exec -i osyris-postgres psql -U osyris_user -d osyris_db < api-osyris/database/schema-content-editor.sql
```

### 2.3. Insertar datos de prueba

```bash
docker exec -i osyris-postgres psql -U osyris_user -d osyris_db < api-osyris/database/seed-landing-content.sql
```

### 2.4. Verificar datos insertados

```bash
docker exec -it osyris-postgres psql -U osyris_user -d osyris_db
```

```sql
SELECT id, seccion, identificador, tipo,
       SUBSTRING(contenido_texto, 1, 50) as contenido
FROM contenido_editable
WHERE seccion = 'landing'
ORDER BY id;
```

---

## 👤 Paso 3: Crear/Verificar Usuario Admin

### 3.1. Verificar si existe usuario admin

```sql
SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'admin';
```

### 3.2. Si no existe, crear usuario admin

```sql
-- Crear usuario admin de prueba
INSERT INTO usuarios (
  nombre, apellidos, email, password, rol, activo
) VALUES (
  'Admin', 'Test', 'admin@osyris.com',
  -- Password hash para 'admin123' (bcrypt)
  '$2a$10$YourHashedPasswordHere',
  'admin', true
);
```

**NOTA:** Debes generar el hash de la contraseña. Puedes usar:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

O crear el usuario a través del endpoint de registro:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@osyris.com",
    "password": "admin123",
    "nombre": "Admin",
    "apellidos": "Test",
    "rol": "admin"
  }'
```

---

## 🔐 Paso 4: Login como Admin

1. **Abrir navegador:** http://localhost:3000

2. **Ir a login:** http://localhost:3000/login

3. **Iniciar sesión:**
   - Email: `admin@osyris.com`
   - Password: `admin123` (o la que hayas configurado)

4. **Verificar autenticación:**
   - Deberías ver tu nombre en la esquina superior derecha
   - El sistema debería redirigirte al dashboard de admin

---

## ✏️ Paso 5: Probar Edición en Vivo

### 5.1. Activar modo edición desde admin

**Opción A: Botón directo**
1. En el dashboard de admin, ve a "Editar Contenido" o "Editor CMS"
2. Busca el botón "Editar Página en Vivo"
3. Haz click en "Ir a la landing page"

**Opción B: URL directa**
1. Navega a: http://localhost:3000/?editMode=true
2. El modo edición se activará automáticamente

### 5.2. Verificar que aparece la UI de edición

Deberías ver:
- ✅ **Toggle en esquina superior derecha:** Botón "Editar Página" / "Salir Edición"
- ✅ **Toolbar flotante:** Con botones "Guardar", "Descartar", contador de cambios
- ✅ **Bordes editables:** Los elementos con `EditableText`/`EditableImage` deben tener borde punteado

### 5.3. Editar texto

1. **Busca el título principal:** "Grupo Scout Osyris"
2. **Haz click sobre él**
3. **Edita el texto** (por ejemplo: "Bienvenido al Grupo Scout Osyris")
4. **Haz click fuera** para confirmar

Deberías ver:
- ✅ El texto cambia en tiempo real
- ✅ Aparece icono de "pendiente" (reloj o check amarillo)
- ✅ El contador en la toolbar aumenta (ej: "1 cambio pendiente")

### 5.4. Editar más elementos

Prueba editar:
- Subtítulo del hero
- Títulos de las features
- Descripciones de las features

### 5.5. Guardar cambios

1. **Haz click en "Guardar Cambios"** en la toolbar
2. **Espera la confirmación** (debería aparecer mensaje de éxito)
3. **Verifica el estado:**
   - El contador debe volver a 0
   - Los iconos de "pendiente" desaparecen
   - Los bordes vuelven a normal

### 5.6. Verificar persistencia

1. **Recarga la página:** F5 o Ctrl+R
2. **Verifica que los cambios persisten:**
   - El título sigue siendo el nuevo texto
   - Todos los cambios guardados deben estar visibles

### 5.7. Desactivar modo edición

1. **Haz click en el toggle** "Salir Edición"
2. **Verifica:**
   - La toolbar desaparece
   - Los bordes editables desaparecen
   - El contenido sigue siendo el nuevo texto editado

---

## 🖼️ Paso 6: Probar Edición de Imágenes

### 6.1. Activar modo edición

http://localhost:3000/?editMode=true

### 6.2. Buscar imagen editable

Baja hasta la sección **"¿Quieres formar parte de nuestra familia scout?"**

Deberías ver una imagen placeholder con borde punteado.

### 6.3. Subir nueva imagen

1. **Haz click sobre la imagen**
2. **Haz click en el botón "Cambiar Imagen"** (icono de upload)
3. **Selecciona una imagen** de tu ordenador (JPG, PNG, WebP)
4. **Espera a que se suba**

Deberías ver:
- ✅ Preview de la nueva imagen inmediatamente
- ✅ Icono de "pendiente" en la imagen
- ✅ Contador de cambios aumenta

### 6.4. Guardar cambio de imagen

1. **Click en "Guardar Cambios"**
2. **Verificar que se guardó:**
   - Recarga la página
   - La nueva imagen debe seguir visible

---

## 🧹 Paso 7: Descartar Cambios

### 7.1. Hacer cambios sin guardar

1. Edita varios textos
2. Cambia una imagen
3. **NO guardes**

### 7.2. Descartar

1. **Haz click en "Descartar Cambios"** en la toolbar
2. **Confirma el diálogo**

Deberías ver:
- ✅ Todo vuelve al estado anterior
- ✅ Contador vuelve a 0
- ✅ Los textos e imágenes vuelven a los valores guardados

---

## 🐛 Troubleshooting

### No aparece el botón "Editar Página"

**Causa:** `useAuth` no está detectando al usuario como admin.

**Solución:**
1. Verifica en DevTools → Application → Cookies que existe `auth_token`
2. Prueba llamar a: http://localhost:5000/api/auth/verify con el token
3. Verifica que el rol del usuario sea `'admin'` exactamente

```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@osyris.com';
```

### Error 404 al guardar cambios

**Causa:** El endpoint `/api/content/:id` no existe o no está corriendo.

**Solución:**
```bash
# Verificar que el backend está corriendo
curl http://localhost:5000/api/content/1

# Reiniciar backend
pkill -f nodemon
npm run dev:backend
```

### Error 401 Unauthorized al guardar

**Causa:** El token no se está enviando correctamente.

**Solución:**
1. Verifica que `useAuth` retorna un `token` válido
2. Verifica en DevTools → Network → Headers que se envía `Authorization: Bearer <token>`
3. Prueba cerrar sesión y volver a iniciar

### Los cambios no persisten al recargar

**Causa:** Los cambios no se están guardando en la base de datos.

**Solución:**
```bash
# Verificar logs del backend
docker logs osyris-backend

# Verificar que se guardó en BD
docker exec -it osyris-postgres psql -U osyris_user -d osyris_db
SELECT * FROM contenido_editable WHERE id = 1;
```

### La imagen no se sube

**Causa:** Falta el endpoint de upload o permisos de escritura.

**Solución:**
```bash
# Verificar endpoint de upload
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer <tu-token>" \
  -F "image=@test.jpg"

# Verificar permisos del directorio uploads
chmod -R 777 uploads/
```

---

## ✅ Checklist de Funcionalidad Completa

- [ ] Login como admin funciona
- [ ] Aparece el botón "Editar Página"
- [ ] El modo edición se activa con `?editMode=true`
- [ ] Aparece la toolbar con "Guardar", "Descartar", contador
- [ ] Los elementos editables tienen borde punteado
- [ ] Click en texto permite editarlo
- [ ] El texto cambia en tiempo real
- [ ] El contador de cambios aumenta correctamente
- [ ] El botón "Guardar" persiste los cambios
- [ ] Recargar la página muestra los cambios guardados
- [ ] El botón "Descartar" revierte los cambios
- [ ] El toggle "Salir Edición" desactiva el modo
- [ ] Las imágenes se pueden cambiar
- [ ] Las imágenes se suben correctamente
- [ ] Los cambios se persisten en la base de datos

---

## 📊 Verificación en Base de Datos

```sql
-- Ver todos los contenidos de la landing
SELECT
  id,
  identificador,
  tipo,
  CASE
    WHEN tipo = 'texto' THEN SUBSTRING(contenido_texto, 1, 50)
    WHEN tipo = 'imagen' THEN url_archivo
  END as contenido,
  version,
  TO_CHAR(fecha_modificacion, 'YYYY-MM-DD HH24:MI') as ultima_modificacion,
  modificado_por
FROM contenido_editable
WHERE seccion = 'landing'
ORDER BY id;

-- Ver historial de cambios
SELECT
  h.version,
  h.accion,
  u.nombre as usuario,
  TO_CHAR(h.fecha_cambio, 'YYYY-MM-DD HH24:MI') as fecha
FROM contenido_historial h
LEFT JOIN usuarios u ON h.usuario_id = u.id
WHERE h.contenido_id = 1  -- Cambiar por el ID que quieras ver
ORDER BY h.version DESC
LIMIT 10;
```

---

## 🎉 Conclusión

Si todos los puntos del checklist están marcados, ¡el sistema de edición en vivo está funcionando correctamente!

Ahora puedes:
1. Extender el sistema a otras páginas (contacto, sobre-nosotros, etc.)
2. Añadir más tipos de contenido editable
3. Implementar más funcionalidades (preview, rollback, aprobación, etc.)

---

**Última actualización:** 4 de octubre de 2025
