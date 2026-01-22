# CRIT-001: Fix Error "No tienes una sección asignada"

## Descripción del Problema

Los usuarios Rodrigo, Asier y Noelia reciben el error "No tienes una sección asignada" al intentar acceder a la gestión de educandos. Esto les impide crear, editar o ver educandos de su sección.

## Causa Raíz

Los usuarios tienen `seccion_id = NULL` en la tabla `usuarios` de la base de datos. El controlador `educando.controller.js` verifica la sección del usuario y retorna error 403 si es NULL.

## Usuarios Afectados

| Usuario | Email | Sección Correcta | seccion_id |
|---------|-------|------------------|------------|
| Rodrigo | rodrigo@* | Pioneros | 4 |
| Asier | asier@* | Manada | 2 |
| Noelia | noelia@* | Castores | 1 |

## Archivos a Modificar

### Backend
1. `api-osyris/database/migrations/001_fix_scouter_sections.sql` (CREAR)
2. `api-osyris/src/controllers/educando.controller.js`
3. `api-osyris/src/controllers/auth.controller.js`
4. `api-osyris/src/middleware/auth.middleware.js`

### Frontend
5. `src/hooks/useEducandosScouter.ts`
6. `src/components/aula-virtual/educandos/educando-list.tsx`

## Implementación

### Paso 1: Crear Migración SQL

Crear archivo `api-osyris/database/migrations/001_fix_scouter_sections.sql`:

```sql
-- Migración: Fix secciones de usuarios scouters
-- Fecha: 2026-01-22
-- Issue: CRIT-001

-- 1. Asignar secciones a usuarios sin sección
UPDATE usuarios
SET seccion_id = 4
WHERE email LIKE '%rodrigo%'
  AND rol = 'scouter'
  AND seccion_id IS NULL;

UPDATE usuarios
SET seccion_id = 2
WHERE email LIKE '%asier%'
  AND rol = 'scouter'
  AND seccion_id IS NULL;

UPDATE usuarios
SET seccion_id = 1
WHERE email LIKE '%noelia%'
  AND rol = 'scouter'
  AND seccion_id IS NULL;

-- 2. Verificar que no quedan scouters sin sección
-- (Este SELECT es solo para verificación, no ejecuta cambios)
SELECT id, nombre, email, rol, seccion_id
FROM usuarios
WHERE rol = 'scouter' AND seccion_id IS NULL;

-- 3. Agregar constraint para prevenir futuros problemas
-- Nota: Comentado por si hay casos edge que requieren NULL temporalmente
-- ALTER TABLE usuarios
-- ADD CONSTRAINT chk_scouter_seccion
-- CHECK (rol != 'scouter' OR seccion_id IS NOT NULL);
```

### Paso 2: Mejorar Mensaje de Error en Controller

Modificar `api-osyris/src/controllers/educando.controller.js`:

```javascript
// Buscar líneas ~122-130 donde se verifica la sección
// Cambiar de:
if (!req.user.seccion_id) {
  return res.status(403).json({ error: 'No tienes una sección asignada' });
}

// A:
if (!req.user.seccion_id) {
  console.error(`Usuario ${req.user.id} (${req.user.email}) sin sección asignada`);
  return res.status(403).json({
    error: 'No tienes una sección asignada',
    message: 'Tu cuenta de scouter no tiene una sección asignada. Contacta con el administrador para que te asigne a una sección.',
    code: 'SCOUTER_NO_SECTION',
    userId: req.user.id
  });
}
```

### Paso 3: Validar en Creación/Edición de Usuario

Modificar `api-osyris/src/controllers/auth.controller.js`:

En la función de crear usuario, agregar validación:

```javascript
// Al crear un usuario con rol 'scouter', requerir seccion_id
if (rol === 'scouter' && !seccion_id) {
  return res.status(400).json({
    error: 'Los usuarios scouter deben tener una sección asignada',
    code: 'SCOUTER_REQUIRES_SECTION'
  });
}
```

### Paso 4: Mejorar UX en Frontend

Modificar `src/hooks/useEducandosScouter.ts`:

```typescript
// Agregar estado de error específico
const [sectionError, setSectionError] = useState<string | null>(null);

// En el catch de la llamada API
catch (error: any) {
  if (error.response?.data?.code === 'SCOUTER_NO_SECTION') {
    setSectionError(error.response.data.message);
    setEducandos([]);
  } else {
    setError(error.message);
  }
}

// Retornar sectionError
return { educandos, loading, error, sectionError, ... };
```

Modificar `src/components/aula-virtual/educandos/educando-list.tsx`:

```typescript
// Mostrar mensaje amigable si no hay sección
{sectionError && (
  <Alert variant="warning">
    <AlertTitle>Sección no asignada</AlertTitle>
    <AlertDescription>
      {sectionError}
      <br />
      <span className="text-sm text-muted-foreground">
        ID de usuario: {userId}
      </span>
    </AlertDescription>
  </Alert>
)}
```

## Criterios de Completitud

- [ ] Migración SQL creada y ejecutada en staging
- [ ] Rodrigo puede ver educandos de Pioneros (seccion_id=4)
- [ ] Asier puede ver educandos de Manada (seccion_id=2)
- [ ] Noelia puede ver educandos de Castores (seccion_id=1)
- [ ] Mensaje de error mejorado en caso de falta de sección
- [ ] Validación en creación de usuarios scouter
- [ ] Build pasa sin errores
- [ ] Tests existentes pasan

## Comandos de Verificación

```bash
# Ejecutar migración en staging
ssh root@116.203.98.142 "cd /var/www/osyris-web && cat api-osyris/database/migrations/001_fix_scouter_sections.sql | docker exec -i osyris-db psql -U osyris_user -d osyris_db"

# Verificar que los usuarios tienen sección
ssh root@116.203.98.142 "docker exec osyris-db psql -U osyris_user -d osyris_db -c \"SELECT id, nombre, email, seccion_id FROM usuarios WHERE rol='scouter'\""

# Build local
npm run build

# Tests
npm run test
```

## Tests E2E Relacionados

`tests/e2e/educandos.spec.ts`:
- Test de login como scouter
- Test de visualización de lista de educandos
- Test de creación de educando

## Rollback

Si algo sale mal:

```sql
-- Revertir cambios (si es necesario)
UPDATE usuarios SET seccion_id = NULL WHERE email LIKE '%rodrigo%';
UPDATE usuarios SET seccion_id = NULL WHERE email LIKE '%asier%';
UPDATE usuarios SET seccion_id = NULL WHERE email LIKE '%noelia%';
```

## Notas Adicionales

- Este fix es prerequisito para CRIT-004 (formulario de educando no se envía)
- Después de aplicar, verificar que los usuarios pueden crear educandos
- Considerar agregar UI para que admins asignen secciones a usuarios
