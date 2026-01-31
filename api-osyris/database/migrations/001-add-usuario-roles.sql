-- Migration 001: Add usuario_roles table for multi-role support
-- A single user (same email) can have multiple roles (e.g., 'familia' + 'comite')

CREATE TABLE IF NOT EXISTS usuario_roles (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin','scouter','familia','educando','comite')),
  es_principal BOOLEAN DEFAULT false,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, rol)
);

CREATE INDEX IF NOT EXISTS idx_usuario_roles_usuario_id ON usuario_roles(usuario_id);

-- Populate from existing data (usuarios.rol remains for backwards compatibility)
INSERT INTO usuario_roles (usuario_id, rol, es_principal)
SELECT id, rol, true FROM usuarios WHERE rol IS NOT NULL
ON CONFLICT DO NOTHING;
