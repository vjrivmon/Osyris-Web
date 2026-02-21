-- ========================================
-- MIGRACIÓN: Filtrado por sección, iCal export y documentos de eventos
-- Fecha: 2026-02-21
-- Idempotente: todas las sentencias usan IF NOT EXISTS / IF EXISTS
-- ========================================

-- 1. Añadir is_global a actividades (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'actividades' AND column_name = 'is_global'
  ) THEN
    ALTER TABLE actividades ADD COLUMN is_global BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Tabla tokens_calendario para exportación iCal por sección
CREATE TABLE IF NOT EXISTS tokens_calendario (
  id SERIAL PRIMARY KEY,
  seccion_id INTEGER UNIQUE NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_calendario_token ON tokens_calendario(token);
CREATE INDEX IF NOT EXISTS idx_tokens_calendario_seccion ON tokens_calendario(seccion_id);

-- 3. Tabla documentos_requeridos_evento
CREATE TABLE IF NOT EXISTS documentos_requeridos_evento (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  descripcion TEXT,
  obligatorio BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_req_evento_actividad ON documentos_requeridos_evento(actividad_id);

-- 4. Tabla documentos_evento_familia
CREATE TABLE IF NOT EXISTS documentos_evento_familia (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  educando_id INTEGER NOT NULL REFERENCES educandos(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  archivo_url TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'subido', 'aprobado', 'rechazado')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_evt_fam_actividad ON documentos_evento_familia(actividad_id);
CREATE INDEX IF NOT EXISTS idx_doc_evt_fam_educando ON documentos_evento_familia(educando_id);

-- Marcar reuniones de sábado y eventos sin sección como globales retroactivamente
UPDATE actividades
SET is_global = true
WHERE is_global IS NULL
  AND (seccion_id IS NULL OR tipo = 'reunion_sabado');
