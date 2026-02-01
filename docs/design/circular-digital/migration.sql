-- ============================================================================
-- MIGRACIÓN: Circular Digital para Osyris-Web
-- Fecha: 2026-02-01
-- Descripción: Crear tablas para perfil de salud, circulares digitales y
--              firma digital. Migrar datos existentes.
-- ============================================================================

-- Ejecutar dentro de una transacción
BEGIN;

-- ============================================================================
-- 1. TABLA: perfil_salud
-- Datos médicos persistentes por educando. Relación 1:1 con educandos.
-- ============================================================================

CREATE TABLE IF NOT EXISTS perfil_salud (
    id                    SERIAL PRIMARY KEY,
    educando_id           INTEGER NOT NULL UNIQUE REFERENCES educandos(id) ON DELETE CASCADE,
    alergias              TEXT DEFAULT '',
    intolerancias         TEXT DEFAULT '',
    dieta_especial        TEXT DEFAULT '',
    medicacion            TEXT DEFAULT '',
    observaciones_medicas TEXT DEFAULT '',
    grupo_sanguineo       VARCHAR(10) DEFAULT '',
    tarjeta_sanitaria     VARCHAR(50) DEFAULT '',
    enfermedades_cronicas TEXT DEFAULT '',
    puede_hacer_deporte   BOOLEAN DEFAULT TRUE,
    notas_adicionales     TEXT DEFAULT '',
    ultima_actualizacion  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_perfil_salud_educando ON perfil_salud(educando_id);

COMMENT ON TABLE perfil_salud IS 'Perfil de salud persistente por educando. Se pre-rellena en circulares digitales.';
COMMENT ON COLUMN perfil_salud.ultima_actualizacion IS 'Fecha de la última revisión explícita por el familiar. Se usa para alertar si >6 meses.';

-- ============================================================================
-- 2. TABLA: contactos_emergencia
-- Contactos de emergencia por educando. Mínimo 1, máximo 3.
-- ============================================================================

CREATE TABLE IF NOT EXISTS contactos_emergencia (
    id              SERIAL PRIMARY KEY,
    educando_id     INTEGER NOT NULL REFERENCES educandos(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(200) NOT NULL,
    telefono        VARCHAR(20) NOT NULL,
    relacion        VARCHAR(50) NOT NULL,
    orden           INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_contacto_emergencia_orden UNIQUE (educando_id, orden),
    CONSTRAINT chk_contacto_orden CHECK (orden BETWEEN 1 AND 3)
);

CREATE INDEX idx_contactos_emergencia_educando ON contactos_emergencia(educando_id);

COMMENT ON TABLE contactos_emergencia IS 'Contactos de emergencia por educando. Orden 1 = principal.';

-- ============================================================================
-- 3. TABLA: plantillas_circular
-- Plantillas reutilizables de circulares (PDF base + campos estándar).
-- ============================================================================

CREATE TABLE IF NOT EXISTS plantillas_circular (
    id                SERIAL PRIMARY KEY,
    nombre            VARCHAR(200) NOT NULL,
    descripcion       TEXT DEFAULT '',
    tipo              VARCHAR(50) NOT NULL DEFAULT 'campamento',
    plantilla_pdf_base BYTEA,
    campos_estandar   JSONB DEFAULT '["alergias","intolerancias","dieta_especial","medicacion","observaciones_medicas","contactos_emergencia"]'::jsonb,
    activa            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE plantillas_circular IS 'Plantillas reutilizables de circulares. El campo plantilla_pdf_base contiene el PDF template.';
COMMENT ON COLUMN plantillas_circular.tipo IS 'Tipo de actividad: campamento, salida, excursion, acampada';
COMMENT ON COLUMN plantillas_circular.campos_estandar IS 'Lista de campos del perfil_salud que se incluyen en esta plantilla';

-- ============================================================================
-- 4. TABLA: circular_actividad
-- Circular específica asociada a una actividad concreta.
-- ============================================================================

CREATE TABLE IF NOT EXISTS circular_actividad (
    id                  SERIAL PRIMARY KEY,
    actividad_id        INTEGER NOT NULL,
    plantilla_id        INTEGER REFERENCES plantillas_circular(id) ON DELETE SET NULL,
    titulo              VARCHAR(300) NOT NULL,
    texto_introductorio TEXT DEFAULT '',
    fecha_limite_firma  DATE,
    estado              VARCHAR(20) NOT NULL DEFAULT 'borrador',
    configuracion       JSONB DEFAULT '{}'::jsonb,
    creado_por          INTEGER NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_circular_estado CHECK (estado IN ('borrador', 'publicada', 'cerrada', 'cancelada'))
);

CREATE INDEX idx_circular_actividad_actividad ON circular_actividad(actividad_id);
CREATE INDEX idx_circular_actividad_estado ON circular_actividad(estado);

COMMENT ON TABLE circular_actividad IS 'Circular digital asociada a una actividad. Configura qué campos se piden y la fecha límite.';
COMMENT ON COLUMN circular_actividad.configuracion IS 'JSON con configuración adicional: requiere_pago, documentos_adjuntos, etc.';

-- ============================================================================
-- 5. TABLA: campos_custom_circular
-- Campos personalizados añadidos por el admin a una circular específica.
-- ============================================================================

CREATE TABLE IF NOT EXISTS campos_custom_circular (
    id                    SERIAL PRIMARY KEY,
    circular_actividad_id INTEGER NOT NULL REFERENCES circular_actividad(id) ON DELETE CASCADE,
    nombre_campo          VARCHAR(100) NOT NULL,
    tipo_campo            VARCHAR(20) NOT NULL DEFAULT 'texto',
    etiqueta              VARCHAR(300) NOT NULL,
    obligatorio           BOOLEAN DEFAULT FALSE,
    opciones              JSONB DEFAULT NULL,
    orden                 INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT chk_tipo_campo CHECK (tipo_campo IN ('texto', 'textarea', 'checkbox', 'select'))
);

CREATE INDEX idx_campos_custom_circular ON campos_custom_circular(circular_actividad_id);

COMMENT ON TABLE campos_custom_circular IS 'Campos personalizados que el admin añade a una circular. Ej: "Autorizo baño en río".';

-- ============================================================================
-- 6. TABLA: circular_respuesta
-- Respuesta de un familiar a una circular (datos confirmados + firma).
-- ============================================================================

CREATE TABLE IF NOT EXISTS circular_respuesta (
    id                          SERIAL PRIMARY KEY,
    circular_actividad_id       INTEGER NOT NULL REFERENCES circular_actividad(id) ON DELETE CASCADE,
    educando_id                 INTEGER NOT NULL REFERENCES educandos(id) ON DELETE CASCADE,
    familiar_id                 INTEGER NOT NULL,
    -- Snapshots de datos al momento de firmar (inmutables)
    datos_medicos_snapshot      JSONB NOT NULL,
    contactos_emergencia_snapshot JSONB NOT NULL,
    campos_custom_respuestas    JSONB DEFAULT '{}'::jsonb,
    -- Firma
    firma_base64                TEXT NOT NULL,
    firma_tipo                  VARCHAR(10) NOT NULL DEFAULT 'image',
    ip_firma                    VARCHAR(45),
    user_agent_firma            TEXT,
    fecha_firma                 TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    -- Estado y PDF
    estado                      VARCHAR(20) NOT NULL DEFAULT 'firmada',
    pdf_drive_id                VARCHAR(100),
    pdf_hash_sha256             VARCHAR(64),
    pdf_local_path              TEXT,
    -- Versionado (para re-firmas)
    version                     INTEGER NOT NULL DEFAULT 1,
    -- Timestamps
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_circular_respuesta_version UNIQUE (circular_actividad_id, educando_id, version),
    CONSTRAINT chk_respuesta_estado CHECK (estado IN ('firmada', 'pdf_generado', 'archivada', 'error_pdf', 'error_drive', 'superseded', 'anulada')),
    CONSTRAINT chk_firma_tipo CHECK (firma_tipo IN ('image', 'text'))
);

CREATE INDEX idx_circular_respuesta_circular ON circular_respuesta(circular_actividad_id);
CREATE INDEX idx_circular_respuesta_educando ON circular_respuesta(educando_id);
CREATE INDEX idx_circular_respuesta_estado ON circular_respuesta(estado);
CREATE INDEX idx_circular_respuesta_familiar ON circular_respuesta(familiar_id);

COMMENT ON TABLE circular_respuesta IS 'Respuesta firmada de un familiar a una circular. Incluye snapshot de datos y firma.';
COMMENT ON COLUMN circular_respuesta.datos_medicos_snapshot IS 'Snapshot inmutable de los datos médicos en el momento de firmar';
COMMENT ON COLUMN circular_respuesta.firma_tipo IS 'image = firma manuscrita canvas, text = fallback nombre completo';
COMMENT ON COLUMN circular_respuesta.version IS 'Versión de la respuesta. Si el padre re-firma, se crea nueva versión y la anterior pasa a superseded';

-- ============================================================================
-- 7. TABLA: auditoria_datos_medicos
-- Log de accesos a datos médicos (cumplimiento RGPD).
-- ============================================================================

CREATE TABLE IF NOT EXISTS auditoria_datos_medicos (
    id           SERIAL PRIMARY KEY,
    educando_id  INTEGER NOT NULL REFERENCES educandos(id) ON DELETE CASCADE,
    usuario_id   INTEGER NOT NULL,
    accion       VARCHAR(20) NOT NULL,
    detalles     JSONB DEFAULT '{}'::jsonb,
    ip           VARCHAR(45),
    fecha        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_auditoria_accion CHECK (accion IN ('create', 'read', 'update', 'delete', 'export'))
);

CREATE INDEX idx_auditoria_educando ON auditoria_datos_medicos(educando_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_datos_medicos(fecha);
CREATE INDEX idx_auditoria_usuario ON auditoria_datos_medicos(usuario_id);

COMMENT ON TABLE auditoria_datos_medicos IS 'Log de auditoría para accesos a datos médicos. Requerido por RGPD.';

-- ============================================================================
-- 8. MODIFICACIÓN: inscripciones_campamento
-- Añadir FK a circular_respuesta.
-- ============================================================================

ALTER TABLE inscripciones_campamento
    ADD COLUMN IF NOT EXISTS circular_respuesta_id INTEGER
    REFERENCES circular_respuesta(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inscripciones_circular_respuesta
    ON inscripciones_campamento(circular_respuesta_id);

COMMENT ON COLUMN inscripciones_campamento.circular_respuesta_id IS 'FK a la respuesta digital de la circular. NULL si se usó el flujo PDF manual.';

-- ============================================================================
-- 9. MIGRACIÓN DE DATOS: Crear perfiles de salud desde datos existentes
-- ============================================================================

-- Crear perfil_salud para cada educando usando los datos más recientes
-- de inscripciones_campamento (si existen) o de la tabla educandos.

INSERT INTO perfil_salud (educando_id, alergias, intolerancias, dieta_especial, medicacion, observaciones_medicas)
SELECT DISTINCT ON (e.id)
    e.id,
    COALESCE(ic.alergias, e.alergias, ''),
    COALESCE(ic.intolerancias, ''),
    COALESCE(ic.dieta_especial, ''),
    COALESCE(ic.medicacion, ''),
    COALESCE(ic.observaciones_medicas, e.notas_medicas, '')
FROM educandos e
LEFT JOIN inscripciones_campamento ic ON e.id = ic.educando_id
ORDER BY e.id, ic.created_at DESC NULLS LAST
ON CONFLICT (educando_id) DO NOTHING;

-- Crear contacto de emergencia principal desde inscripciones más recientes

INSERT INTO contactos_emergencia (educando_id, nombre_completo, telefono, relacion, orden)
SELECT DISTINCT ON (e.id)
    e.id,
    COALESCE(ic.persona_emergencia, f.nombre || ' ' || f.apellidos),
    COALESCE(ic.telefono_emergencia, f.telefono, ''),
    COALESCE(fe.relacion, 'tutor'),
    1
FROM educandos e
LEFT JOIN inscripciones_campamento ic ON e.id = ic.educando_id
LEFT JOIN familiares_educandos fe ON e.id = fe.educando_id AND fe.es_contacto_principal = TRUE
LEFT JOIN familiares f ON fe.familiar_id = f.id
WHERE COALESCE(ic.persona_emergencia, f.nombre) IS NOT NULL
ORDER BY e.id, ic.created_at DESC NULLS LAST
ON CONFLICT (educando_id, orden) DO NOTHING;

-- ============================================================================
-- 10. PLANTILLA CIRCULAR POR DEFECTO
-- ============================================================================

INSERT INTO plantillas_circular (nombre, descripcion, tipo, campos_estandar, activa)
VALUES (
    'Circular Estándar - Campamento',
    'Plantilla estándar para campamentos y acampadas. Incluye todos los campos médicos y de emergencia.',
    'campamento',
    '["alergias", "intolerancias", "dieta_especial", "medicacion", "observaciones_medicas", "enfermedades_cronicas", "grupo_sanguineo", "tarjeta_sanitaria", "puede_hacer_deporte", "contactos_emergencia"]'::jsonb,
    TRUE
);

INSERT INTO plantillas_circular (nombre, descripcion, tipo, campos_estandar, activa)
VALUES (
    'Circular Básica - Salida de día',
    'Plantilla simplificada para salidas de un día. Solo campos médicos esenciales.',
    'salida',
    '["alergias", "medicacion", "contactos_emergencia"]'::jsonb,
    TRUE
);

-- ============================================================================
-- 11. FUNCIÓN: Trigger para updated_at automático
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a las nuevas tablas
CREATE TRIGGER set_updated_at_perfil_salud
    BEFORE UPDATE ON perfil_salud
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_circular_actividad
    BEFORE UPDATE ON circular_actividad
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_circular_respuesta
    BEFORE UPDATE ON circular_respuesta
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_plantillas_circular
    BEFORE UPDATE ON plantillas_circular
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================

COMMIT;

-- ============================================================================
-- ROLLBACK (ejecutar manualmente si necesario)
-- ============================================================================
-- BEGIN;
-- ALTER TABLE inscripciones_campamento DROP COLUMN IF EXISTS circular_respuesta_id;
-- DROP TABLE IF EXISTS auditoria_datos_medicos CASCADE;
-- DROP TABLE IF EXISTS circular_respuesta CASCADE;
-- DROP TABLE IF EXISTS campos_custom_circular CASCADE;
-- DROP TABLE IF EXISTS circular_actividad CASCADE;
-- DROP TABLE IF EXISTS plantillas_circular CASCADE;
-- DROP TABLE IF EXISTS contactos_emergencia CASCADE;
-- DROP TABLE IF EXISTS perfil_salud CASCADE;
-- COMMIT;
