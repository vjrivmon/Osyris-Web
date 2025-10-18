-- Migración para añadir sistema de invitaciones a la tabla usuarios
-- Ejecutar: psql -h 116.203.98.142 -U root -d osyris_db -f add_invitation_system.sql

-- Añadir columnas para el sistema de invitaciones
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires_at TIMESTAMP;

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_usuarios_invitation_token ON usuarios(invitation_token);
CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON usuarios(google_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_password_token ON usuarios(reset_password_token);

-- Actualizar usuarios existentes para que usen autenticación por email por defecto
UPDATE usuarios SET auth_provider = 'email' WHERE auth_provider IS NULL;

-- Crear tabla para registro de actividad de usuarios (logs opcionales)
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para tokens de sesión (opcional, para manejar múltiples dispositivos)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info TEXT,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para las nuevas tablas
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Insertar algunas actividades de ejemplo para el admin existente
INSERT INTO user_activity_logs (user_id, action, description)
SELECT id, 'account_created', 'Cuenta creada por administrador del sistema'
FROM usuarios
WHERE rol = 'admin' AND NOT EXISTS (
    SELECT 1 FROM user_activity_logs WHERE user_id = usuarios.id AND action = 'account_created'
);

-- Confirmar cambios
SELECT 'Migración del sistema de invitaciones completada exitosamente' as status;