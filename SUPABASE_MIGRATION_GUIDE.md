# 🚀 Guía de Migración a Supabase - Sistema Osyris

## 📋 Estado Actual del Proyecto

### ✅ Configuración Actual
- **Base de datos:** SQLite local (`/api-osyris/database/osyris.db`)
- **Almacenamiento de archivos:** Sistema de archivos local (`/uploads/`)
- **Autenticación:** JWT con bcryptjs (local)
- **Backend:** Express.js en puerto 5000
- **Frontend:** Next.js 15 con TypeScript

### ⚠️ Estado de Supabase
- **Archivos de configuración:** ✅ Existen pero NO están activos
- **Controladores Supabase:** ✅ Creados pero NO se usan
- **Migración:** ❌ El proyecto NO está usando Supabase actualmente

## 🔴 Cambios Críticos Necesarios

### 1. Variables de Entorno (`.env` y `.env.local`)

#### Backend `.env`:
```env
# AÑADIR para Supabase
SUPABASE_URL=tu_supabase_url_aqui
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
STORAGE_TYPE=supabase  # Cambiar de 'local' a 'supabase'
DATABASE_TYPE=supabase  # Cambiar de 'sqlite' a 'supabase'
```

#### Frontend `.env.local`:
```env
# AÑADIR para Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 2. Archivo Principal del Backend (`/api-osyris/src/index.js`)

**Línea 9 - CAMBIAR:**
```javascript
// ACTUAL (SQLite)
const db = require('./config/db.config');

// CAMBIAR A (Supabase)
const db = process.env.DATABASE_TYPE === 'supabase'
  ? require('./config/supabase.config')
  : require('./config/db.config');
