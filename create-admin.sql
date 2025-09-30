-- 🔐 Script SQL para crear usuario admin en Supabase
-- Ejecutar en Supabase SQL Editor

-- Primero, verificar si el usuario existe
DO $$
DECLARE
    admin_exists boolean;
    hashed_password text := '$2a$10$zJQvN8XBQf5tYH0qVxP8LOXMKmXO6KNxDqbNXqZ1YzJKvRnLwXQHm'; -- Hash de 'OsyrisAdmin2024!'
BEGIN
    -- Verificar si existe el usuario
    SELECT EXISTS (
        SELECT 1 FROM usuarios WHERE email = 'admin@grupoosyris.es'
    ) INTO admin_exists;

    IF admin_exists THEN
        -- Actualizar usuario existente
        UPDATE usuarios
        SET
            contraseña = hashed_password,
            activo = true,
            rol = 'admin'
        WHERE email = 'admin@grupoosyris.es';

        RAISE NOTICE '✅ Usuario admin actualizado';
    ELSE
        -- Crear nuevo usuario admin
        INSERT INTO usuarios (
            nombre,
            apellidos,
            email,
            contraseña,
            rol,
            activo,
            fecha_registro,
            telefono,
            dni
        ) VALUES (
            'Administrador',
            'Sistema',
            'admin@grupoosyris.es',
            hashed_password,
            'admin',
            true,
            NOW(),
            '666666666',
            '12345678A'
        );

        RAISE NOTICE '✅ Usuario admin creado';
    END IF;
END $$;

-- Verificar el usuario creado
SELECT
    id,
    nombre,
    apellidos,
    email,
    rol,
    activo,
    fecha_registro
FROM usuarios
WHERE email = 'admin@grupoosyris.es';

-- 📋 CREDENCIALES:
-- Email: admin@grupoosyris.es
-- Password: OsyrisAdmin2024!