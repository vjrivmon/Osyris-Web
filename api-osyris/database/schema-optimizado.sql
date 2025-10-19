-- 🏕️ OSYRIS SCOUT MANAGEMENT - ESQUEMA POSTGRESQL OPTIMIZADO
-- Versión optimizada sin CMS dinámico y con estructura simplificada
-- Fecha: 2025-10-18
-- Cambios: Eliminación de tablas deprecadas y simplificación de estructura

-- ========================================
-- TABLA: secciones (VERS_OPTIMIZADA)
-- ========================================
DROP TABLE IF EXISTS secciones CASCADE;
CREATE TABLE secciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  edad_minima INTEGER,
  edad_maxima INTEGER,
  logo_url TEXT
);

-- ========================================
-- TABLA: usuarios (VERS_OPTIMIZADA)
-- ========================================
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
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
  direccion TEXT
);

-- ========================================
-- TABLA: actividades (SIN CAMBIOS)
-- ========================================
DROP TABLE IF EXISTS actividades CASCADE;
CREATE TABLE actividades (
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
-- TABLA: mensajes (SIN CAMBIOS)
-- ========================================
DROP TABLE IF EXISTS mensajes CASCADE;
CREATE TABLE mensajes (
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
-- TABLA: audit_log (SIN CAMBIOS)
-- ========================================
DROP TABLE IF EXISTS audit_log CASCADE;
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL,
  entidad_tipo VARCHAR(50),
  entidad_id INTEGER,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  sesion_id VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_seccion ON usuarios(seccion_id);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

CREATE INDEX idx_secciones_nombre ON secciones(nombre);

CREATE INDEX idx_actividades_fecha ON actividades(fecha_inicio);
CREATE INDEX idx_actividades_seccion ON actividades(seccion_id);
CREATE INDEX idx_actividades_estado ON actividades(estado);
CREATE INDEX idx_actividades_responsable ON actividades(responsable_id);

CREATE INDEX idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX idx_mensajes_leido ON mensajes(leido);
CREATE INDEX idx_mensajes_seccion ON mensajes(seccion_id);

CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_entidad ON audit_log(entidad_tipo, entidad_id);
CREATE INDEX idx_audit_timestamp ON audit_log("timestamp" DESC);

-- ========================================
-- DATOS INICIALES: SECCIONES (ACTUALIZADOS)
-- ========================================
INSERT INTO secciones (nombre, descripcion, edad_minima, edad_maxima, logo_url)
VALUES
  ('Castores', 'Colonia La Veleta - Para niños de 5 a 7 años', 5, 7, NULL),
  ('Manada', 'Manada Waingunga - Para niños de 7 a 10 años', 7, 10, NULL),
  ('Tropa', 'Tropa Brownsea - Para jóvenes de 10 a 13 años', 10, 13, NULL),
  ('Pioneros', 'Posta Kanhiwara - Para adolescentes de 13 a 16 años', 13, 16, NULL),
  ('Rutas', 'Ruta Walhalla - Para jóvenes de 16 a 19 años', 16, 19, NULL)
ON CONFLICT (nombre) DO NOTHING;

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
-- COMENTARIOS EN TABLAS
-- ========================================
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema Osyris - Versión optimizada';
COMMENT ON TABLE secciones IS 'Secciones scout del grupo - Versión simplificada';
COMMENT ON TABLE actividades IS 'Actividades y eventos scout';
COMMENT ON TABLE mensajes IS 'Sistema de mensajería interna';
COMMENT ON TABLE audit_log IS 'Log de auditoría de acciones del sistema';

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de usuarios con información de sección
CREATE OR REPLACE VIEW v_usuarios_con_seccion AS
SELECT
    u.id,
    u.nombre,
    u.apellidos,
    u.email,
    u.rol,
    u.activo,
    u.fecha_registro,
    u.ultimo_acceso,
    s.nombre as nombre_seccion,
    s.edad_minima as edad_minima_seccion,
    s.edad_maxima as edad_maxima_seccion
FROM usuarios u
LEFT JOIN secciones s ON u.seccion_id = s.id;

-- Vista de actividades con información completa
CREATE OR REPLACE VIEW v_actividades_completas AS
SELECT
    a.id,
    a.titulo,
    a.descripcion,
    a.fecha_inicio,
    a.fecha_fin,
    a.lugar,
    a.tipo,
    a.estado,
    a.inscripcion_abierta,
    a.cupo_maximo,
    a.precio,
    a.fecha_creacion,
    s.nombre as nombre_seccion,
    u_responsable.nombre || ' ' || u_responsable.apellidos as responsable_nombre,
    u_creador.nombre || ' ' || u_creador.apellidos as creador_nombre
FROM actividades a
LEFT JOIN secciones s ON a.seccion_id = s.id
LEFT JOIN usuarios u_responsable ON a.responsable_id = u_responsable.id
LEFT JOIN usuarios u_creador ON a.creado_por = u_creador.id;

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para obtener estadísticas del sistema
CREATE OR REPLACE FUNCTION f_estadisticas_sistema()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_usuarios', (SELECT COUNT(*) FROM usuarios WHERE activo = true),
        'total_secciones', (SELECT COUNT(*) FROM secciones),
        'total_actividades', (SELECT COUNT(*) FROM actividades),
        'actividades_proximas', (SELECT COUNT(*) FROM actividades WHERE fecha_inicio >= CURRENT_DATE),
        'mensajes_no_leidos', (SELECT COUNT(*) FROM mensajes WHERE leido = false),
        'ultimo_registro', (SELECT MAX(fecha_registro) FROM usuarios)
    ) INTO stats;

    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger para actualizar ultimo_acceso al hacer login
CREATE OR REPLACE FUNCTION f_actualizar_ultimo_acceso()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usuarios
    SET ultimo_acceso = CURRENT_TIMESTAMP
    WHERE id = NEW.usuario_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NOTA: Los triggers para contenido_editable y paginas han sido eliminados
-- ya que esas tablas ya no existen en esta versión optimizada

-- ========================================
-- PERMISOS Y SEGURIDAD
-- ========================================

-- Crear rol de solo lectura para reportes
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'osyris_readonly') THEN
        CREATE ROLE osyris_readonly;
    END IF;
