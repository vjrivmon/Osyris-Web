-- Migration: Control de Asistencia In-Situ para Campamentos y Salidas
-- Issue #6
-- Fecha: 2026-02-06

-- Nueva tabla para registro de asistencia
CREATE TABLE IF NOT EXISTS asistencia_actividad (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  educando_id INTEGER NOT NULL REFERENCES educandos(id) ON DELETE CASCADE,
  
  -- Estados de asistencia
  ha_llegado BOOLEAN DEFAULT false,
  hora_llegada TIMESTAMP,
  registrado_por INTEGER REFERENCES usuarios(id),
  
  -- Documentación física (SIP = tarjeta sanitaria)
  sip_entregado BOOLEAN DEFAULT false,
  sip_registrado_por INTEGER REFERENCES usuarios(id),
  sip_hora_registro TIMESTAMP,
  
  -- Observaciones
  observaciones TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(actividad_id, educando_id)
);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_asistencia_actividad ON asistencia_actividad(actividad_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_educando ON asistencia_actividad(educando_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_asistencia_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asistencia_updated_at ON asistencia_actividad;
CREATE TRIGGER asistencia_updated_at
  BEFORE UPDATE ON asistencia_actividad
  FOR EACH ROW
  EXECUTE FUNCTION update_asistencia_timestamp();

-- Comentarios
COMMENT ON TABLE asistencia_actividad IS 'Registro de asistencia in-situ para campamentos y salidas';
COMMENT ON COLUMN asistencia_actividad.ha_llegado IS 'Indica si el educando ha llegado al punto de encuentro';
COMMENT ON COLUMN asistencia_actividad.sip_entregado IS 'Indica si se ha entregado el SIP (tarjeta sanitaria)';
