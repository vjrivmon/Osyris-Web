-- ========================================
-- MIGRACIÓN: Sistema de Calendario Completo
-- Fecha: 2025-12-12
-- Descripción: Extiende actividades y añade tablas para gestión de calendario
-- ========================================

-- ========================================
-- 1. EXTENDER TABLA ACTIVIDADES
-- ========================================

-- Añadir columnas nuevas a actividades
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS hora_inicio TIME;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS hora_fin TIME;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS visibilidad VARCHAR(20) DEFAULT 'todos'
  CHECK (visibilidad IN ('todos', 'familias', 'kraal'));
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS requiere_confirmacion BOOLEAN DEFAULT true;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS requiere_inscripcion BOOLEAN DEFAULT false;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS fecha_limite_inscripcion DATE;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS documentos_drive JSONB DEFAULT '[]'::jsonb;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS ronda_id INTEGER;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS cancelado BOOLEAN DEFAULT false;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;

-- Actualizar el CHECK constraint de tipo para incluir nuevos tipos
ALTER TABLE actividades DROP CONSTRAINT IF EXISTS actividades_tipo_check;
ALTER TABLE actividades ADD CONSTRAINT actividades_tipo_check
  CHECK (tipo IN (
    'reunion_sabado',
    'campamento',
    'salida',
    'excursion',
    'evento_especial',
    'asamblea',
    'festivo',
    'consejo_grupo',
    'reunion_kraal',
    'formacion',
    'otro'
  ));

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_actividades_visibilidad ON actividades(visibilidad);
CREATE INDEX IF NOT EXISTS idx_actividades_ronda_id ON actividades(ronda_id);
CREATE INDEX IF NOT EXISTS idx_actividades_cancelado ON actividades(cancelado);
CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON actividades(tipo);
CREATE INDEX IF NOT EXISTS idx_actividades_requiere_confirmacion ON actividades(requiere_confirmacion);