END
$$;

-- Otorgar permisos de solo lectura
GRANT SELECT ON ALL TABLES IN SCHEMA public TO osyris_readonly;

-- Crear rol para monitores (scouters)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'osyris_scouter') THEN
        CREATE ROLE osyris_scouter;
    END IF;
END
$$;

-- Permisos limitados para monitores
GRANT SELECT ON secciones, usuarios, actividades, mensajes TO osyris_scouter;
GRANT INSERT, UPDATE ON actividades, mensajes TO osyris_scouter;

-- ========================================
-- VALIDACIONES Y CHECK CONSTRAINTS ADICIONALES
-- ========================================

-- Validar que las fechas de actividad sean lógicas
ALTER TABLE actividades
ADD CONSTRAINT chk_fechas_logicas
CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio);

-- Validar rangos de edad en secciones
ALTER TABLE secciones
ADD CONSTRAINT chk_rango_edad
CHECK (edad_minima IS NULL OR edad_maxima IS NULL OR edad_maxima > edad_minima);

-- Validar que los cupos sean positivos
ALTER TABLE actividades
ADD CONSTRAINT chk_cupo_positivo
CHECK (cupo_maximo IS NULL OR cupo_maximo > 0);

-- ========================================
-- INDICACIONES DE MANTENIMIENTO
-- ========================================

-- Esta es una versión optimizada que elimina:
-- 1. Tablas de CMS dinámico (contenido_editable, contenido_historial, paginas)
-- 2. Tabla de documentos (será reemplazada por Google Drive)
-- 3. Campos innecesarios en usuarios (dni)
-- 4. Campos innecesarios en secciones (color_principal, color_secundario, activa, orden, fecha_creacion)

-- Mantenimiento recomendado:
-- - Ejecutar VACUUM ANALYZE mensualmente
-- - Monitorear tamaño de tablas de auditoría
-- - Considerar particionamiento de tabla audit_log si crece mucho