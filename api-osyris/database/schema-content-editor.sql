-- =====================================================
-- OSYRIS CONTENT EDITOR - DATABASE SCHEMA
-- Sistema de edición de contenido en vivo
-- =====================================================

-- Tabla principal de contenido editable
CREATE TABLE IF NOT EXISTS contenido_editable (
  id SERIAL PRIMARY KEY,
  seccion VARCHAR(100) NOT NULL,              -- 'castores', 'home', 'contacto', 'sobre-nosotros'
  identificador VARCHAR(200) NOT NULL,        -- 'hero-titulo', 'hero-imagen', 'actividades-lista'
  tipo VARCHAR(50) NOT NULL,                  -- 'texto', 'imagen', 'html', 'lista', 'json'

  -- Contenido en diferentes formatos
  contenido_texto TEXT,                       -- Para texto plano
  contenido_html TEXT,                        -- Para contenido HTML rico
  contenido_json JSONB,                       -- Para estructuras complejas (arrays, objetos)
  url_archivo VARCHAR(500),                   -- Para imágenes, PDFs, documentos

  -- Metadata adicional
  metadata JSONB DEFAULT '{}',                -- {alt, width, height, caption, etc.}

  -- Control de versiones
  version INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT true,

  -- Auditoría
  creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  modificado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraint único por sección e identificador
  UNIQUE(seccion, identificador)
);

-- Tabla de historial de versiones
CREATE TABLE IF NOT EXISTS contenido_historial (
  id SERIAL PRIMARY KEY,
  contenido_id INTEGER REFERENCES contenido_editable(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,

  -- Snapshot completo del contenido anterior
  contenido_anterior JSONB NOT NULL,

  -- Auditoría del cambio
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(50) NOT NULL,                -- 'crear', 'editar', 'restaurar', 'eliminar'
  comentario TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de auditoría general del sistema
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Información de la acción
  accion VARCHAR(100) NOT NULL,              -- 'editar_contenido', 'subir_imagen', 'rollback', 'login', etc.
  entidad_tipo VARCHAR(50),                  -- 'contenido', 'imagen', 'usuario', 'pagina'
  entidad_id INTEGER,

  -- Datos del cambio
  datos_anteriores JSONB,
  datos_nuevos JSONB,

  -- Información de contexto
  ip_address VARCHAR(50),
  user_agent TEXT,
  sesion_id VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para contenido_editable
CREATE INDEX IF NOT EXISTS idx_contenido_seccion ON contenido_editable(seccion);
CREATE INDEX IF NOT EXISTS idx_contenido_tipo ON contenido_editable(tipo);
CREATE INDEX IF NOT EXISTS idx_contenido_activo ON contenido_editable(activo);
CREATE INDEX IF NOT EXISTS idx_contenido_modificado ON contenido_editable(fecha_modificacion DESC);

-- Índices para contenido_historial
CREATE INDEX IF NOT EXISTS idx_historial_contenido ON contenido_historial(contenido_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON contenido_historial(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON contenido_historial(fecha_cambio DESC);

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_accion ON audit_log(accion);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para auto-actualizar fecha_modificacion
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_modificacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_modificacion automáticamente
DROP TRIGGER IF EXISTS trigger_update_contenido_timestamp ON contenido_editable;
CREATE TRIGGER trigger_update_contenido_timestamp
  BEFORE UPDATE ON contenido_editable
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_timestamp();

-- Función para crear snapshot en historial antes de actualizar
CREATE OR REPLACE FUNCTION create_content_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear snapshot si realmente hubo cambios en el contenido
  IF (OLD.contenido_texto IS DISTINCT FROM NEW.contenido_texto) OR
     (OLD.contenido_html IS DISTINCT FROM NEW.contenido_html) OR
     (OLD.contenido_json IS DISTINCT FROM NEW.contenido_json) OR
     (OLD.url_archivo IS DISTINCT FROM NEW.url_archivo) THEN

    INSERT INTO contenido_historial (
      contenido_id,
      version,
      contenido_anterior,
      usuario_id,
      accion
    ) VALUES (
      OLD.id,
      OLD.version,
      jsonb_build_object(
        'contenido_texto', OLD.contenido_texto,
        'contenido_html', OLD.contenido_html,
        'contenido_json', OLD.contenido_json,
        'url_archivo', OLD.url_archivo,
        'metadata', OLD.metadata
      ),
      NEW.modificado_por,
      'editar'
    );

    -- Incrementar versión
    NEW.version = OLD.version + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear snapshot automático
DROP TRIGGER IF EXISTS trigger_create_content_snapshot ON contenido_editable;
CREATE TRIGGER trigger_create_content_snapshot
  BEFORE UPDATE ON contenido_editable
  FOR EACH ROW
  EXECUTE FUNCTION create_content_snapshot();

-- =====================================================
-- DATOS INICIALES / SEED
-- =====================================================

-- Insertar contenido inicial de ejemplo (se puede eliminar después de migración)
-- INSERT INTO contenido_editable (seccion, identificador, tipo, contenido_texto, creado_por, modificado_por)
-- VALUES
--   ('home', 'hero-titulo', 'texto', 'Bienvenidos al Grupo Scout Osyris', 1, 1),
--   ('home', 'hero-descripcion', 'texto', 'Educación en valores desde 1985', 1, 1);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para obtener contenido con información del último editor
CREATE OR REPLACE VIEW v_contenido_con_editor AS
SELECT
  c.id,
  c.seccion,
  c.identificador,
  c.tipo,
  c.contenido_texto,
  c.contenido_html,
  c.contenido_json,
  c.url_archivo,
  c.metadata,
  c.version,
  c.activo,
  c.fecha_modificacion,
  u.nombre || ' ' || u.apellidos AS ultimo_editor,
  u.email AS email_editor
FROM contenido_editable c
LEFT JOIN usuarios u ON c.modificado_por = u.id
WHERE c.activo = true
ORDER BY c.fecha_modificacion DESC;

-- Vista para estadísticas de ediciones
CREATE OR REPLACE VIEW v_estadisticas_ediciones AS
SELECT
  DATE(h.fecha_cambio) AS fecha,
  u.nombre || ' ' || u.apellidos AS usuario,
  COUNT(*) AS total_ediciones,
  COUNT(DISTINCT h.contenido_id) AS contenidos_editados
FROM contenido_historial h
LEFT JOIN usuarios u ON h.usuario_id = u.id
GROUP BY DATE(h.fecha_cambio), u.id, u.nombre, u.apellidos
ORDER BY fecha DESC;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE contenido_editable IS 'Almacena todo el contenido editable del sitio web';
COMMENT ON TABLE contenido_historial IS 'Historial completo de versiones para rollback';
COMMENT ON TABLE audit_log IS 'Log de auditoría de todas las acciones del sistema';

COMMENT ON COLUMN contenido_editable.seccion IS 'Página o sección donde aparece el contenido';
COMMENT ON COLUMN contenido_editable.identificador IS 'ID único del elemento dentro de la sección';
COMMENT ON COLUMN contenido_editable.tipo IS 'Tipo de contenido: texto, imagen, html, lista, json';
COMMENT ON COLUMN contenido_editable.metadata IS 'Metadatos adicionales en formato JSON (alt, width, etc.)';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
