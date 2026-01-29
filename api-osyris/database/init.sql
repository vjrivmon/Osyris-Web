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
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'scouter', 'familia', 'educando', 'comite')),
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
-- Email: web.osyris@gmail.com
-- Contraseña: Admin123#
INSERT INTO usuarios (nombre, apellidos, email, contraseña, rol, activo)
VALUES (
  'Admin',
  'Sistema',
  'web.osyris@gmail.com',
  '$2a$10$txlIjy4ud5uhxksWdAEYfepFStQaxmImQ/tSukaYXN4yh9A2o/fJ6',
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
-- TABLA: educandos (scouts/niños del grupo)
-- ========================================
CREATE TABLE IF NOT EXISTS educandos (
  id SERIAL PRIMARY KEY,

  -- Datos básicos
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  fecha_nacimiento DATE NOT NULL,

  -- Identificación
  dni VARCHAR(20) UNIQUE,
  pasaporte VARCHAR(50),

  -- Contacto
  direccion TEXT,
  codigo_postal VARCHAR(10),
  municipio VARCHAR(100),
  telefono_casa VARCHAR(20),
  telefono_movil VARCHAR(20),
  email VARCHAR(100),

  -- Salud
  alergias TEXT,
  notas_medicas TEXT,

  -- Scout
  seccion_id INTEGER NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
  foto_perfil TEXT,
  activo BOOLEAN DEFAULT true,

  -- Notas generales
  notas TEXT,

  -- IDs externos (migración desde sistema anterior)
  id_externo INTEGER UNIQUE, -- ID del sistema anterior MEV

  -- Control
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_baja TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ========================================
-- TABLA: familiares_scouts (relación N:M)
-- ========================================
CREATE TABLE IF NOT EXISTS familiares_educandos (
  id SERIAL PRIMARY KEY,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  relacion VARCHAR(50) CHECK (relacion IN ('padre', 'madre', 'tutor_legal', 'abuelo', 'otro')),
  es_contacto_principal BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(familiar_id, educando_id)
);

-- ========================================
-- TABLA: documentos_familia
-- ========================================
CREATE TABLE IF NOT EXISTS documentos_familia (
  id SERIAL PRIMARY KEY,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  archivo_nombre VARCHAR(255),
  archivo_ruta TEXT,
  tipo_archivo VARCHAR(100),
  tamaño_archivo BIGINT,
  fecha_vencimiento DATE,
  estado VARCHAR(50) DEFAULT 'vigente' CHECK (estado IN ('vigente', 'por_vencer', 'vencido', 'pendiente')),
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aprobado BOOLEAN DEFAULT false,
  aprobado_por INTEGER REFERENCES usuarios(id)
);

-- ========================================
-- TABLA: notificaciones_familia
-- ========================================
CREATE TABLE IF NOT EXISTS notificaciones_familia (
  id SERIAL PRIMARY KEY,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('urgente', 'importante', 'informativo', 'recordatorio')),
  prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('alta', 'normal', 'baja')),
  categoria VARCHAR(100),
  leida BOOLEAN DEFAULT false,
  fecha_lectura TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP,
  enlace_accion VARCHAR(500),
  metadata JSONB
);

-- ========================================
-- TABLA: confirmaciones_asistencia
-- ========================================
CREATE TABLE IF NOT EXISTS confirmaciones_asistencia (
  id SERIAL PRIMARY KEY,
  actividad_id INTEGER REFERENCES actividades(id) ON DELETE CASCADE,
  familiar_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  educando_id INTEGER REFERENCES educandos(id) ON DELETE CASCADE,
  asistira BOOLEAN NOT NULL,
  comentarios TEXT,
  confirmado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmado_por INTEGER REFERENCES usuarios(id),
  UNIQUE(actividad_id, educando_id)
);

-- ========================================
-- TABLA: galeria_fotos_privada
-- ========================================
CREATE TABLE IF NOT EXISTS galeria_fotos_privada (
  id SERIAL PRIMARY KEY,
  album_id VARCHAR(100) NOT NULL,
  nombre_album VARCHAR(255) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  archivo_ruta TEXT NOT NULL,
  descripcion TEXT,
  fotografiado_ids INTEGER[], -- Array de IDs de scouts en la foto
  fecha_tomada DATE,
  evento_id INTEGER REFERENCES actividades(id) ON DELETE SET NULL,
  subido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  visible_para_familiares BOOLEAN DEFAULT true,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etiquetas VARCHAR(500)[]
);

