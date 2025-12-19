-- ========================================
-- MIGRACION: Sistema de Inscripcion a Campamentos v2.0
-- Fecha: 2025-12-14
-- Descripcion: Extiende tablas para gestion completa de campamentos
-- ========================================

-- ========================================
-- 1. EXTENDER TABLA ACTIVIDADES (campos de campamento)
-- ========================================

-- Informacion de logistica
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS lugar_salida VARCHAR(255);
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS hora_salida TIME;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS mapa_salida_url TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS lugar_regreso VARCHAR(255);
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS hora_regreso TIME;

-- Informacion economica
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS numero_cuenta VARCHAR(50);
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS concepto_pago TEXT;

-- Recordatorios (sistema hibrido)
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS recordatorios_predefinidos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS recordatorios_personalizados TEXT[] DEFAULT '{}';

-- Circular/Autorizacion en Drive
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS circular_drive_id VARCHAR(100);
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS circular_drive_url TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS circular_nombre VARCHAR(255);

-- Google Sheets de inscripciones
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS sheets_inscripciones_id VARCHAR(100);

-- Comentarios
COMMENT ON COLUMN actividades.lugar_salida IS 'Lugar de salida del campamento (ej: Metro Machado)';
COMMENT ON COLUMN actividades.hora_salida IS 'Hora de salida del campamento';
COMMENT ON COLUMN actividades.mapa_salida_url IS 'URL de Google Maps con punto de encuentro para salida';
COMMENT ON COLUMN actividades.lugar_regreso IS 'Lugar de regreso del campamento';
COMMENT ON COLUMN actividades.hora_regreso IS 'Hora de regreso del campamento';
COMMENT ON COLUMN actividades.numero_cuenta IS 'IBAN para transferencias del campamento';
COMMENT ON COLUMN actividades.concepto_pago IS 'Instrucciones para el concepto de la transferencia';
COMMENT ON COLUMN actividades.recordatorios_predefinidos IS 'Array JSON con recordatorios predefinidos activos';
COMMENT ON COLUMN actividades.recordatorios_personalizados IS 'Array de textos con recordatorios personalizados';
COMMENT ON COLUMN actividades.circular_drive_id IS 'ID del archivo de circular en Google Drive';
COMMENT ON COLUMN actividades.circular_drive_url IS 'URL de descarga de la circular';
COMMENT ON COLUMN actividades.circular_nombre IS 'Nombre original del archivo de circular';
COMMENT ON COLUMN actividades.sheets_inscripciones_id IS 'ID del Google Sheets con inscripciones';

-- ========================================
-- 2. EXTENDER TABLA INSCRIPCIONES_CAMPAMENTO
-- ========================================

-- Datos del familiar (para el Excel de respuestas)
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS email_familiar VARCHAR(255);
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS telefono_familiar VARCHAR(20);
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS nombre_familiar VARCHAR(255);

-- Documentos subidos por la familia
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS circular_firmada_drive_id VARCHAR(100);
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS circular_firmada_url TEXT;
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS fecha_subida_circular TIMESTAMP;

ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS justificante_pago_drive_id VARCHAR(100);
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS justificante_pago_url TEXT;
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS fecha_subida_justificante TIMESTAMP;

-- Estado de envio de documentos por email
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS circular_enviada_seccion BOOLEAN DEFAULT false;
ALTER TABLE inscripciones_campamento ADD COLUMN IF NOT EXISTS justificante_enviado_tesoreria BOOLEAN DEFAULT false;

-- Comentarios
COMMENT ON COLUMN inscripciones_campamento.email_familiar IS 'Email del familiar que inscribe';
COMMENT ON COLUMN inscripciones_campamento.telefono_familiar IS 'Telefono del familiar';
COMMENT ON COLUMN inscripciones_campamento.nombre_familiar IS 'Nombre completo del familiar';
COMMENT ON COLUMN inscripciones_campamento.circular_firmada_drive_id IS 'ID en Drive de la circular firmada';
COMMENT ON COLUMN inscripciones_campamento.circular_firmada_url IS 'URL de la circular firmada';
COMMENT ON COLUMN inscripciones_campamento.fecha_subida_circular IS 'Fecha de subida de circular firmada';
COMMENT ON COLUMN inscripciones_campamento.justificante_pago_drive_id IS 'ID en Drive del justificante de pago';
COMMENT ON COLUMN inscripciones_campamento.justificante_pago_url IS 'URL del justificante de pago';
COMMENT ON COLUMN inscripciones_campamento.fecha_subida_justificante IS 'Fecha de subida del justificante';
COMMENT ON COLUMN inscripciones_campamento.circular_enviada_seccion IS 'Si la circular firmada se envio al email de la seccion';
COMMENT ON COLUMN inscripciones_campamento.justificante_enviado_tesoreria IS 'Si el justificante se envio a tesoreria';

-- ========================================
-- 3. INDICES ADICIONALES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_actividades_circular_drive_id ON actividades(circular_drive_id) WHERE circular_drive_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actividades_sheets_id ON actividades(sheets_inscripciones_id) WHERE sheets_inscripciones_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inscripciones_circular_enviada ON inscripciones_campamento(circular_enviada_seccion);
CREATE INDEX IF NOT EXISTS idx_inscripciones_justificante_enviado ON inscripciones_campamento(justificante_enviado_tesoreria);

-- ========================================
-- 4. DATOS POR DEFECTO PARA RECORDATORIOS
-- ========================================

-- Funcion para obtener recordatorios predefinidos por defecto
CREATE OR REPLACE FUNCTION get_recordatorios_predefinidos_default()
RETURNS JSONB AS $$
BEGIN
  RETURN '[
    {"id": "almuerzo", "texto": "Traer almuerzo, comida y merienda del primer dia", "activo": true},
    {"id": "saco", "texto": "Llevar saco de dormir", "activo": true},
    {"id": "esterilla", "texto": "Llevar esterilla", "activo": true},
    {"id": "ropa_abrigo", "texto": "Llevar ropa de abrigo", "activo": true},
    {"id": "sip", "texto": "Traer SIP original", "activo": true},
    {"id": "camisa", "texto": "Traer camisa de la seccion", "activo": true},
    {"id": "panyoleta", "texto": "Traer panyoleta", "activo": true}
  ]'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ========================================
-- MIGRACION COMPLETADA
-- ========================================
