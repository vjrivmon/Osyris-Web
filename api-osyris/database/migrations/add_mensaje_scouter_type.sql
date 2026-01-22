-- Migracion: Agregar tipo mensaje_scouter a notificaciones_familia
-- Esta migracion extiende el tipo de notificacion para incluir mensajes directos de scouters
-- MED-005: Mejorar comunicacion entre scouters y familias

-- Primero eliminamos el constraint existente si existe
ALTER TABLE notificaciones_familia DROP CONSTRAINT IF EXISTS notificaciones_familia_tipo_check;

-- Agregamos el nuevo constraint con el tipo adicional
ALTER TABLE notificaciones_familia
ADD CONSTRAINT notificaciones_familia_tipo_check
CHECK (tipo IN ('urgente', 'importante', 'informativo', 'recordatorio', 'mensaje_scouter'));

-- Agregar columna remitente_id para saber quien envio el mensaje (opcional, puede ser null para notificaciones del sistema)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notificaciones_familia' AND column_name = 'remitente_id'
    ) THEN
        ALTER TABLE notificaciones_familia ADD COLUMN remitente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Indice para optimizar busqueda por remitente
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_remitente_id ON notificaciones_familia(remitente_id);

-- Comentarios
COMMENT ON COLUMN notificaciones_familia.remitente_id IS 'ID del scouter que envio el mensaje (null para notificaciones del sistema)';