-- ========================================
-- ÍNDICES PARA TABLA EDUCANDOS
-- ========================================
CREATE INDEX IF NOT EXISTS idx_educandos_nombre ON educandos(nombre);
CREATE INDEX IF NOT EXISTS idx_educandos_apellidos ON educandos(apellidos);
CREATE INDEX IF NOT EXISTS idx_educandos_dni ON educandos(dni);
CREATE INDEX IF NOT EXISTS idx_educandos_seccion_id ON educandos(seccion_id);
CREATE INDEX IF NOT EXISTS idx_educandos_activo ON educandos(activo);
CREATE INDEX IF NOT EXISTS idx_educandos_fecha_nacimiento ON educandos(fecha_nacimiento);
CREATE INDEX IF NOT EXISTS idx_educandos_id_externo ON educandos(id_externo);

-- ========================================
-- ÍNDICES ADICIONALES PARA TABLAS FAMILIARES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_familiares_educandos_familiar_id ON familiares_educandos(familiar_id);
CREATE INDEX IF NOT EXISTS idx_familiares_educandos_educando_id ON familiares_educandos(educando_id);
CREATE INDEX IF NOT EXISTS idx_familiares_educandos_relacion ON familiares_educandos(relacion);

CREATE INDEX IF NOT EXISTS idx_documentos_familia_educando_id ON documentos_familia(educando_id);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_familiar_id ON documentos_familia(familiar_id);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_tipo_documento ON documentos_familia(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_estado ON documentos_familia(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_familia_fecha_vencimiento ON documentos_familia(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_familiar_id ON notificaciones_familia(familiar_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_educando_id ON notificaciones_familia(educando_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_tipo ON notificaciones_familia(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_prioridad ON notificaciones_familia(prioridad);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_leida ON notificaciones_familia(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_familia_fecha_creacion ON notificaciones_familia(fecha_creacion);

CREATE INDEX IF NOT EXISTS idx_confirmaciones_asistencia_actividad_id ON confirmaciones_asistencia(actividad_id);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_asistencia_familiar_id ON confirmaciones_asistencia(familiar_id);
CREATE INDEX IF NOT EXISTS idx_confirmaciones_asistencia_educando_id ON confirmaciones_asistencia(educando_id);

CREATE INDEX IF NOT EXISTS idx_galeria_fotos_privada_album_id ON galeria_fotos_privada(album_id);
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_privada_evento_id ON galeria_fotos_privada(evento_id);
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_privada_fechatomada ON galeria_fotos_privada(fecha_tomada);
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_privada_visible_familiares ON galeria_fotos_privada(visible_para_familiares);
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_privada_fotografiado_ids ON galeria_fotos_privada USING GIN(fotografiado_ids);

-- ========================================
-- COMENTARIOS EN TABLAS
-- ========================================
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema Osyris (monitores, familiares, admin)';
COMMENT ON TABLE educandos IS 'Tabla de educandos/scouts del grupo (niños/jóvenes participantes)';
COMMENT ON TABLE secciones IS 'Secciones scout del grupo';
COMMENT ON TABLE paginas IS 'Páginas de contenido del CMS';
COMMENT ON TABLE documentos IS 'Archivos y documentos subidos';
COMMENT ON TABLE actividades IS 'Actividades y eventos scout';
COMMENT ON TABLE mensajes IS 'Sistema de mensajería interna';
COMMENT ON TABLE familiares_educandos IS 'Relación N:M entre familiares y educandos (un educando puede tener varios familiares)';
COMMENT ON TABLE documentos_familia IS 'Documentos específicos para familias (autorizaciones, informes médicos, etc.)';
COMMENT ON TABLE notificaciones_familia IS 'Notificaciones específicas para familiares sobre sus educandos';
COMMENT ON TABLE confirmaciones_asistencia IS 'Confirmaciones de asistencia de educandos a actividades';
COMMENT ON TABLE galeria_fotos_privada IS 'Galería de fotos privadas visible para familiares';
