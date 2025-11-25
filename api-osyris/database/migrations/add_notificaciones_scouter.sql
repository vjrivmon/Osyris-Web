-- Migración: Crear tabla notificaciones_scouter
-- Esta tabla almacena notificaciones para los scouters/monitores
-- Las notificaciones se filtran por sección para que cada monitor vea solo las de su sección

CREATE TABLE IF NOT EXISTS notificaciones_scouter (
    id SERIAL PRIMARY KEY,
    educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
    educando_nombre VARCHAR(255),
    seccion_id INTEGER REFERENCES secciones(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL DEFAULT 'documento_pendiente',
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    enlace_accion VARCHAR(500),
    metadata JSONB,
    prioridad VARCHAR(20) DEFAULT 'alta',
    leida BOOLEAN DEFAULT false,
    fecha_lectura TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notif_scouter_seccion ON notificaciones_scouter(seccion_id);
CREATE INDEX IF NOT EXISTS idx_notif_scouter_leida ON notificaciones_scouter(leida);
CREATE INDEX IF NOT EXISTS idx_notif_scouter_tipo ON notificaciones_scouter(tipo);
CREATE INDEX IF NOT EXISTS idx_notif_scouter_fecha ON notificaciones_scouter(fecha_creacion DESC);

-- Añadir campo estado_revision a documentos_familia si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'documentos_familia' AND column_name = 'estado_revision'
    ) THEN
        ALTER TABLE documentos_familia ADD COLUMN estado_revision VARCHAR(50) DEFAULT 'pendiente';
    END IF;
END $$;

-- Comentarios
COMMENT ON TABLE notificaciones_scouter IS 'Notificaciones para monitores/scouters filtradas por sección';
COMMENT ON COLUMN notificaciones_scouter.tipo IS 'Tipo: documento_pendiente, documento_aprobado, documento_rechazado, etc';
COMMENT ON COLUMN notificaciones_scouter.metadata IS 'Datos adicionales como documento_id, tipo_documento, etc en formato JSON';
