-- =============================================================
-- FIX: Corregir eventos comunes que tienen seccion_id incorrecto
-- Estos eventos deben tener seccion_id = NULL para ser visibles
-- a TODAS las secciones
-- =============================================================

-- PASO 1: Verificar estado actual de eventos que deberian ser comunes
SELECT id, titulo, seccion_id, tipo, lugar, fecha_inicio
FROM actividades
WHERE tipo IN ('campamento', 'evento_especial', 'salida')
  AND (LOWER(titulo) LIKE '%festival%cancion%'
    OR LOWER(titulo) LIKE '%sant jordi%'
    OR LOWER(titulo) LIKE '%fin de ronda%'
    OR LOWER(titulo) LIKE '%aniversario%'
    OR LOWER(titulo) LIKE '%navidad%'
    OR LOWER(titulo) LIKE '%verano%')
ORDER BY fecha_inicio;

-- PASO 2: Corregir campamentos comunes (NO incluir casmatropolis ni pascua)
-- Estos campamentos son para TODAS las secciones
UPDATE actividades
SET seccion_id = NULL
WHERE tipo = 'campamento'
  AND seccion_id IS NOT NULL
  AND (LOWER(titulo) LIKE '%aniversario%'
    OR LOWER(titulo) LIKE '%navidad%'
    OR LOWER(titulo) LIKE '%verano%');

-- PASO 3: Corregir eventos especiales comunes
-- Festival de la Cancion y Sant Jordi son para todas las secciones
UPDATE actividades
SET seccion_id = NULL
WHERE tipo = 'evento_especial'
  AND seccion_id IS NOT NULL
  AND (LOWER(titulo) LIKE '%festival%cancion%'
    OR LOWER(titulo) LIKE '%sant jordi%');

-- PASO 4: Corregir salidas comunes
-- Salida Fin de Ronda es para todas las secciones
UPDATE actividades
SET seccion_id = NULL
WHERE tipo = 'salida'
  AND seccion_id IS NOT NULL
  AND LOWER(titulo) LIKE '%fin de ronda%';

-- PASO 5: Verificar cambios aplicados
SELECT id, titulo, seccion_id, tipo, lugar, fecha_inicio
FROM actividades
WHERE tipo IN ('campamento', 'evento_especial', 'salida')
  AND (LOWER(titulo) LIKE '%festival%cancion%'
    OR LOWER(titulo) LIKE '%sant jordi%'
    OR LOWER(titulo) LIKE '%fin de ronda%'
    OR LOWER(titulo) LIKE '%aniversario%'
    OR LOWER(titulo) LIKE '%navidad%'
    OR LOWER(titulo) LIKE '%verano%')
ORDER BY fecha_inicio;

-- =============================================================
-- NOTA: Los siguientes campamentos SE FILTRAN POR CODIGO
-- (detectados por titulo, no requieren seccion_id = NULL):
-- - Casmatropolis: Solo Castores (1), Manada (2), Tropa (3)
-- - Pascua: Solo Castores (1), Manada (2), Tropa (3)
-- =============================================================
