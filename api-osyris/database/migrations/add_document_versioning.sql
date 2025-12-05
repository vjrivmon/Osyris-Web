-- =============================================
-- Migración: Sistema de Versionado de Documentos
-- Fecha: 2025-12-03
-- Descripción: Añade soporte para historial de versiones,
--              límite de subidas 24h, y solicitudes de desbloqueo
-- =============================================

-- 1. Tabla historial de versiones de documentos
-- Guarda versiones anteriores cuando se reemplaza un documento
CREATE TABLE IF NOT EXISTS documentos_historial (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL REFERENCES documentos_familia(id) ON DELETE CASCADE,
  google_drive_file_id VARCHAR(255),
  archivo_nombre VARCHAR(255),
  archivo_ruta TEXT,
  tipo_archivo VARCHAR(100),
  tamaño_archivo BIGINT,
  version INTEGER NOT NULL DEFAULT 1,
  subido_por INTEGER REFERENCES usuarios(id),
  fecha_subida TIMESTAMP DEFAULT NOW(),
  estado VARCHAR(50) DEFAULT 'reemplazado', -- reemplazado, rechazado, restaurado
  motivo TEXT, -- Motivo del reemplazo o rechazo
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Campos adicionales en documentos_familia para control de subidas
ALTER TABLE documentos_familia
ADD COLUMN IF NOT EXISTS ultima_subida TIMESTAMP,
ADD COLUMN IF NOT EXISTS subidas_hoy INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_reset_subidas DATE,
ADD COLUMN IF NOT EXISTS version_activa INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tiene_version_anterior BOOLEAN DEFAULT false;

-- 3. Tabla solicitudes de desbloqueo
-- Permite a familias solicitar desbloqueo cuando alcanzan límite 24h
CREATE TABLE IF NOT EXISTS solicitudes_desbloqueo (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL REFERENCES documentos_familia(id) ON DELETE CASCADE,
  educando_id INTEGER NOT NULL REFERENCES educandos(id),
  familiar_id INTEGER NOT NULL REFERENCES usuarios(id),
  seccion_id INTEGER NOT NULL REFERENCES secciones(id),
  tipo_documento VARCHAR(100),
  titulo_documento VARCHAR(255),
  motivo TEXT, -- Motivo de la solicitud (opcional)
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobada, rechazada
  revisado_por INTEGER REFERENCES usuarios(id),
  fecha_solicitud TIMESTAMP DEFAULT NOW(),
  fecha_revision TIMESTAMP,
  respuesta_scouter TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Índices para optimización
CREATE INDEX IF NOT EXISTS idx_doc_historial_documento ON documentos_historial(documento_id);
CREATE INDEX IF NOT EXISTS idx_doc_historial_fecha ON documentos_historial(fecha_subida DESC);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_desbloqueo(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_seccion ON solicitudes_desbloqueo(seccion_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_familiar ON solicitudes_desbloqueo(familiar_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes_desbloqueo(fecha_solicitud DESC);

-- 5. Comentarios descriptivos
COMMENT ON TABLE documentos_historial IS 'Historial de versiones de documentos para mantener versiones anteriores válidas';
COMMENT ON TABLE solicitudes_desbloqueo IS 'Solicitudes de familias para desbloquear límite de subida de 24h';

COMMENT ON COLUMN documentos_familia.ultima_subida IS 'Timestamp de la última subida del documento';
COMMENT ON COLUMN documentos_familia.subidas_hoy IS 'Contador de subidas realizadas hoy (máx 1)';
COMMENT ON COLUMN documentos_familia.fecha_reset_subidas IS 'Fecha del último reset del contador de subidas';
COMMENT ON COLUMN documentos_familia.version_activa IS 'Número de versión actual del documento';
COMMENT ON COLUMN documentos_familia.tiene_version_anterior IS 'Indica si existe una versión anterior en el historial';

-- 6. Actualizar documentos existentes con valores por defecto
UPDATE documentos_familia
SET
  ultima_subida = COALESCE(fecha_subida, NOW()),
  subidas_hoy = 0,
  fecha_reset_subidas = CURRENT_DATE,
  version_activa = 1,
  tiene_version_anterior = false
WHERE ultima_subida IS NULL;

-- Verificar que la migración se ejecutó correctamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documentos_historial') THEN
    RAISE NOTICE 'Migración completada: tabla documentos_historial creada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solicitudes_desbloqueo') THEN
    RAISE NOTICE 'Migración completada: tabla solicitudes_desbloqueo creada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos_familia' AND column_name = 'subidas_hoy') THEN
    RAISE NOTICE 'Migración completada: columnas de control de subidas añadidas';
  END IF;
END $$;
