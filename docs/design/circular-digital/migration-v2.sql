-- ============================================================================
-- MIGRACIÓN V2: Circular Digital con Template PDF
-- Fecha: 2026-02-02
-- Descripción: Añadir campos del template PDF a circular_actividad y crear
--              tabla config_ronda para gestionar contactos por temporada.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLA: config_ronda
-- Configuración de ronda por temporada (responsables, contactos, normas).
-- Se configura 1 vez por temporada y se usa al rellenar el template PDF.
-- ============================================================================

CREATE TABLE IF NOT EXISTS config_ronda (
    id                           SERIAL PRIMARY KEY,
    temporada                    TEXT NOT NULL,                -- Ej: "2025-2026"
    responsable_castores         TEXT DEFAULT '',
    numero_responsable_castores  TEXT DEFAULT '',
    responsable_manada           TEXT DEFAULT '',
    numero_responsable_manada    TEXT DEFAULT '',
    responsable_tropa            TEXT DEFAULT '',
    numero_responsable_tropa     TEXT DEFAULT '',
    responsable_pioneros         TEXT DEFAULT '',
    numero_responsable_pioneros  TEXT DEFAULT '',
    responsable_rutas            TEXT DEFAULT '',
    numero_responsable_rutas     TEXT DEFAULT '',
    normas_generales             TEXT DEFAULT 'Recordamos que en las actividades scouts no se permiten teléfonos móviles, golosinas ni plásticos de un solo uso.',
    cuenta_bancaria              TEXT DEFAULT '',
    activa                       BOOLEAN DEFAULT TRUE,
    created_at                   TIMESTAMPTZ DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_ronda_activa ON config_ronda(activa) WHERE activa = TRUE;

COMMENT ON TABLE config_ronda IS 'Configuración de ronda por temporada. Solo una puede estar activa a la vez.';
COMMENT ON COLUMN config_ronda.temporada IS 'Identificador de temporada, ej: 2025-2026';
COMMENT ON COLUMN config_ronda.normas_generales IS 'Texto fijo de normas (móviles, golosinas, plásticos, etc.)';

-- ============================================================================
-- 2. ALTERACIÓN: circular_actividad
-- Añadir campos que coinciden con los campos del template PDF.
-- ============================================================================

ALTER TABLE circular_actividad
    ADD COLUMN IF NOT EXISTS numero_dia          TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS destinatarios       TEXT DEFAULT 'Familias del Grupo Scout Osyris',
    ADD COLUMN IF NOT EXISTS fecha_actividad     TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS lugar               TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS hora_y_lugar_salida TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS hora_y_lugar_llegada TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS que_llevar          TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS precio_info_pago    TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS info_familias       TEXT DEFAULT '';

COMMENT ON COLUMN circular_actividad.numero_dia IS 'Ej: "7" o "7-8" para el campo numero_dia del template PDF';
COMMENT ON COLUMN circular_actividad.fecha_actividad IS 'Ej: "SÁBADO 7 - DOMINGO 8 DE FEBRERO" para el template PDF';
COMMENT ON COLUMN circular_actividad.hora_y_lugar_salida IS 'Ej: "A las 10:00h en la sede del grupo"';
COMMENT ON COLUMN circular_actividad.hora_y_lugar_llegada IS 'Ej: "A las 18:00h en la sede del grupo"';
COMMENT ON COLUMN circular_actividad.precio_info_pago IS 'Ej: "15€ por educando. Transferencia a ES12 3456 ..."';

-- ============================================================================
-- 3. TRIGGER: updated_at para config_ronda
-- ============================================================================

CREATE TRIGGER set_updated_at_config_ronda
    BEFORE UPDATE ON config_ronda
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- 4. CONSTRAINT: Solo una config_ronda activa a la vez
-- Se gestiona desde la aplicación desactivando la anterior al activar una nueva.
-- ============================================================================

-- Nota: No usamos UNIQUE parcial porque puede haber transiciones.
-- La lógica de "solo una activa" se gestiona en el modelo.

-- ============================================================================
-- FIN DE MIGRACIÓN V2
-- ============================================================================

COMMIT;

-- ============================================================================
-- ROLLBACK V2 (ejecutar manualmente si necesario)
-- ============================================================================
-- BEGIN;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS numero_dia;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS destinatarios;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS fecha_actividad;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS lugar;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS hora_y_lugar_salida;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS hora_y_lugar_llegada;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS que_llevar;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS precio_info_pago;
-- ALTER TABLE circular_actividad DROP COLUMN IF EXISTS info_familias;
-- DROP TABLE IF EXISTS config_ronda CASCADE;
-- COMMIT;
