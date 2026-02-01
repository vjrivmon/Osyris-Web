-- Añadir columnas de visualización faltantes en secciones
-- Causa: schema-optimizado.sql las eliminó pero el código las necesita
ALTER TABLE secciones ADD COLUMN IF NOT EXISTS color_principal VARCHAR(7);
ALTER TABLE secciones ADD COLUMN IF NOT EXISTS color_secundario VARCHAR(7);
ALTER TABLE secciones ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;
ALTER TABLE secciones ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;
ALTER TABLE secciones ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Poblar con los colores y orden reales del grupo Osyris
-- IDs 1-5 confirmados en 001_fix_scouter_sections.sql
UPDATE secciones SET color_principal = '#FF8C00', color_secundario = '#1E90FF', orden = 1
  WHERE nombre ILIKE '%castor%' AND (color_principal IS NULL OR orden IS NULL OR orden = 0);
UPDATE secciones SET color_principal = '#FFD700', color_secundario = '#228B22', orden = 2
  WHERE (nombre ILIKE '%manada%' OR nombre ILIKE '%lobato%') AND (color_principal IS NULL OR orden IS NULL OR orden = 0);
UPDATE secciones SET color_principal = '#228B22', color_secundario = '#228B22', orden = 3
  WHERE nombre ILIKE '%tropa%' AND (color_principal IS NULL OR orden IS NULL OR orden = 0);
UPDATE secciones SET color_principal = '#DC143C', color_secundario = '#DC143C', orden = 4
  WHERE (nombre ILIKE '%pionero%' OR nombre ILIKE '%posta%') AND (color_principal IS NULL OR orden IS NULL OR orden = 0);
UPDATE secciones SET color_principal = '#006400', color_secundario = '#006400', orden = 5
  WHERE nombre ILIKE '%ruta%' AND (color_principal IS NULL OR orden IS NULL OR orden = 0);
