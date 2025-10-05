-- =====================================================
-- SEED DATA: Landing Page Content
-- Datos iniciales para el contenido editable de la landing
-- =====================================================

-- Asumimos que existe un usuario admin con ID 1
-- Si no existe, primero crear el usuario admin

-- Limpiar datos existentes de la landing (opcional)
-- DELETE FROM contenido_editable WHERE seccion = 'landing';

-- =====================================================
-- HERO SECTION
-- =====================================================

-- Hero Title
INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  1, 'landing', 'hero-title', 'texto',
  'Grupo Scout Osyris',
  '{"as": "h1", "className": "mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto,
      metadata = EXCLUDED.metadata;

-- Hero Subtitle
INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  2, 'landing', 'hero-subtitle', 'texto',
  'Formando jóvenes a través del método scout, promoviendo valores, aventura y servicio a la comunidad desde 1981.',
  '{"as": "p", "multiline": true, "className": "mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-white"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto,
      metadata = EXCLUDED.metadata;

-- =====================================================
-- FEATURED SECTION (3 Features)
-- =====================================================

-- Feature 1: Aventura y Aprendizaje
INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  3, 'landing', 'feature-1-title', 'texto',
  'Aventura y Aprendizaje',
  '{"as": "h3", "className": "mb-2 text-xl font-bold"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto;

INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  4, 'landing', 'feature-1-description', 'texto',
  'Actividades emocionantes que combinan diversión y desarrollo personal en un entorno seguro.',
  '{"as": "p", "multiline": true, "className": "text-muted-foreground"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto;

-- Feature 2: Valores y Amistad
INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  5, 'landing', 'feature-2-title', 'texto',
  'Valores y Amistad',
  '{"as": "h3", "className": "mb-2 text-xl font-bold"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto;

INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  6, 'landing', 'feature-2-description', 'texto',
  'Fomentamos valores como el respeto, la responsabilidad y la amistad a través del método scout.',
  '{"as": "p", "multiline": true, "className": "text-muted-foreground"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto;

-- Feature 3: Naturaleza y Sostenibilidad
INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  7, 'landing', 'feature-3-title', 'texto',
  'Naturaleza y Sostenibilidad',
  '{"as": "h3", "className": "mb-2 text-xl font-bold"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto;

INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  contenido_texto, metadata,
  creado_por, modificado_por
) VALUES (
  8, 'landing', 'feature-3-description', 'texto',
  'Conectamos con la naturaleza y aprendemos a cuidar nuestro entorno a través de actividades al aire libre.',
  '{"as": "p", "multiline": true, "className": "text-muted-foreground"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET contenido_texto = EXCLUDED.contenido_texto;

-- =====================================================
-- JOIN US SECTION IMAGE
-- =====================================================

INSERT INTO contenido_editable (
  id, seccion, identificador, tipo,
  url_archivo, metadata,
  creado_por, modificado_por
) VALUES (
  9, 'landing', 'join-us-image', 'imagen',
  '/placeholder.svg?height=300&width=400',
  '{"alt": "Grupo Scout Osyris", "className": "rounded-lg"}',
  1, 1
) ON CONFLICT (seccion, identificador) DO UPDATE
  SET url_archivo = EXCLUDED.url_archivo,
      metadata = EXCLUDED.metadata;

-- Reset sequence to continue from ID 10
SELECT setval('contenido_editable_id_seq', 10, true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verificar que se insertaron correctamente
SELECT
  id,
  seccion,
  identificador,
  tipo,
  CASE
    WHEN tipo = 'texto' THEN contenido_texto
    WHEN tipo = 'imagen' THEN url_archivo
    ELSE 'N/A'
  END as contenido,
  version
FROM contenido_editable
WHERE seccion = 'landing'
ORDER BY id;
