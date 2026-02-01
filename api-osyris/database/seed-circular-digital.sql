-- ============================================================================
-- SEED DATA: Circular Digital
-- ============================================================================

-- 1. Usuario admin ya existe (web.osyris@gmail.com)

-- 2. Usuario familiar
INSERT INTO usuarios (nombre, apellidos, email, contraseña, rol, activo, telefono)
VALUES ('María', 'García López', 'maria.garcia@test.com',
  '$2a$10$txlIjy4ud5uhxksWdAEYfepFStQaxmImQ/tSukaYXN4yh9A2o/fJ6', -- Admin123#
  'familia', true, '612345678')
ON CONFLICT (email) DO NOTHING;

-- 3. Educandos
INSERT INTO educandos (nombre, apellidos, fecha_nacimiento, seccion_id, activo, alergias, notas_medicas)
VALUES
  ('Pablo', 'García Martínez', '2014-05-15', 3, true, 'Polen, ácaros', 'Lleva gafas'),
  ('Lucía', 'García Martínez', '2016-09-22', 2, true, '', 'Ninguna')
ON CONFLICT DO NOTHING;

-- 4. Vincular familiar con educandos
INSERT INTO familiares_educandos (familiar_id, educando_id, relacion, es_contacto_principal)
SELECT u.id, e.id, 'madre', true
FROM usuarios u, educandos e
WHERE u.email = 'maria.garcia@test.com' AND e.nombre IN ('Pablo', 'Lucía') AND e.apellidos = 'García Martínez'
ON CONFLICT (familiar_id, educando_id) DO NOTHING;

-- 5. Actividad de campamento
INSERT INTO actividades (titulo, descripcion, fecha_inicio, fecha_fin, lugar, tipo, seccion_id, precio, inscripcion_abierta, estado)
VALUES ('Campamento de Navidad 2026', 'Campamento de navidad de la Tropa', '2026-12-27 10:00:00', '2026-12-30 18:00:00', 'Albergue Sierra Norte', 'campamento', 3, 85.00, true, 'planificada')
ON CONFLICT DO NOTHING;

-- 6. Inscripciones para los educandos
INSERT INTO inscripciones_campamento (actividad_id, educando_id, familiar_id, estado, email_familiar, nombre_familiar, telefono_familiar)
SELECT a.id, e.id, u.id, 'inscrito', u.email, u.nombre || ' ' || u.apellidos, u.telefono
FROM actividades a, educandos e, usuarios u
WHERE a.titulo = 'Campamento de Navidad 2026'
  AND e.nombre = 'Pablo' AND e.apellidos = 'García Martínez'
  AND u.email = 'maria.garcia@test.com'
ON CONFLICT (actividad_id, educando_id) DO NOTHING;

INSERT INTO inscripciones_campamento (actividad_id, educando_id, familiar_id, estado, email_familiar, nombre_familiar, telefono_familiar)
SELECT a.id, e.id, u.id, 'inscrito', u.email, u.nombre || ' ' || u.apellidos, u.telefono
FROM actividades a, educandos e, usuarios u
WHERE a.titulo = 'Campamento de Navidad 2026'
  AND e.nombre = 'Lucía' AND e.apellidos = 'García Martínez'
  AND u.email = 'maria.garcia@test.com'
ON CONFLICT (actividad_id, educando_id) DO NOTHING;

-- 7. Circular digital para la actividad
INSERT INTO circular_actividad (actividad_id, plantilla_id, titulo, texto_introductorio, fecha_limite_firma, estado, creado_por, configuracion)
SELECT a.id, 1, 'Circular Campamento Navidad 2026',
  'Por favor, revise los datos de su hijo/a y firme la circular antes de la fecha límite. Los datos médicos se utilizarán durante el campamento.',
  '2026-12-20', 'publicada', u.id, '{"requiere_pago": true}'::jsonb
FROM actividades a, usuarios u
WHERE a.titulo = 'Campamento de Navidad 2026'
  AND u.email = 'web.osyris@gmail.com';

-- 8. Campos custom para la circular
INSERT INTO campos_custom_circular (circular_actividad_id, nombre_campo, tipo_campo, etiqueta, obligatorio, orden)
SELECT ca.id, 'autorizo_bano', 'checkbox', 'Autorizo el baño en piscina/río bajo supervisión del equipo de monitores', false, 1
FROM circular_actividad ca WHERE ca.titulo = 'Circular Campamento Navidad 2026';

INSERT INTO campos_custom_circular (circular_actividad_id, nombre_campo, tipo_campo, etiqueta, obligatorio, orden)
SELECT ca.id, 'transporte_propio', 'checkbox', 'Mi hijo/a se desplazará al campamento por sus propios medios', false, 2
FROM circular_actividad ca WHERE ca.titulo = 'Circular Campamento Navidad 2026';

INSERT INTO campos_custom_circular (circular_actividad_id, nombre_campo, tipo_campo, etiqueta, obligatorio, orden)
SELECT ca.id, 'observaciones_actividad', 'textarea', 'Observaciones adicionales para esta actividad', false, 3
FROM circular_actividad ca WHERE ca.titulo = 'Circular Campamento Navidad 2026';

-- 9. Perfil de salud para los educandos
INSERT INTO perfil_salud (educando_id, alergias, intolerancias, dieta_especial, medicacion, observaciones_medicas, grupo_sanguineo, tarjeta_sanitaria, puede_hacer_deporte)
SELECT e.id, 'Polen, ácaros', 'Lactosa', '', '', 'Lleva gafas', 'A+', 'SIP-12345678', true
FROM educandos e WHERE e.nombre = 'Pablo' AND e.apellidos = 'García Martínez'
ON CONFLICT (educando_id) DO UPDATE SET alergias = EXCLUDED.alergias;

INSERT INTO perfil_salud (educando_id, alergias, intolerancias, dieta_especial, medicacion, observaciones_medicas, grupo_sanguineo, tarjeta_sanitaria, puede_hacer_deporte)
SELECT e.id, '', '', 'Vegetariana', '', '', 'O+', 'SIP-87654321', true
FROM educandos e WHERE e.nombre = 'Lucía' AND e.apellidos = 'García Martínez'
ON CONFLICT (educando_id) DO UPDATE SET dieta_especial = EXCLUDED.dieta_especial;

-- 10. Contactos de emergencia
INSERT INTO contactos_emergencia (educando_id, nombre_completo, telefono, relacion, orden)
SELECT e.id, 'María García López', '612345678', 'madre', 1
FROM educandos e WHERE e.nombre = 'Pablo' AND e.apellidos = 'García Martínez'
ON CONFLICT (educando_id, orden) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo;

INSERT INTO contactos_emergencia (educando_id, nombre_completo, telefono, relacion, orden)
SELECT e.id, 'Carlos García Pérez', '698765432', 'padre', 2
FROM educandos e WHERE e.nombre = 'Pablo' AND e.apellidos = 'García Martínez'
ON CONFLICT (educando_id, orden) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo;

INSERT INTO contactos_emergencia (educando_id, nombre_completo, telefono, relacion, orden)
SELECT e.id, 'María García López', '612345678', 'madre', 1
FROM educandos e WHERE e.nombre = 'Lucía' AND e.apellidos = 'García Martínez'
ON CONFLICT (educando_id, orden) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo;
