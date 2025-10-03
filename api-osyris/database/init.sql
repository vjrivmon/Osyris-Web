-- 🏕️ OSYRIS SCOUT MANAGEMENT - ESQUEMA POSTGRESQL LOCAL
-- Script de inicialización para PostgreSQL en Hetzner
-- Fecha: 2025-10-03

-- ========================================
-- TABLA: secciones
-- ========================================
CREATE TABLE IF NOT EXISTS secciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  edad_minima INTEGER,
  edad_maxima INTEGER,
  color_principal VARCHAR(7),
  color_secundario VARCHAR(7),
  logo_url TEXT,
  activa BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: usuarios
-- ========================================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  contraseña VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'scouter', 'familia', 'educando')),
  seccion_id INTEGER REFERENCES secciones(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP,
  foto_perfil TEXT,
  fecha_nacimiento DATE,
  direccion TEXT,
  dni VARCHAR(20)
);

-- ========================================
-- TABLA: paginas
-- ========================================
CREATE TABLE IF NOT EXISTS paginas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  contenido TEXT,
  seccion VARCHAR(100),
  categoria VARCHAR(100),
  imagen_principal TEXT,
  imagenes_galeria TEXT,
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  meta_descripcion TEXT,
  actualizado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: documentos
-- ========================================
CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  archivo_nombre VARCHAR(255),
  archivo_ruta TEXT,
  tipo_archivo VARCHAR(100),
  tamaño_archivo BIGINT,
  categoria VARCHAR(100),
  visible_para VARCHAR(50) DEFAULT 'todos',
  subido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descargas INTEGER DEFAULT 0,
  version VARCHAR(20)
);

-- ========================================
-- TABLA: actividades
-- ========================================
CREATE TABLE IF NOT EXISTS actividades (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  lugar VARCHAR(255),
  tipo VARCHAR(100),
  seccion_id INTEGER REFERENCES secciones(id) ON DELETE CASCADE,
  responsable_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  cupo_maximo INTEGER,
  precio DECIMAL(10,2),
  inscripcion_abierta BOOLEAN DEFAULT false,
  material_necesario TEXT,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  estado VARCHAR(50) DEFAULT 'planificada'
);

-- ========================================
-- TABLA: mensajes
-- ========================================
CREATE TABLE IF NOT EXISTS mensajes (
  id SERIAL PRIMARY KEY,
  asunto VARCHAR(255),
  contenido TEXT NOT NULL,
  remitente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_destinatario VARCHAR(50),
  destinatario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  seccion_id INTEGER REFERENCES secciones(id) ON DELETE CASCADE,
  leido BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP,
  prioridad VARCHAR(20) DEFAULT 'normal',
  archivo_adjunto TEXT
);

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_seccion ON usuarios(seccion_id);

CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug);
CREATE INDEX IF NOT EXISTS idx_paginas_visible ON paginas(visible);
CREATE INDEX IF NOT EXISTS idx_paginas_categoria ON paginas(categoria);

CREATE INDEX IF NOT EXISTS idx_actividades_fecha ON actividades(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_actividades_seccion ON actividades(seccion_id);
CREATE INDEX IF NOT EXISTS idx_actividades_estado ON actividades(estado);

CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes(leido);

CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_subido_por ON documentos(subido_por);

-- ========================================
-- DATOS INICIALES: SECCIONES
-- ========================================
INSERT INTO secciones (nombre, descripcion, edad_minima, edad_maxima, color_principal, color_secundario, orden)
VALUES
  ('Castores', 'Colonia La Veleta - Para niños de 5 a 7 años', 5, 7, '#FF6B35', '#4A90E2', 1),
  ('Lobatos', 'Manada Waingunga - Para niños de 7 a 10 años', 7, 10, '#FFD93D', '#6BCF7F', 2),
  ('Tropa', 'Tropa Brownsea - Para jóvenes de 10 a 13 años', 10, 13, '#6BCF7F', '#FFFFFF', 3),
  ('Pioneros', 'Posta Kanhiwara - Para adolescentes de 13 a 16 años', 13, 16, '#E74C3C', '#FFFFFF', 4),
  ('Rutas', 'Ruta Walhalla - Para jóvenes de 16 a 19 años', 16, 19, '#2E7D32', '#FFFFFF', 5)
ON CONFLICT DO NOTHING;

-- ========================================
-- USUARIO ADMINISTRADOR POR DEFECTO
-- ========================================
-- Email: admin@grupoosyris.es
-- Contraseña: admin123
INSERT INTO usuarios (nombre, apellidos, email, contraseña, rol, activo)
VALUES (
  'Admin',
  'Sistema',
  'admin@grupoosyris.es',
  '$2b$10$Q7HqR7NfUbC7FZU7aYPdH.WqFm5dP3vMHXfBxKG5x/JmGxO7w5/h.',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_paginas_updated_at
  BEFORE UPDATE ON paginas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ========================================
-- COMENTARIOS EN TABLAS
-- ========================================
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema Osyris';
COMMENT ON TABLE secciones IS 'Secciones scout del grupo';
COMMENT ON TABLE paginas IS 'Páginas de contenido del CMS';
COMMENT ON TABLE documentos IS 'Archivos y documentos subidos';
COMMENT ON TABLE actividades IS 'Actividades y eventos scout';
COMMENT ON TABLE mensajes IS 'Sistema de mensajería interna';
