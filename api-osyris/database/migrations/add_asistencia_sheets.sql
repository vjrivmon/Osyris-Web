-- Migración: Sistema de Asistencia Automática en Google Drive
-- Fecha: 2025-12-14
-- Descripción: Tabla para relacionar actividades con sus spreadsheets de asistencia en Google Drive

-- Tabla para relacionar actividades con sus spreadsheets de asistencia
CREATE TABLE IF NOT EXISTS asistencia_sheets (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  spreadsheet_id VARCHAR(100) NOT NULL,
  carpeta_mes_id VARCHAR(100) NOT NULL,
  carpeta_fecha_id VARCHAR(100) NOT NULL,
  nombre_archivo VARCHAR(200) NOT NULL,
  fecha_reunion DATE NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(actividad_id)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_asistencia_sheets_actividad ON asistencia_sheets(actividad_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_sheets_fecha ON asistencia_sheets(fecha_reunion);
CREATE INDEX IF NOT EXISTS idx_asistencia_sheets_spreadsheet ON asistencia_sheets(spreadsheet_id);

-- Comentarios descriptivos
COMMENT ON TABLE asistencia_sheets IS 'Relación entre actividades y sus spreadsheets de asistencia en Google Drive';
COMMENT ON COLUMN asistencia_sheets.actividad_id IS 'ID de la actividad/reunión';
COMMENT ON COLUMN asistencia_sheets.spreadsheet_id IS 'ID del spreadsheet de Google Sheets';
COMMENT ON COLUMN asistencia_sheets.carpeta_mes_id IS 'ID de la carpeta del mes (ENERO, FEBRERO, etc.)';
COMMENT ON COLUMN asistencia_sheets.carpeta_fecha_id IS 'ID de la carpeta de la fecha (14 DIC, 21 DIC, etc.)';
COMMENT ON COLUMN asistencia_sheets.nombre_archivo IS 'Nombre del archivo Excel';
COMMENT ON COLUMN asistencia_sheets.fecha_reunion IS 'Fecha de la reunión';
