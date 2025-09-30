-- 🔧 Script para arreglar esquema de Supabase
-- Añadir columnas faltantes que están causando errores 500

-- ===== TABLA PAGINAS =====
-- Añadir columna orden_menu si no existe
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS orden_menu INTEGER DEFAULT 0;

-- Añadir otras columnas que pueden faltar
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS mostrar_en_menu BOOLEAN DEFAULT false;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS permite_comentarios BOOLEAN DEFAULT false;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS resumen TEXT;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS imagen_destacada TEXT;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'publicada';
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'pagina';

-- ===== TABLA UPLOADED_FILES =====
-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER DEFAULT 0,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Añadir columnas si faltan
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- ===== TABLA DOCUMENTOS =====
-- Añadir columnas faltantes
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ===== TABLA USUARIOS =====
-- Añadir columnas que pueden faltar
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ===== ÍNDICES PARA MEJORAR RENDIMIENTO =====
CREATE INDEX IF NOT EXISTS idx_paginas_visible ON paginas(visible);
CREATE INDEX IF NOT EXISTS idx_paginas_seccion ON paginas(seccion);
CREATE INDEX IF NOT EXISTS idx_paginas_orden_menu ON paginas(orden_menu);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploaded_by ON uploaded_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- ===== VERIFICACIÓN =====
-- Verificar que las tablas existen y tienen las columnas correctas
SELECT
    'paginas' as tabla,
    COUNT(*) as registros
FROM paginas
UNION ALL
SELECT
    'usuarios' as tabla,
    COUNT(*) as registros
FROM usuarios
UNION ALL
SELECT
    'secciones' as tabla,
    COUNT(*) as registros
FROM secciones
UNION ALL
SELECT
    'uploaded_files' as tabla,
    COUNT(*) as registros
FROM uploaded_files;

-- Mensaje de confirmación
SELECT 'Schema actualizado correctamente - ' || CURRENT_TIMESTAMP as mensaje;