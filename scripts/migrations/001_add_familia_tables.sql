-- ========================================
-- MIGRACIÓN 001: Tablas del Sistema de Familias
-- Fecha: 2025-10-25
-- Descripción: Crea las tablas necesarias para el sistema de familias y educandos
-- ========================================

-- Este script es seguro porque:
-- 1. Usa CREATE TABLE IF NOT EXISTS (no sobrescribe)
-- 2. No modifica datos existentes
-- 3. Añade índices para rendimiento
-- 4. Incluye constraints para integridad de datos

BEGIN;

-- ========================================
-- TABLA: educandos (scouts/niños del grupo)
-- ========================================
CREATE TABLE IF NOT EXISTS educandos (
  id SERIAL PRIMARY KEY,

  -- Datos básicos
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  fecha_nacimiento DATE NOT NULL,

  -- Identificación
  dni VARCHAR(20) UNIQUE,
  pasaporte VARCHAR(50),

  -- Contacto
  direccion TEXT,
  codigo_postal VARCHAR(10),
  municipio VARCHAR(100),
  telefono_casa VARCHAR(20),
  telefono_movil VARCHAR(20),
  email VARCHAR(100),

  -- Salud
  alergias TEXT,
  notas_medicas TEXT,

  -- Scout
  seccion_id INTEGER NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
  foto_perfil TEXT,
  activo BOOLEAN DEFAULT true,

  -- Notas generales
  notas TEXT,

  -- IDs externos (migración desde sistema anterior)
  id_externo INTEGER UNIQUE, -- ID del sistema anterior MEV

  -- Control
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_baja TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ========================================
-- TABLA: familiares_educandos (relación N:M)
-- ========================================
CREATE TABLE IF NOT EXISTS familiares_educandos (
  id SERIAL PRIMARY KEY,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  relacion VARCHAR(50) CHECK (relacion IN ('padre', 'madre', 'tutor_legal', 'abuelo', 'otro')),
  es_contacto_principal BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(familiar_id, educando_id)
);

-- ========================================
-- TABLA: documentos_familia
-- ========================================
CREATE TABLE IF NOT EXISTS documentos_familia (
  id SERIAL PRIMARY KEY,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  archivo_nombre VARCHAR(255),
  archivo_ruta TEXT,
  tipo_archivo VARCHAR(100),
  tamaño_archivo BIGINT,
  fecha_vencimiento DATE,
  estado VARCHAR(50) DEFAULT 'vigente' CHECK (estado IN ('vigente', 'por_vencer', 'vencido', 'pendiente')),
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aprobado BOOLEAN DEFAULT false,
  aprobado_por INTEGER REFERENCES usuarios(id)
);

-- ========================================
-- TABLA: notificaciones_familia
-- ========================================
CREATE TABLE IF NOT EXISTS notificaciones_familia (
  id SERIAL PRIMARY KEY,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('urgente', 'importante', 'informativo', 'recordatorio')),
  prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('alta', 'normal', 'baja')),
  categoria VARCHAR(100),
  leida BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP,
  requiere_confirmacion BOOLEAN DEFAULT false,
  confirmada BOOLEAN DEFAULT false,
  fecha_confirmacion TIMESTAMP
);

-- ========================================
-- TABLA: galeria_fotos_privada
-- ========================================
CREATE TABLE IF NOT EXISTS galeria_fotos_privada (
  id SERIAL PRIMARY KEY,
  album_id INTEGER NOT NULL,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  descripcion TEXT,
  archivo_nombre VARCHAR(255) NOT NULL,
  archivo_ruta TEXT NOT NULL,
  miniatura_ruta TEXT,
  tipo_archivo VARCHAR(50),
  tamaño_archivo BIGINT,
  fecha_actividad DATE,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0
);

-- ========================================
-- TABLA: confirmaciones_asistencia
-- ========================================
CREATE TABLE IF NOT EXISTS confirmaciones_asistencia (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  confirmado BOOLEAN DEFAULT false,
  asistira BOOLEAN,
  fecha_confirmacion TIMESTAMP,
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: documentos (si no existe)
-- ========================================
CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  archivo_nombre VARCHAR(255),
  archivo_ruta TEXT,
  tipo_archivo VARCHAR(100),
  tamaño_archivo BIGINT,
  categoria VARCHAR(100),
  visible_para VARCHAR(50) DEFAULT 'todos',
  subido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descargas INTEGER DEFAULT 0,
  version VARCHAR(20)
);

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

-- Educandos
CREATE INDEX IF NOT EXISTS idx_educandos_seccion ON educandos(seccion_id);
CREATE INDEX IF NOT EXISTS idx_educandos_activo ON educandos(activo);
CREATE INDEX IF NOT EXISTS idx_educandos_dni ON educandos(dni) WHERE dni IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_educandos_fecha_nacimiento ON educandos(fecha_nacimiento);

-- Familiares-Educandos
CREATE INDEX IF NOT EXISTS idx_familiares_educandos_familiar ON familiares_educandos(familiar_id);
CREATE INDEX IF NOT EXISTS idx_familiares_educandos_educando ON familiares_educandos(educando_id);
CREATE INDEX IF NOT EXISTS idx_familiares_educandos_principal ON familiares_educandos(es_contacto_principal) WHERE es_contacto_principal = true;

-- Documentos Familia
CREATE INDEX IF NOT EXISTS idx_documentos_familia_educando ON documentos_familia(educando_id);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_familiar ON documentos_familia(familiar_id);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_estado ON documentos_familia(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_aprobado ON documentos_familia(aprobado);

-- Notificaciones Familia
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_familiar ON notificaciones_familia(familiar_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_educando ON notificaciones_familia(educando_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_leida ON notificaciones_familia(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_tipo ON notificaciones_familia(tipo);

-- Galería Privada
CREATE INDEX IF NOT EXISTS idx_galeria_privada_album ON galeria_fotos_privada(album_id);
CREATE INDEX IF NOT EXISTS idx_galeria_privada_educando ON galeria_fotos_privada(educando_id);
CREATE INDEX IF NOT EXISTS idx_galeria_privada_visible ON galeria_fotos_privada(visible);
CREATE INDEX IF NOT EXISTS idx_galeria_privada_fecha ON galeria_fotos_privada(fecha_actividad);

-- Confirmaciones Asistencia
CREATE INDEX IF NOT EXISTS idx_confirmaciones_actividad ON confirmaciones_asistencia(actividad_id);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_educando ON confirmaciones_asistencia(educando_id);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_confirmado ON confirmaciones_asistencia(confirmado);

-- Documentos Generales
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_subido_por ON documentos(subido_por);

COMMIT;

-- ========================================
-- VERIFICACIÓN DE MIGRACIÓN
-- ========================================
-- Este SELECT mostrará todas las tablas creadas
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'educandos',
    'familiares_educandos',
    'documentos_familia',
    'notificaciones_familia',
    'galeria_fotos_privada',
    'confirmaciones_asistencia',
    'documentos'
  )
ORDER BY tablename;
