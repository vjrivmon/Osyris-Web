-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Fix secciones de usuarios scouters
-- Issue: CRIT-001 - Error "No tienes una sección asignada"
-- Fecha: 2026-01-22
-- ═══════════════════════════════════════════════════════════════════════════

-- DESCRIPCIÓN:
-- Los usuarios Rodrigo, Asier y Noelia tienen seccion_id = NULL,
-- lo que causa que no puedan acceder a la gestión de educandos.
-- Esta migración asigna las secciones correctas a estos usuarios.

-- SECCIONES REFERENCE:
-- 1 = Castores (Colonia La Veleta)
-- 2 = Manada (Manada Waingunga)
-- 3 = Tropa (Tropa Brownsea)
-- 4 = Pioneros (Posta Kanhiwara)
-- 5 = Rutas (Ruta Walhalla)

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 1: Ver estado actual (para verificación)
-- ═══════════════════════════════════════════════════════════════════════════

-- Mostrar usuarios scouter sin sección
SELECT
    id,
    nombre,
    email,
    rol,
    seccion_id,
    CASE seccion_id
        WHEN 1 THEN 'Castores'
        WHEN 2 THEN 'Manada'
        WHEN 3 THEN 'Tropa'
        WHEN 4 THEN 'Pioneros'
        WHEN 5 THEN 'Rutas'
        ELSE 'SIN SECCIÓN'
    END as nombre_seccion
FROM usuarios
WHERE rol = 'scouter'
ORDER BY id;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 2: Asignar secciones a usuarios específicos
-- ═══════════════════════════════════════════════════════════════════════════

-- Rodrigo → Pioneros (seccion_id = 4)
UPDATE usuarios
SET seccion_id = 4,
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(nombre) LIKE '%rodrigo%'
  AND rol = 'scouter'
  AND (seccion_id IS NULL OR seccion_id = 0);

-- Asier → Manada (seccion_id = 2)
UPDATE usuarios
SET seccion_id = 2,
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(nombre) LIKE '%asier%'
  AND rol = 'scouter'
  AND (seccion_id IS NULL OR seccion_id = 0);

-- Noelia → Castores (seccion_id = 1)
UPDATE usuarios
SET seccion_id = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(nombre) LIKE '%noelia%'
  AND rol = 'scouter'
  AND (seccion_id IS NULL OR seccion_id = 0);

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 3: Verificar resultado
-- ═══════════════════════════════════════════════════════════════════════════

-- Mostrar usuarios actualizados
SELECT
    id,
    nombre,
    email,
    rol,
    seccion_id,
    CASE seccion_id
        WHEN 1 THEN 'Castores'
        WHEN 2 THEN 'Manada'
        WHEN 3 THEN 'Tropa'
        WHEN 4 THEN 'Pioneros'
        WHEN 5 THEN 'Rutas'
        ELSE 'SIN SECCIÓN'
    END as nombre_seccion,
    updated_at
FROM usuarios
WHERE rol = 'scouter'
ORDER BY id;

-- Verificar que no quedan scouters sin sección
SELECT COUNT(*) as scouters_sin_seccion
FROM usuarios
WHERE rol = 'scouter'
  AND (seccion_id IS NULL OR seccion_id = 0);

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 4: (OPCIONAL) Agregar constraint para prevenir futuros problemas
-- ═══════════════════════════════════════════════════════════════════════════

-- NOTA: Descomentar solo si se quiere forzar que todos los scouters tengan sección
-- Esto puede causar problemas si hay usuarios temporales o en proceso de creación

-- ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_scouter_seccion;
-- ALTER TABLE usuarios
-- ADD CONSTRAINT chk_scouter_seccion
-- CHECK (rol != 'scouter' OR seccion_id IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLLBACK (solo si es necesario revertir)
-- ═══════════════════════════════════════════════════════════════════════════

-- Para revertir (ejecutar manualmente si hay problemas):
-- UPDATE usuarios SET seccion_id = NULL WHERE LOWER(nombre) LIKE '%rodrigo%' AND rol = 'scouter';
-- UPDATE usuarios SET seccion_id = NULL WHERE LOWER(nombre) LIKE '%asier%' AND rol = 'scouter';
-- UPDATE usuarios SET seccion_id = NULL WHERE LOWER(nombre) LIKE '%noelia%' AND rol = 'scouter';

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DE MIGRACIÓN
-- ═══════════════════════════════════════════════════════════════════════════
