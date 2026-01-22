-- MED-002: Añadir campo de autorización de uso de imágenes
-- Fecha: 2025-01-22
-- Descripción: Agrega campo para registrar si los padres autorizan el uso de imágenes de sus hijos

-- ========================================
-- AGREGAR COLUMNA autorizacion_imagenes
-- ========================================
-- Tres estados posibles:
--   - true: Autorizado
--   - false: No autorizado
--   - null: No especificado (default)

ALTER TABLE educandos
ADD COLUMN IF NOT EXISTS autorizacion_imagenes BOOLEAN DEFAULT NULL;

-- ========================================
-- COMENTARIO DESCRIPTIVO
-- ========================================
COMMENT ON COLUMN educandos.autorizacion_imagenes IS 'Autorización de uso de imágenes: true = autorizado, false = no autorizado, null = no especificado';

-- ========================================
-- ÍNDICE PARA CONSULTAS POR AUTORIZACIÓN
-- ========================================
CREATE INDEX IF NOT EXISTS idx_educandos_autorizacion_imagenes ON educandos(autorizacion_imagenes);
