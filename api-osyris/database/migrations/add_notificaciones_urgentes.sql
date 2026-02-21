-- ========================================
-- MIGRACIÓN: Sistema de notificaciones urgentes
-- Fecha: 2026-02-21
-- Descripción: Añade columnas urgente/mostrar_modal a las tablas
--              de notificaciones y crea tabla config_notificaciones
-- ========================================

-- 1. Añadir columnas a notificaciones_familia (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notificaciones_familia' AND column_name = 'urgente'
  ) THEN
    ALTER TABLE notificaciones_familia ADD COLUMN urgente BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notificaciones_familia' AND column_name = 'mostrar_modal'
  ) THEN
    ALTER TABLE notificaciones_familia ADD COLUMN mostrar_modal BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. Añadir columnas a notificaciones_scouter (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notificaciones_scouter' AND column_name = 'urgente'
  ) THEN
    ALTER TABLE notificaciones_scouter ADD COLUMN urgente BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notificaciones_scouter' AND column_name = 'mostrar_modal'
  ) THEN
    ALTER TABLE notificaciones_scouter ADD COLUMN mostrar_modal BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 3. Crear tabla config_notificaciones
CREATE TABLE IF NOT EXISTS config_notificaciones (
  id SERIAL PRIMARY KEY,
  tipo_notificacion VARCHAR(100) UNIQUE NOT NULL,
  es_urgente BOOLEAN DEFAULT FALSE,
  descripcion TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Seed de tipos de notificación por defecto
INSERT INTO config_notificaciones (tipo_notificacion, es_urgente, descripcion)
VALUES
  ('cuota_pendiente', TRUE, 'Cuota pendiente de pago'),
  ('documento_rechazado', TRUE, 'Documento rechazado'),
  ('documento_aprobado', FALSE, 'Documento aprobado'),
  ('nuevo_evento', FALSE, 'Nuevo evento'),
  ('inscripcion_confirmada', FALSE, 'Inscripción confirmada'),
  ('iban_actualizado', FALSE, 'IBAN de familia actualizado')
ON CONFLICT (tipo_notificacion) DO NOTHING;

-- 5. Índice para consultas de notificaciones urgentes
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_urgente
  ON notificaciones_familia (urgente) WHERE urgente = TRUE AND leida = FALSE;

CREATE INDEX IF NOT EXISTS idx_notificaciones_scouter_urgente
  ON notificaciones_scouter (urgente) WHERE urgente = TRUE AND leida = FALSE;
