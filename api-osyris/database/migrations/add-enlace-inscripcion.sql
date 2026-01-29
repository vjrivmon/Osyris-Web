-- Migracion: Agregar columna enlace_token a actividades
-- Permite compartir enlaces unicos de inscripcion a campamentos

-- Agregar columna
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS enlace_token VARCHAR(12) UNIQUE;

-- Crear indice para busquedas rapidas por token
CREATE INDEX IF NOT EXISTS idx_actividades_enlace_token ON actividades(enlace_token) WHERE enlace_token IS NOT NULL;

-- Generar tokens para campamentos existentes que tengan requiere_inscripcion = true y no tengan token
-- Usa md5 + random para generar tokens unicos de 12 caracteres
UPDATE actividades
SET enlace_token = SUBSTRING(REPLACE(REPLACE(ENCODE(DECODE(MD5(RANDOM()::TEXT || id::TEXT), 'hex'), 'base64'), '/', ''), '+', ''), 1, 12)
WHERE tipo = 'campamento'
  AND requiere_inscripcion = true
  AND enlace_token IS NULL;

-- Generar tokens para reuniones de sabado futuras sin token
UPDATE actividades
SET enlace_token = SUBSTRING(REPLACE(REPLACE(ENCODE(DECODE(MD5(RANDOM()::TEXT || id::TEXT || 'sabado'), 'hex'), 'base64'), '/', ''), '+', ''), 1, 12)
WHERE tipo = 'reunion_sabado'
  AND fecha_inicio >= CURRENT_DATE
  AND enlace_token IS NULL;
