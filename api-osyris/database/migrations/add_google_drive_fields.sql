-- Migración: Añadir campos para integración con Google Drive
-- Fecha: 2025-11-21
-- Descripción: Campos para almacenar referencias a archivos en Google Drive y estados de revisión

-- Añadir columnas a documentos_familia
ALTER TABLE documentos_familia
ADD COLUMN IF NOT EXISTS google_drive_file_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_drive_folder_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS estado_revision VARCHAR(50) DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT,
ADD COLUMN IF NOT EXISTS revisado_por INTEGER REFERENCES usuarios(id),
ADD COLUMN IF NOT EXISTS fecha_revision TIMESTAMP;

-- Crear índices para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_documentos_familia_drive_file_id ON documentos_familia(google_drive_file_id);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_estado_revision ON documentos_familia(estado_revision);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_revisado_por ON documentos_familia(revisado_por);

-- Actualizar constraint de estado para incluir nuevos valores
-- Primero eliminamos el constraint si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'documentos_familia_estado_check'
    ) THEN
        ALTER TABLE documentos_familia DROP CONSTRAINT documentos_familia_estado_check;
    END IF;
END $$;

-- Añadir nuevo constraint con todos los estados posibles
ALTER TABLE documentos_familia
ADD CONSTRAINT documentos_familia_estado_check
CHECK (estado IN ('pendiente', 'pendiente_revision', 'vigente', 'por_vencer', 'vencido', 'rechazado', 'aprobado'));

-- Crear tabla para mapeo de carpetas de educandos (cache de IDs de Drive)
CREATE TABLE IF NOT EXISTS educando_drive_folders (
    id SERIAL PRIMARY KEY,
    educando_id INTEGER NOT NULL REFERENCES educandos(id) ON DELETE CASCADE,
    google_drive_folder_id VARCHAR(255) NOT NULL,
    seccion_folder_id VARCHAR(255),
    anio_folder_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(educando_id)
);

CREATE INDEX IF NOT EXISTS idx_educando_drive_folders_educando ON educando_drive_folders(educando_id);
CREATE INDEX IF NOT EXISTS idx_educando_drive_folders_drive_id ON educando_drive_folders(google_drive_folder_id);

-- Comentarios de documentación
COMMENT ON COLUMN documentos_familia.google_drive_file_id IS 'ID del archivo en Google Drive';
COMMENT ON COLUMN documentos_familia.google_drive_folder_id IS 'ID de la carpeta del educando en Google Drive';
COMMENT ON COLUMN documentos_familia.estado_revision IS 'Estado de revisión: pendiente, pendiente_revision, aprobado, rechazado';
COMMENT ON COLUMN documentos_familia.motivo_rechazo IS 'Motivo del rechazo si aplica';
COMMENT ON COLUMN documentos_familia.revisado_por IS 'ID del scouter que revisó el documento';
COMMENT ON COLUMN documentos_familia.fecha_revision IS 'Fecha y hora de la revisión';

COMMENT ON TABLE educando_drive_folders IS 'Cache de IDs de carpetas de Google Drive por educando';
