-- =====================================================
-- Añadir rol 'editor' al sistema de usuarios
-- =====================================================

-- Eliminar el constraint actual
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Crear nuevo constraint con el rol 'editor' añadido
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
CHECK (rol::text = ANY (ARRAY[
  'admin'::character varying::text,
  'editor'::character varying::text,
  'scouter'::character varying::text,
  'familia'::character varying::text,
  'educando'::character varying::text
]));

-- Verificar constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'usuarios_rol_check';

COMMENT ON CONSTRAINT usuarios_rol_check ON usuarios IS 'Roles permitidos: admin (máximo control), editor (puede editar contenido), scouter (kraal/monitores), familia, educando';
