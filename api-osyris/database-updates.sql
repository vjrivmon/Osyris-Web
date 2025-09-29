-- 🏕️ ACTUALIZACIÓN BD PARA SISTEMA CMS
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar enum de roles para incluir super_admin
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('comite', 'kraal', 'scouter', 'familia', 'educando', 'super_admin'));

-- 2. Tabla para contenido editable de páginas
CREATE TABLE IF NOT EXISTS content_pages (
  id SERIAL PRIMARY KEY,
  page_name VARCHAR(100) NOT NULL UNIQUE,
  page_title VARCHAR(200),
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta_description TEXT,
  updated_by INTEGER REFERENCES usuarios(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT true
);

-- 3. Tabla para archivos subidos
CREATE TABLE IF NOT EXISTS uploaded_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES usuarios(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_type VARCHAR(50),
  file_size INTEGER,
  alt_text TEXT,
  folder VARCHAR(100) DEFAULT 'general'
);

-- 4. Tabla para configuración del sitio
CREATE TABLE IF NOT EXISTS site_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT,
  config_type VARCHAR(50) DEFAULT 'text', -- text, number, boolean, json
  description TEXT,
  updated_by INTEGER REFERENCES usuarios(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insertar contenido inicial de páginas
INSERT INTO content_pages (page_name, page_title, content_json) VALUES
-- Página de inicio
('home', 'Inicio - Grupo Scout Osyris', '{
  "hero": {
    "title": "Grupo Scout Osyris",
    "subtitle": "Educando para la vida desde 1985",
    "description": "Un lugar donde los jóvenes crecen, aprenden y se preparan para ser los líderes del mañana a través del método scout."
  },
  "sections": {
    "about": {
      "title": "Sobre Nosotros",
      "content": "El Grupo Scout Osyris es una comunidad educativa que, desde 1985, acompaña a niños, niñas y jóvenes en su crecimiento personal y social."
    },
    "values": {
      "title": "Nuestros Valores",
      "items": [
        "Respeto por la naturaleza",
        "Solidaridad y servicio",
        "Responsabilidad personal",
        "Convivencia y paz"
      ]
    }
  }
}'),

-- Páginas de secciones
('castores', 'Castores - Colonia La Veleta', '{
  "title": "Colonia La Veleta",
  "subtitle": "Castores (5-7 años)",
  "description": "Los más pequeños del grupo inician su aventura scout con juegos, canciones y actividades divertidas.",
  "activities": [
    "Juegos cooperativos",
    "Manualidades creativas",
    "Cuentos y canciones",
    "Primeras aventuras en la naturaleza"
  ]
}'),

('lobatos', 'Lobatos - Manada Waingunga', '{
  "title": "Manada Waingunga",
  "subtitle": "Lobatos (7-10 años)",
  "description": "Siguiendo las aventuras de Mowgli, los lobatos aprenden a través del juego y la fantasía.",
  "activities": [
    "Especialidades y habilidades",
    "Juegos de Kim",
    "Aventuras y excursiones",
    "Vida en seisenas"
  ]
}'),

('tropa', 'Tropa - Tropa Brownsea', '{
  "title": "Tropa Brownsea",
  "subtitle": "Scouts (10-13 años)",
  "description": "La vida de patrulla, las aventuras al aire libre y el desarrollo de habilidades marcan esta etapa.",
  "activities": [
    "Sistema de patrullas",
    "Campamentos y excursiones",
    "Especialidades scout",
    "Proyectos de servicio"
  ]
}'),

('pioneros', 'Pioneros - Posta Kanhiwara', '{
  "title": "Posta Kanhiwara",
  "subtitle": "Pioneros (13-16 años)",
  "description": "Los pioneros toman sus propias decisiones y realizan proyectos de servicio a la comunidad.",
  "activities": [
    "Proyectos comunitarios",
    "Empresas pioneras",
    "Campamentos de aventura",
    "Liderazgo juvenil"
  ]
}'),

('rutas', 'Rutas - Ruta Walhalla', '{
  "title": "Ruta Walhalla",
  "subtitle": "Rutas (16-19 años)",
  "description": "Los jóvenes más mayores se preparan para la vida adulta a través del servicio y la reflexión.",
  "activities": [
    "Travesías y raids",
    "Proyectos de desarrollo",
    "Servicio comunitario",
    "Preparación para la vida adulta"
  ]
}')

ON CONFLICT (page_name) DO NOTHING;

-- 6. Configuración inicial del sitio
INSERT INTO site_config (config_key, config_value, config_type, description) VALUES
('site_name', 'Grupo Scout Osyris', 'text', 'Nombre del sitio web'),
('site_description', 'Grupo Scout Osyris - Educando para la vida desde 1985', 'text', 'Descripción meta del sitio'),
('contact_email', 'info@gruposcoutosyris.com', 'text', 'Email de contacto principal'),
('contact_phone', '+34 666 123 456', 'text', 'Teléfono de contacto'),
('address', 'Local Scout Osyris, Calle Principal 123, Valencia', 'text', 'Dirección del grupo'),
('social_facebook', 'https://facebook.com/gruposcoutosyris', 'text', 'URL de Facebook'),
('social_instagram', 'https://instagram.com/gruposcoutosyris', 'text', 'URL de Instagram'),
('maintenance_mode', 'false', 'boolean', 'Modo mantenimiento activado')
ON CONFLICT (config_key) DO NOTHING;

-- 7. Políticas de seguridad RLS
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Políticas para content_pages
CREATE POLICY "Public read access to published pages" ON content_pages
    FOR SELECT USING (published = true);

CREATE POLICY "Super admin full access to pages" ON content_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()::integer
            AND usuarios.rol = 'super_admin'
        )
    );

-- Políticas para uploaded_files
CREATE POLICY "Public read access to files" ON uploaded_files
    FOR SELECT USING (true);

CREATE POLICY "Super admin can manage files" ON uploaded_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()::integer
            AND usuarios.rol = 'super_admin'
        )
    );

-- Políticas para site_config
CREATE POLICY "Public read access to config" ON site_config
    FOR SELECT USING (true);

CREATE POLICY "Super admin can manage config" ON site_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()::integer
            AND usuarios.rol = 'super_admin'
        )
    );

-- 8. Verificación
SELECT 'Actualización de BD completada exitosamente' AS resultado;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('content_pages', 'uploaded_files', 'site_config');