-- ========================================
-- 2. TABLA: configuracion_ronda
-- ========================================
CREATE TABLE IF NOT EXISTS configuracion_ronda (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,                -- Ej: "Ronda Solar 2025-2026"
  fecha_inicio DATE NOT NULL,                  -- Ej: 2025-09-01
  fecha_fin DATE NOT NULL,                     -- Ej: 2026-08-31
  eventos_plantilla JSONB NOT NULL,            -- JSON con todos los eventos de la ronda
  activa BOOLEAN DEFAULT false,                -- Solo una ronda puede estar activa
  creado_por INTEGER REFERENCES usuarios(id),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solo una ronda activa a la vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_ronda_unica_activa ON configuracion_ronda(activa) WHERE activa = true;

-- ========================================
-- 3. TABLA: inscripciones_campamento
-- ========================================
CREATE TABLE IF NOT EXISTS inscripciones_campamento (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  educando_id INTEGER NOT NULL REFERENCES educandos(id) ON DELETE CASCADE,
  familiar_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Estado de inscripción
  estado VARCHAR(30) DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'inscrito', 'no_asiste', 'lista_espera', 'cancelado')),

  -- Datos de salud (copiados/actualizados desde ficha médica)
  alergias TEXT,
  intolerancias TEXT,
  dieta_especial TEXT,
  medicacion TEXT,
  observaciones_medicas TEXT,

  -- Datos de contacto para el campamento
  telefono_emergencia VARCHAR(20),
  persona_emergencia VARCHAR(200),

  -- Observaciones adicionales del familiar
  observaciones TEXT,

  -- Confirmación de datos
  datos_confirmados BOOLEAN DEFAULT false,
  fecha_confirmacion_datos TIMESTAMP,

  -- Pago
  pagado BOOLEAN DEFAULT false,
  fecha_pago TIMESTAMP,
  metodo_pago VARCHAR(50),
  referencia_pago VARCHAR(100),

  -- Control
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_por INTEGER REFERENCES usuarios(id),

  -- Única inscripción por educando por actividad
  UNIQUE(actividad_id, educando_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_inscripciones_campamento_actividad ON inscripciones_campamento(actividad_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_campamento_educando ON inscripciones_campamento(educando_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_campamento_familiar ON inscripciones_campamento(familiar_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_campamento_estado ON inscripciones_campamento(estado);
CREATE INDEX IF NOT EXISTS idx_inscripciones_campamento_pagado ON inscripciones_campamento(pagado);

-- ========================================
-- 4. ACTUALIZAR CONFIRMACIONES_ASISTENCIA
-- ========================================
-- Añadir columnas adicionales si no existen
ALTER TABLE confirmaciones_asistencia ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente'
  CHECK (estado IN ('confirmado', 'pendiente', 'no_asiste'));
ALTER TABLE confirmaciones_asistencia ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Migrar datos existentes: asistira -> estado
UPDATE confirmaciones_asistencia
SET estado = CASE
  WHEN asistira = true THEN 'confirmado'
  WHEN asistira = false THEN 'no_asiste'
  ELSE 'pendiente'
END
WHERE estado IS NULL OR estado = 'pendiente';

-- Índice para estado
CREATE INDEX IF NOT EXISTS idx_confirmaciones_asistencia_estado ON confirmaciones_asistencia(estado);

-- ========================================
-- 5. TRIGGERS DE ACTUALIZACIÓN
-- ========================================
CREATE OR REPLACE FUNCTION update_inscripcion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inscripciones_campamento_timestamp ON inscripciones_campamento;
CREATE TRIGGER update_inscripciones_campamento_timestamp
  BEFORE UPDATE ON inscripciones_campamento
  FOR EACH ROW
  EXECUTE FUNCTION update_inscripcion_timestamp();

DROP TRIGGER IF EXISTS update_configuracion_ronda_timestamp ON configuracion_ronda;
CREATE TRIGGER update_configuracion_ronda_timestamp
  BEFORE UPDATE ON configuracion_ronda
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 6. FUNCIÓN PARA GENERAR EVENTOS DE RONDA
-- ========================================
CREATE OR REPLACE FUNCTION generar_actividades_desde_ronda(p_ronda_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_ronda RECORD;
  v_evento JSONB;
  v_count INTEGER := 0;
BEGIN
  -- Obtener la ronda
  SELECT * INTO v_ronda FROM configuracion_ronda WHERE id = p_ronda_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ronda no encontrada: %', p_ronda_id;
  END IF;

  -- Iterar sobre los eventos de la plantilla
  FOR v_evento IN SELECT * FROM jsonb_array_elements(v_ronda.eventos_plantilla)
  LOOP
    INSERT INTO actividades (
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      lugar,
      tipo,
      seccion_id,
      visibilidad,
      requiere_confirmacion,
      requiere_inscripcion,
      precio,
      ronda_id,
      estado,
      metadata
    ) VALUES (
      v_evento->>'titulo',
      v_evento->>'descripcion',
      (v_evento->>'fecha_inicio')::TIMESTAMP,
      (v_evento->>'fecha_fin')::TIMESTAMP,
      (v_evento->>'hora_inicio')::TIME,
      (v_evento->>'hora_fin')::TIME,
      v_evento->>'lugar',
      v_evento->>'tipo',
      (v_evento->>'seccion_id')::INTEGER,
      COALESCE(v_evento->>'visibilidad', 'todos'),
      COALESCE((v_evento->>'requiere_confirmacion')::BOOLEAN, true),
      COALESCE((v_evento->>'requiere_inscripcion')::BOOLEAN, false),
      (v_evento->>'precio')::DECIMAL,
      p_ronda_id,
      'planificada',
      COALESCE(v_evento->'metadata', '{}'::jsonb)
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. VISTAS ÚTILES
-- ========================================

-- Vista de actividades con contador de confirmaciones
CREATE OR REPLACE VIEW v_actividades_con_confirmaciones AS
SELECT
  a.*,
  s.nombre as seccion_nombre,
  COALESCE(conf.confirmados, 0) as total_confirmados,
  COALESCE(conf.no_asisten, 0) as total_no_asisten,
  COALESCE(conf.pendientes, 0) as total_pendientes
FROM actividades a
LEFT JOIN secciones s ON a.seccion_id = s.id
LEFT JOIN (
  SELECT
    actividad_id,
    COUNT(*) FILTER (WHERE estado = 'confirmado') as confirmados,
    COUNT(*) FILTER (WHERE estado = 'no_asiste') as no_asisten,
    COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
  FROM confirmaciones_asistencia
  GROUP BY actividad_id
) conf ON a.id = conf.actividad_id;

-- Vista de inscripciones de campamento con datos de educando
CREATE OR REPLACE VIEW v_inscripciones_campamento_detalle AS
SELECT
  ic.*,
  e.nombre as educando_nombre,
  e.apellidos as educando_apellidos,
  e.fecha_nacimiento as educando_fecha_nacimiento,
  s.nombre as seccion_nombre,
  a.titulo as actividad_titulo,
  a.fecha_inicio as actividad_fecha,
  u.nombre as familiar_nombre,
  u.apellidos as familiar_apellidos,
  u.email as familiar_email
FROM inscripciones_campamento ic
JOIN educandos e ON ic.educando_id = e.id
JOIN secciones s ON e.seccion_id = s.id
JOIN actividades a ON ic.actividad_id = a.id
JOIN usuarios u ON ic.familiar_id = u.id;

-- ========================================
-- 8. COMENTARIOS
-- ========================================
COMMENT ON TABLE configuracion_ronda IS 'Configuración de la ronda scout con plantilla de eventos';
COMMENT ON TABLE inscripciones_campamento IS 'Inscripciones de educandos a campamentos con datos de salud';
COMMENT ON COLUMN actividades.visibilidad IS 'Quién puede ver el evento: todos, familias, kraal';
COMMENT ON COLUMN actividades.documentos_drive IS 'JSON con links a documentos en Google Drive';
COMMENT ON COLUMN actividades.metadata IS 'Datos adicionales específicos del tipo de evento';
COMMENT ON COLUMN configuracion_ronda.eventos_plantilla IS 'JSON array con todos los eventos de la ronda para generar automáticamente';

-- ========================================
-- MIGRACIÓN COMPLETADA
-- ========================================
