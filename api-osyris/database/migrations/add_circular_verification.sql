-- Migration: Add circular verification columns
-- Issue #5: Panel de Verificación de Circulares de Campamento
-- Fecha: 2026-02-06

-- Añadir columnas de verificación de circular
ALTER TABLE inscripciones_campamento
ADD COLUMN IF NOT EXISTS circular_verificada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS circular_verificada_por INTEGER REFERENCES usuarios(id),
ADD COLUMN IF NOT EXISTS circular_verificada_fecha TIMESTAMP;

-- Índice para búsquedas por estado de verificación
CREATE INDEX IF NOT EXISTS idx_inscripciones_circular_verificada
ON inscripciones_campamento(circular_verificada)
WHERE circular_firmada_drive_id IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN inscripciones_campamento.circular_verificada IS 'Indica si la circular ha sido verificada por un scouter';
COMMENT ON COLUMN inscripciones_campamento.circular_verificada_por IS 'ID del usuario que verificó la circular';
COMMENT ON COLUMN inscripciones_campamento.circular_verificada_fecha IS 'Fecha y hora de verificación';
