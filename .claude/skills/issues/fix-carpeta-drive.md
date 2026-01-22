# CRIT-003: Fix Carpeta de Educando No Se Crea en Google Drive

## Descripción del Problema

Al crear un nuevo educando, no se crea automáticamente su carpeta en Google Drive. Esto impide subir documentos del educando y genera errores cuando se intenta acceder a la funcionalidad de documentos.

## Causa Raíz

1. **Variables de entorno no configuradas**: `GOOGLE_DRIVE_*_FOLDER_ID` no están definidas en producción
2. **Flujo de creación incompleto**: El controlador de educandos no llama explícitamente a crear la carpeta
3. **Fallo silencioso**: `getSeccionFolderId()` retorna `null` y el código continúa sin error
4. **Sin validación de configuración**: El servidor no verifica la configuración de Google Drive al iniciar

## Archivos a Modificar

### Backend
1. `api-osyris/src/config/google-drive.config.js` (CREAR si no existe)
2. `api-osyris/src/services/google-drive.service.js`
3. `api-osyris/src/controllers/educando.controller.js`
4. `api-osyris/src/routes/educandos.routes.js`
5. `api-osyris/.env.example`

## Implementación

### Paso 1: Documentar Variables de Entorno Requeridas

Actualizar `api-osyris/.env.example`:

```bash
# Google Drive Configuration
GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_REDIRECT_URI=https://gruposcoutosyris.es/api/drive/callback
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token

# Carpetas por sección en Google Drive
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc123...
GOOGLE_DRIVE_CASTORES_FOLDER_ID=1def456...
GOOGLE_DRIVE_MANADA_FOLDER_ID=1ghi789...
GOOGLE_DRIVE_TROPA_FOLDER_ID=1jkl012...
GOOGLE_DRIVE_PIONEROS_FOLDER_ID=1mno345...
GOOGLE_DRIVE_RUTAS_FOLDER_ID=1pqr678...
```

### Paso 2: Crear Configuración Centralizada

Crear `api-osyris/src/config/google-drive.config.js`:

```javascript
const SECTION_FOLDER_IDS = {
  1: process.env.GOOGLE_DRIVE_CASTORES_FOLDER_ID,   // Castores
  2: process.env.GOOGLE_DRIVE_MANADA_FOLDER_ID,     // Manada
  3: process.env.GOOGLE_DRIVE_TROPA_FOLDER_ID,      // Tropa
  4: process.env.GOOGLE_DRIVE_PIONEROS_FOLDER_ID,   // Pioneros
  5: process.env.GOOGLE_DRIVE_RUTAS_FOLDER_ID,      // Rutas
};

const validateConfig = () => {
  const errors = [];

  if (process.env.GOOGLE_DRIVE_ENABLED !== 'true') {
    console.warn('Google Drive está deshabilitado');
    return { valid: false, errors: ['Google Drive deshabilitado'] };
  }

  const requiredVars = [
    'GOOGLE_DRIVE_CLIENT_ID',
    'GOOGLE_DRIVE_CLIENT_SECRET',
    'GOOGLE_DRIVE_REFRESH_TOKEN',
    'GOOGLE_DRIVE_ROOT_FOLDER_ID',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Falta variable: ${varName}`);
    }
  }

  // Verificar al menos una carpeta de sección
  const hasSectionFolder = Object.values(SECTION_FOLDER_IDS).some(id => id);
  if (!hasSectionFolder) {
    errors.push('No hay ninguna carpeta de sección configurada');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const getSeccionFolderId = (seccionId) => {
  return SECTION_FOLDER_IDS[seccionId] || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
};

module.exports = {
  SECTION_FOLDER_IDS,
  validateConfig,
  getSeccionFolderId,
};
```

### Paso 3: Validar al Iniciar Servidor

Modificar `api-osyris/src/index.js`:

```javascript
const { validateConfig } = require('./config/google-drive.config');

// Al iniciar el servidor
const driveConfig = validateConfig();
if (!driveConfig.valid) {
  console.warn('⚠️ Google Drive configuración incompleta:');
  driveConfig.errors.forEach(err => console.warn(`   - ${err}`));
  console.warn('   La funcionalidad de Drive estará limitada');
}
```

### Paso 4: Mejorar Servicio de Google Drive

Modificar `api-osyris/src/services/google-drive.service.js`:

```javascript
const { getSeccionFolderId } = require('../config/google-drive.config');

/**
 * Crear carpeta para un educando
 * @param {Object} educando - Datos del educando
 * @returns {Promise<string|null>} - ID de la carpeta creada o null
 */
const createEducandoFolder = async (educando) => {
  try {
    if (process.env.GOOGLE_DRIVE_ENABLED !== 'true') {
      console.log('Google Drive deshabilitado - saltando creación de carpeta');
      return null;
    }

    const parentFolderId = getSeccionFolderId(educando.seccion_id);
    if (!parentFolderId) {
      console.warn(`No hay carpeta configurada para sección ${educando.seccion_id}`);
      return null;
    }

    // Nombre de carpeta: "Apellido, Nombre (ID)"
    const folderName = `${educando.apellidos}, ${educando.nombre} (${educando.id})`;

    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id, webViewLink',
    });

    console.log(`Carpeta creada para educando ${educando.id}: ${folder.data.id}`);

    return folder.data.id;
  } catch (error) {
    console.error('Error creando carpeta de educando:', error.message);
    // No lanzar error - el educando se crea aunque falle Drive
    return null;
  }
};

