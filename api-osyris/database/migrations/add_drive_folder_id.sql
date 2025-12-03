-- Migración: Añadir columna drive_folder_id a educandos
-- Fecha: 2025-11-28
-- Descripción: Almacena el ID de carpeta de Google Drive para acceso directo

-- Añadir columna para almacenar ID de carpeta Drive
ALTER TABLE educandos
ADD COLUMN IF NOT EXISTS drive_folder_id VARCHAR(255) DEFAULT NULL;

-- Índice para búsqueda rápida (aunque raramente buscaremos por este campo)
CREATE INDEX IF NOT EXISTS idx_educandos_drive_folder ON educandos(drive_folder_id);

-- Comentario descriptivo
COMMENT ON COLUMN educandos.drive_folder_id IS 'ID de carpeta en Google Drive para acceso directo sin búsqueda por nombre';
