# 🔍 Verificación FASE 1 - Sistema de Edición de Contenido

## ✅ Guía de Verificación Completa

### 1️⃣ Verificar Base de Datos PostgreSQL

#### Conectar a PostgreSQL
```bash
# Verificar que el contenedor está corriendo
docker ps --filter name=osyris-db

# Conectar a la base de datos
docker exec -it osyris-db psql -U osyris_user -d osyris_db
```

#### Verificar Tablas Creadas
```sql
-- Listar todas las tablas
\dt

-- Debería mostrar:
-- contenido_editable
-- contenido_historial
-- audit_log
```

#### Verificar Estructura de Tablas
```sql
-- Ver estructura de contenido_editable
\d contenido_editable

-- Ver estructura de contenido_historial
\d contenido_historial

-- Ver estructura de audit_log
\d audit_log
```

#### Verificar Contenido Migrado
```sql
-- Contar elementos por sección
SELECT seccion, COUNT(*) as total
FROM contenido_editable
GROUP BY seccion
ORDER BY seccion;

-- Debería mostrar:
-- castores  | 13
-- manada    | 13
-- pioneros  | 13
-- rutas     | 13
-- tropa     | 13

-- Ver contenido de una sección específica
SELECT identificador, tipo, LEFT(contenido_texto, 50) as preview
FROM contenido_editable
WHERE seccion = 'castores'
ORDER BY identificador;

-- Verificar que hay 65 elementos en total
SELECT COUNT(*) FROM contenido_editable;
```

#### Verificar Vistas Creadas
```sql
-- Ver vista de contenido con editor
SELECT * FROM v_contenido_con_editor LIMIT 5;

-- Salir de psql
\q
```

---

### 2️⃣ Verificar Archivos Backend Creados

```bash
# Desde el directorio raíz del proyecto
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web

# Verificar archivos de base de datos
ls -lh api-osyris/database/schema-content-editor.sql
ls -lh api-osyris/database/add-editor-role.sql

# Verificar scripts
ls -lh api-osyris/scripts/apply-content-editor-schema.sh
ls -lh api-osyris/scripts/create-admin-user.js
ls -lh api-osyris/scripts/migrate-content-to-db.js

# Verificar controlador
ls -lh api-osyris/src/controllers/content.controller.js

# Verificar rutas
ls -lh api-osyris/src/routes/content.routes.js
```

---

### 3️⃣ Verificar Usuario Admin Creado

```bash
# Conectar a PostgreSQL
docker exec -it osyris-db psql -U osyris_user -d osyris_db

# Verificar usuario admin
SELECT id, nombre, apellidos, email, rol, activo
FROM usuarios
WHERE rol = 'admin';

# Debería mostrar:
# id | nombre | apellidos | email             | rol   | activo
# ---|--------|-----------|-------------------|-------|-------
# 3  | Admin  | Osyris    | admin@osyris.com | admin | t
```

**Credenciales de prueba:**
- **Email:** admin@osyris.com
- **Password:** Admin123!
- ⚠️ **Cambiar después del primer login**

---

### 4️⃣ Probar API Endpoints (Backend)

#### Iniciar servidor de desarrollo
```bash
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web
./scripts/dev-start.sh
```

Espera unos 10 segundos a que arranque el servidor.

#### Test 1: Obtener contenido de página (SIN autenticación)
```bash
# Obtener contenido de la sección "castores"
curl -s http://localhost:5000/api/content/page/castores | python3 -m json.tool

# Debería retornar:
# {
#   "success": true,
#   "seccion": "castores",
#   "content": { ... 13 elementos ... },
#   "total": 13
# }
```

#### Test 2: Obtener contenido de TODAS las secciones
```bash
# Castores
curl -s http://localhost:5000/api/content/page/castores | grep -o '"total": [0-9]*'

# Manada
curl -s http://localhost:5000/api/content/page/manada | grep -o '"total": [0-9]*'

# Tropa
curl -s http://localhost:5000/api/content/page/tropa | grep -o '"total": [0-9]*'

# Pioneros
curl -s http://localhost:5000/api/content/page/pioneros | grep -o '"total": [0-9]*'

# Rutas
curl -s http://localhost:5000/api/content/page/rutas | grep -o '"total": [0-9]*'

# Todos deberían retornar: "total": 13
```

#### Test 3: Login con usuario admin
```bash
# Hacer login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@osyris.com",
    "password": "Admin123!"
  }' | python3 -m json.tool

# Guardar el token JWT que te devuelve
# Copiar el valor de "token" para usarlo en las siguientes peticiones
```

#### Test 4: Actualizar contenido (CON autenticación)
```bash
# Reemplaza <TOKEN> con el token JWT del paso anterior
TOKEN="eyJhbGc..." # Tu token aquí

# Actualizar un contenido específico (por ejemplo, el héroe de castores)
curl -X PUT http://localhost:5000/api/content/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipo": "texto",
    "contenido": "Colonia La Veleta - EDITADO",
    "metadata": {}
  }' | python3 -m json.tool

# Debería retornar:
# {
#   "success": true,
#   "message": "Contenido actualizado correctamente",
#   "newVersion": 2
# }
```

