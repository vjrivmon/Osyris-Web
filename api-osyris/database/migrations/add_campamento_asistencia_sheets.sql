-- Migración: Sistema de Asistencia por Sección para Campamentos
-- Fecha: 2025-12-15
-- Descripción: Tabla para relacionar campamentos con sus spreadsheets de asistencia por sección

-- Tabla para relacionar campamentos con sus spreadsheets de asistencia
CREATE TABLE IF NOT EXISTS campamento_asistencia_sheets (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  spreadsheet_id VARCHAR(100) NOT NULL,
  carpeta_campamento_id VARCHAR(100) NOT NULL,
  nombre_archivo VARCHAR(200) NOT NULL,
  tipo_campamento VARCHAR(50) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(actividad_id)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_camp_asist_sheets_actividad ON campamento_asistencia_sheets(actividad_id);
CREATE INDEX IF NOT EXISTS idx_camp_asist_sheets_spreadsheet ON campamento_asistencia_sheets(spreadsheet_id);
CREATE INDEX IF NOT EXISTS idx_camp_asist_sheets_tipo ON campamento_asistencia_sheets(tipo_campamento);

-- Comentarios descriptivos
COMMENT ON TABLE campamento_asistencia_sheets IS 'Relación entre campamentos y sus spreadsheets de asistencia por sección';
COMMENT ON COLUMN campamento_asistencia_sheets.actividad_id IS 'ID del campamento (actividad tipo campamento)';
COMMENT ON COLUMN campamento_asistencia_sheets.spreadsheet_id IS 'ID del spreadsheet de Google Sheets';
COMMENT ON COLUMN campamento_asistencia_sheets.carpeta_campamento_id IS 'ID de la carpeta del campamento (NAVIDAD, INICIO, etc.)';
COMMENT ON COLUMN campamento_asistencia_sheets.nombre_archivo IS 'Nombre del archivo Excel';
COMMENT ON COLUMN campamento_asistencia_sheets.tipo_campamento IS 'Tipo de campamento (INICIO, NAVIDAD, ANIVERSARIO, PASCUA, VERANO)';