```

**Líneas 115-132 - MODIFICAR inicialización:**
```javascript
const startServer = async () => {
  try {
    if (process.env.DATABASE_TYPE === 'supabase') {
      console.log('✅ Conectando a Supabase...');
      // Supabase se conecta automáticamente
      console.log('✅ Supabase conectado correctamente');
    } else {
      // SQLite local
      await db.initializeDatabase();
      console.log('✅ SQLite local conectado correctamente');
    }

    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}`);
        console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
      });
    }
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error);
  }
};
```

### 3. Sistema de Upload (`/api-osyris/src/routes/upload.routes.js`)

**CAMBIAR importación del controlador:**
```javascript
// ACTUAL
const uploadController = require('../controllers/upload.local.controller');

// CAMBIAR A
const uploadController = process.env.STORAGE_TYPE === 'supabase'
  ? require('../controllers/upload.supabase.controller')
  : require('../controllers/upload.local.controller');
```

### 4. Controladores de Base de Datos

**Todos los archivos en `/api-osyris/src/controllers/` necesitan:**

```javascript
// En cada controlador, cambiar:
const db = require('../config/db.config');

// A:
const db = process.env.DATABASE_TYPE === 'supabase'
  ? require('../config/supabase.config')
  : require('../config/db.config');
```

**Archivos a modificar:**
- `auth.controller.js`
- `usuario.controller.js`
- `paginas.controller.js`
- `actividades.controller.js`
- `documentos.controller.js`
- `mensajes.controller.js`
- `secciones.controller.js`

### 5. Configuración de Supabase (`/api-osyris/src/config/supabase.config.js`)

**VERIFICAR y actualizar:**
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = {
  query: async (sql, params = []) => {
    // Convertir SQL de SQLite a PostgreSQL
    // Implementar lógica de conversión
  },
  // ... resto del código
};
```

### 6. Frontend - Configuración de Supabase

**Crear archivo `/lib/supabase-client.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 7. Actualizar Componentes del Admin

**En todos los componentes de `/app/admin/`:**
```typescript
// Añadir detección de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? true : false;

// Para uploads, cambiar URLs
const uploadUrl = isSupabase
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/`
  : `${API_URL}/uploads/`;
```

### 8. Configuración de Vercel (`vercel.json`)

**Actualizar para producción:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "DATABASE_TYPE": "supabase",
    "STORAGE_TYPE": "supabase"
  }
}
```

## 🗄️ Migración de Base de Datos

### Esquema de Tablas en Supabase

Ejecutar en el SQL Editor de Supabase:

```sql
-- Tabla usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  contraseña VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  seccion_id INTEGER,
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP,
  foto_perfil TEXT,
  fecha_nacimiento DATE,
  direccion TEXT,
  dni VARCHAR(20)
);

-- Tabla secciones
CREATE TABLE secciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  edad_minima INTEGER,
  edad_maxima INTEGER,
  color_principal VARCHAR(7),
  color_secundario VARCHAR(7),
  logo_url TEXT,
  activa BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0
);

-- Tabla paginas
CREATE TABLE paginas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  contenido TEXT,
  seccion VARCHAR(100),
  categoria VARCHAR(100),
  imagen_principal TEXT,
  imagenes_galeria TEXT,
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  meta_descripcion TEXT,
  actualizado_por INTEGER,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla documentos
CREATE TABLE documentos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  archivo_nombre VARCHAR(255),
  archivo_ruta TEXT,
  tipo_archivo VARCHAR(100),
  tamaño_archivo BIGINT,
  categoria VARCHAR(100),
  visible_para VARCHAR(50),
  subido_por INTEGER,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descargas INTEGER DEFAULT 0,
  version VARCHAR(20)
);

-- Tabla actividades
CREATE TABLE actividades (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  lugar VARCHAR(255),
  tipo VARCHAR(100),
  seccion_id INTEGER,
  responsable_id INTEGER,
  cupo_maximo INTEGER,
  precio DECIMAL(10,2),
  inscripcion_abierta BOOLEAN DEFAULT false,
  material_necesario TEXT,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por INTEGER,
  estado VARCHAR(50) DEFAULT 'planificada'
);

-- Tabla mensajes
CREATE TABLE mensajes (
  id SERIAL PRIMARY KEY,
  asunto VARCHAR(255),
  contenido TEXT NOT NULL,
  remitente_id INTEGER NOT NULL,
  tipo_destinatario VARCHAR(50),
  destinatario_id INTEGER,
  seccion_id INTEGER,
  leido BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP,
  prioridad VARCHAR(20) DEFAULT 'normal',
  archivo_adjunto TEXT
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_paginas_slug ON paginas(slug);
CREATE INDEX idx_paginas_visible ON paginas(visible);
CREATE INDEX idx_actividades_fecha ON actividades(fecha_inicio);
CREATE INDEX idx_mensajes_destinatario ON mensajes(destinatario_id);
```

### Migración de Datos

```bash
# 1. Exportar datos de SQLite
sqlite3 api-osyris/database/osyris.db .dump > backup_osyris.sql

# 2. Convertir formato SQLite a PostgreSQL
# Usar herramienta: https://github.com/caiiiycuk/sqlite-to-postgres

# 3. Importar en Supabase
psql -h [tu-db-url].supabase.co -p 5432 -U postgres -d postgres < converted_backup.sql
```

## 📁 Migración de Archivos

### Configurar Bucket en Supabase Storage

1. Ir a Storage en el panel de Supabase
2. Crear bucket `uploads` (público)
3. Configurar políticas:

```sql
-- Política de lectura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- Política de escritura autenticada
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);
```

### Script de Migración de Archivos

Crear `/scripts/migrate-files-to-supabase.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateFiles() {
  const uploadsDir = path.join(__dirname, '../uploads');
  const folders = fs.readdirSync(uploadsDir);

  for (const folder of folders) {
    const folderPath = path.join(uploadsDir, folder);
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileBuffer = fs.readFileSync(filePath);

      const { error } = await supabase.storage
        .from('uploads')
        .upload(`${folder}/${file}`, fileBuffer);

      if (error) {
        console.error(`Error uploading ${file}:`, error);
      } else {
        console.log(`✅ Uploaded ${folder}/${file}`);
      }
    }
  }
}

migrateFiles();
```

## 🚨 Problemas Potenciales y Soluciones

### 1. Diferencias SQL
- **Problema:** SQLite usa `INTEGER PRIMARY KEY AUTOINCREMENT`, PostgreSQL usa `SERIAL`
- **Solución:** Usar ORM como Prisma o adaptar queries manualmente

### 2. Autenticación
- **Problema:** Sistema actual usa JWT local
- **Solución:** Mantener JWT o migrar a Supabase Auth

### 3. CORS en Producción
- **Problema:** CORS entre Vercel y Supabase
- **Solución:** Configurar headers correctos en `next.config.mjs`

### 4. Tamaño de Archivos
- **Problema:** Límite de 50MB en Supabase Free tier
- **Solución:** Comprimir imágenes o upgrade de plan

## 📊 Checklist de Migración

### Pre-Migración
- [ ] Backup completo de SQLite
- [ ] Backup de todos los archivos en `/uploads`
- [ ] Crear proyecto en Supabase
- [ ] Obtener credenciales de Supabase
- [ ] Testear en entorno de staging

### Durante la Migración
- [ ] Actualizar variables de entorno
- [ ] Modificar archivos de configuración
- [ ] Migrar esquema de base de datos
- [ ] Migrar datos existentes
- [ ] Migrar archivos a Storage
- [ ] Actualizar controladores
- [ ] Actualizar frontend

### Post-Migración
- [ ] Verificar todas las APIs
- [ ] Probar upload de archivos
- [ ] Verificar autenticación
- [ ] Probar todas las páginas del admin
- [ ] Monitorear logs de errores
- [ ] Configurar backups automáticos

## 🔄 Rollback Plan

Si algo falla, volver a SQLite:

1. Cambiar `DATABASE_TYPE=sqlite` en `.env`
2. Cambiar `STORAGE_TYPE=local` en `.env`
3. Reiniciar servicios
4. Verificar que todo funcione con SQLite

## 📝 Comandos Útiles

```bash
# Verificar conexión a Supabase
node -e "require('./api-osyris/src/config/supabase.config')"

# Test de upload a Supabase
curl -X POST http://localhost:5000/api/uploads/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test.jpg" \
  -F "folder=test"

# Verificar migración de datos
psql -h [tu-db].supabase.co -p 5432 -U postgres -d postgres \
  -c "SELECT COUNT(*) FROM usuarios;"
```

## 🎯 Resumen Ejecutivo

### ⚡ Acciones Inmediatas Necesarias:

1. **Crear proyecto en Supabase** y obtener credenciales
2. **Actualizar variables de entorno** con credenciales de Supabase
3. **Modificar 8 archivos críticos** listados arriba
4. **Migrar esquema de BD** a PostgreSQL
5. **Migrar datos** de SQLite a Supabase
6. **Migrar archivos** a Supabase Storage
7. **Deploy a Vercel** con nuevas variables

### ⏱️ Tiempo Estimado:
- Configuración: 2 horas
- Migración de datos: 1 hora
- Migración de archivos: 30 minutos
- Testing: 2 horas
- **Total: ~6 horas**

### 🎨 Nivel de Complejidad: **MEDIO-ALTO**

El proyecto tiene la infraestructura preparada para Supabase pero necesita activación y migración cuidadosa de datos y archivos.

---

**Generado el:** 2025-09-29
**Por:** Claude Code Assistant
**Versión del Proyecto:** 1.0.0