#### Test 5: Verificar historial de versiones
```bash
# Ver historial del contenido que acabamos de editar
curl -s "http://localhost:5000/api/content/history/1" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Debería mostrar el historial con la versión anterior
```

---

### 5️⃣ Verificar Triggers y Funcionalidad Automática

```bash
# Conectar a PostgreSQL
docker exec -it osyris-db psql -U osyris_user -d osyris_db
```

```sql
-- Ver que la versión se incrementó automáticamente
SELECT id, identificador, version
FROM contenido_editable
WHERE id = 1;
-- Debería mostrar version = 2

-- Ver que se creó un snapshot en el historial
SELECT id, contenido_id, version, accion, fecha_cambio
FROM contenido_historial
WHERE contenido_id = 1
ORDER BY fecha_cambio DESC;

-- Ver que se registró en el audit log
SELECT accion, entidad_tipo, entidad_id, timestamp
FROM audit_log
WHERE entidad_id = 1
ORDER BY timestamp DESC;
```

---

### 6️⃣ Verificar Cambios en Git

```bash
# Ver el commit de FASE 1
git log --oneline -1

# Debería mostrar:
# 85086d9 feat: FASE 1 - Implementar sistema de edición de contenido en vivo

# Ver diferencias con main
git diff main --stat

# Ver archivos en la nueva branch
git branch
# Debería mostrar: * feature/live-content-editor
```

---

### 7️⃣ Revisar Código Implementado

#### Controlador de Content (Backend)
```bash
# Ver el controlador completo
cat api-osyris/src/controllers/content.controller.js | head -100
```

**Funciones implementadas:**
- `getPageContent` - Obtener todo el contenido de una página
- `getContentById` - Obtener contenido específico
- `updateContent` - Actualizar contenido
- `createContent` - Crear nuevo contenido
- `uploadImage` - Subir imágenes
- `getContentHistory` - Historial de versiones
- `restoreVersion` - Restaurar versión anterior
- `deleteContent` - Eliminar contenido

#### Rutas de la API
```bash
# Ver las rutas definidas
cat api-osyris/src/routes/content.routes.js
```

---

### 8️⃣ Verificar Integración en el Servidor

```bash
# Ver que las rutas están registradas en index.js
grep -A 2 "content" api-osyris/src/index.js

# Debería mostrar:
# const contentRoutes = require('./routes/content.routes');
# ...
# app.use('/api/content', contentRoutes);
```

---

## 📊 Checklist de Verificación

Marca cada elemento cuando lo hayas verificado:

### Base de Datos
- [ ] Contenedor PostgreSQL corriendo
- [ ] Tabla `contenido_editable` existe
- [ ] Tabla `contenido_historial` existe
- [ ] Tabla `audit_log` existe
- [ ] 65 elementos migrados (13 por sección × 5 secciones)
- [ ] Triggers funcionando correctamente
- [ ] Vistas creadas

### Backend
- [ ] Archivos de schema creados
- [ ] Scripts de migración creados
- [ ] Controlador `content.controller.js` implementado
- [ ] Rutas `content.routes.js` implementadas
- [ ] Rutas registradas en `src/index.js`

### Usuario y Roles
- [ ] Usuario admin creado (admin@osyris.com)
- [ ] Rol 'editor' añadido al sistema
- [ ] Middleware de autenticación funciona

### API Endpoints
- [ ] GET `/api/content/page/:seccion` funciona
- [ ] PUT `/api/content/:id` requiere autenticación
- [ ] Login devuelve token JWT válido
- [ ] Actualización de contenido funciona
- [ ] Historial de versiones funciona

### Git
- [ ] Branch `feature/live-content-editor` creada
- [ ] Commit de FASE 1 realizado
- [ ] Main está seguro y funcionando

---

## 🚀 Siguiente Paso

Una vez verificado todo, puedes proceder a la **FASE 2** que incluye:
- EditModeContext (React Context para modo edición)
- Componentes EditableText y EditableImage
- EditToolbar flotante
- Refactorización de páginas para usar contenido dinámico

---

## ⚠️ Notas Importantes

1. **No deployar a producción aún** - Esto es una feature branch en desarrollo
2. **Main está seguro** - Los cambios están solo en `feature/live-content-editor`
3. **El contenido hardcoded sigue existiendo** - Como fallback de seguridad
4. **El servidor de desarrollo debe estar corriendo** - Para probar los endpoints

---

## 🐛 Solución de Problemas

### El servidor no arranca
```bash
# Matar todos los procesos
./scripts/kill-services.sh

# Reiniciar
./scripts/dev-start.sh
```

### Error de conexión a PostgreSQL
```bash
# Verificar que el contenedor está corriendo
docker ps --filter name=osyris-db

# Si no está corriendo, iniciarlo
docker start osyris-db
```

### Error de autenticación en API
- Verifica que estás usando el token JWT correcto
- El token expira después de 24 horas
- Haz login de nuevo si el token expiró

---

**¿Preguntas?** Revisa este documento paso a paso y comprueba cada sección.