module.exports = {
  // ... otras funciones existentes
  createEducandoFolder,
};
```

### Paso 5: Integrar en Controlador de Educandos

Modificar `api-osyris/src/controllers/educando.controller.js`:

```javascript
const { createEducandoFolder } = require('../services/google-drive.service');

// En la función de crear educando
const crearEducando = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar educando en BD
    const result = await client.query(
      `INSERT INTO educandos (nombre, apellidos, fecha_nacimiento, seccion_id, ...)
       VALUES ($1, $2, $3, $4, ...)
       RETURNING *`,
      [nombre, apellidos, fecha_nacimiento, seccion_id, ...]
    );

    const educando = result.rows[0];

    // 2. Crear carpeta en Google Drive (no bloquea si falla)
    let driveFolderId = null;
    try {
      driveFolderId = await createEducandoFolder(educando);

      // 3. Actualizar educando con ID de carpeta si se creó
      if (driveFolderId) {
        await client.query(
          'UPDATE educandos SET drive_folder_id = $1 WHERE id = $2',
          [driveFolderId, educando.id]
        );
        educando.drive_folder_id = driveFolderId;
      }
    } catch (driveError) {
      console.error('Error en Drive (no crítico):', driveError.message);
      // Continuar sin fallar - el educando se crea igual
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Educando creado exitosamente',
      educando,
      driveFolder: driveFolderId ? 'creada' : 'pendiente',
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando educando:', error);
    res.status(500).json({ error: 'Error al crear educando' });
  } finally {
    client.release();
  }
};
```

### Paso 6: Agregar Endpoint para Crear Carpeta Manualmente

Modificar `api-osyris/src/routes/educandos.routes.js`:

```javascript
// POST /api/educandos/:id/drive-folder
// Crear o recrear carpeta de Drive para educando existente
router.post('/:id/drive-folder', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener educando
    const result = await pool.query(
      'SELECT * FROM educandos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Educando no encontrado' });
    }

    const educando = result.rows[0];

    // Verificar si ya tiene carpeta
    if (educando.drive_folder_id) {
      return res.status(400).json({
        error: 'El educando ya tiene carpeta de Drive',
        folderId: educando.drive_folder_id,
      });
    }

    // Crear carpeta
    const folderId = await createEducandoFolder(educando);

    if (folderId) {
      // Actualizar BD
      await pool.query(
        'UPDATE educandos SET drive_folder_id = $1 WHERE id = $2',
        [folderId, id]
      );

      res.json({
        message: 'Carpeta creada exitosamente',
        folderId,
      });
    } else {
      res.status(500).json({
        error: 'No se pudo crear la carpeta',
        reason: 'Verifica la configuración de Google Drive',
      });
    }

  } catch (error) {
    console.error('Error creando carpeta:', error);
    res.status(500).json({ error: 'Error al crear carpeta' });
  }
});
```

## Criterios de Completitud

- [ ] Variables de entorno documentadas en .env.example
- [ ] Configuración centralizada creada
- [ ] Validación de config al iniciar servidor
- [ ] Carpeta se crea automáticamente al crear educando
- [ ] Si falla Drive, educando se crea igual (sin bloquear)
- [ ] Endpoint manual para crear carpeta existe
- [ ] Educandos nuevos tienen drive_folder_id
- [ ] Build pasa sin errores
- [ ] Tests existentes pasan

## Comandos de Verificación

```bash
# Verificar variables en producción
ssh root@116.203.98.142 "grep GOOGLE_DRIVE /var/www/osyris-web/api-osyris/.env"

# Build
npm run build

# Tests
npm run test -- --grep "educando"

# Verificar educando tiene carpeta
curl -H "Authorization: Bearer $TOKEN" \
  https://gruposcoutosyris.es/api/educandos/27 | jq '.drive_folder_id'
```

## Tests E2E

```typescript
test('crear educando crea carpeta de Drive', async ({ page }) => {
  // Login como scouter
  await login(page, 'scouter');

  // Ir a crear educando
  await page.goto('/aula-virtual/educandos/nuevo');

  // Llenar formulario
  await page.fill('[name="nombre"]', 'Test');
  await page.fill('[name="apellidos"]', 'Educando');
  // ... otros campos

  // Submit
  await page.click('button[type="submit"]');

  // Esperar respuesta
  await page.waitForResponse(resp =>
    resp.url().includes('/api/educandos') && resp.status() === 201
  );

  // Verificar mensaje de éxito incluye Drive
  await expect(page.locator('.toast')).toContainText('creado');
});
```

## Configuración en Producción

Pasos para configurar en el servidor:

1. Crear proyecto en Google Cloud Console
2. Habilitar Google Drive API
3. Crear credenciales OAuth 2.0
4. Obtener refresh token
5. Crear carpetas de secciones en Drive
6. Configurar variables de entorno

```bash
# En el servidor
ssh root@116.203.98.142
cd /var/www/osyris-web/api-osyris

# Editar .env
nano .env

# Agregar variables de Drive
# GOOGLE_DRIVE_ENABLED=true
# GOOGLE_DRIVE_CLIENT_ID=...
# etc.

# Reiniciar servicio
pm2 restart osyris-api
```

## Rollback

Si hay problemas:
1. Desactivar Drive: `GOOGLE_DRIVE_ENABLED=false`
2. Los educandos existentes mantienen sus datos
3. Solo se afecta la creación automática de carpetas

## Notas Adicionales

- La creación de carpeta no es bloqueante
- Educandos existentes sin carpeta pueden crearla manualmente
- Considerar batch job para crear carpetas de educandos existentes
