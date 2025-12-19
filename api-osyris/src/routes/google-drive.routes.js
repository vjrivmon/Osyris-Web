/**
 * Rutas de Google Drive para documentos de educandos
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const driveController = require('../controllers/google-drive.controller');
const {
  getAuthUrl,
  exchangeCodeForTokens,
  isOAuthConfigured,
  hasValidTokens
} = require('../config/google-oauth.config');

// Configuración de multer para uploads en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Permitir PDFs e imágenes
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo PDF, JPG, JPEG y PNG.'), false);
    }
  }
});

/**
 * @swagger
 * /api/drive/plantillas:
 *   get:
 *     summary: Lista todas las plantillas disponibles
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de plantillas
 */
router.get('/plantillas', verifyToken, driveController.getPlantillas);

/**
 * @swagger
 * /api/drive/plantilla/{fileId}/download:
 *   get:
 *     summary: Descarga una plantilla específica
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo en Google Drive
 *     responses:
 *       200:
 *         description: Archivo descargado
 */
router.get('/plantilla/:fileId/download', verifyToken, driveController.downloadPlantilla);

/**
 * @swagger
 * /api/drive/campamento/{tipo}/circulares:
 *   get:
 *     summary: Lista las circulares disponibles de un campamento
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [INICIO, NAVIDAD, ANIVERSARIO, PASCUA, VERANO]
 *         description: Tipo de campamento
 *     responses:
 *       200:
 *         description: Lista de circulares
 */
router.get('/campamento/:tipo/circulares', verifyToken, driveController.getCircularesCampamento);

/**
 * @swagger
 * /api/drive/educando/{educandoId}/documentos:
 *   get:
 *     summary: Obtiene los documentos de un educando
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estructura de documentos del educando
 */
router.get('/educando/:educandoId/documentos', verifyToken, driveController.getEducandoDocumentos);

/**
 * @swagger
 * /api/drive/documento/upload:
 *   post:
 *     summary: Sube un documento a la carpeta del educando
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               educandoId:
 *                 type: integer
 *               tipoDocumento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documento subido correctamente
 */
router.post('/documento/upload', verifyToken, upload.single('file'), driveController.uploadDocumento);

/**
 * @swagger
 * /api/drive/documento/{documentoId}/aprobar:
 *   put:
 *     summary: Aprueba un documento (solo scouters/admin)
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Documento aprobado
 */
router.put('/documento/:documentoId/aprobar', verifyToken, requireRole(['scouter', 'admin']), driveController.aprobarDocumento);

/**
 * @swagger
 * /api/drive/documento/{documentoId}/rechazar:
 *   put:
 *     summary: Rechaza un documento (solo scouters/admin)
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 required: true
 *     parameters:
 *       - in: path
 *         name: documentoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Documento rechazado
 */
router.put('/documento/:documentoId/rechazar', verifyToken, requireRole(['scouter', 'admin']), driveController.rechazarDocumento);

/**
 * @swagger
 * /api/drive/documentos/pendientes:
 *   get:
 *     summary: Lista documentos pendientes de revisión (solo scouters/admin)
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seccionId
 *         schema:
 *           type: integer
 *         description: Filtrar por sección
 *     responses:
 *       200:
 *         description: Lista de documentos pendientes
 */
router.get('/documentos/pendientes', verifyToken, requireRole(['scouter', 'admin']), driveController.getDocumentosPendientes);

/**
 * @swagger
 * /api/drive/educando/{educandoId}/sync:
 *   post:
 *     summary: Sincroniza documentos entre Drive y BD
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: educandoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sincronización completada
 */
router.post('/educando/:educandoId/sync', verifyToken, driveController.syncEducandoDocumentos);

/**
 * @swagger
 * /api/drive/file/{fileId}/preview:
 *   get:
 *     summary: Obtiene el contenido de un archivo para previsualización
 *     tags: [Google Drive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo en Google Drive
 *     responses:
 *       200:
 *         description: Contenido del archivo
 */
// Preview sin auth para poder usar en iframes (el fileId es único y no predecible)
router.get('/file/:fileId/preview', driveController.previewFile);

// =====================================================
// RUTAS OAUTH2 (para configuración inicial de uploads)
// =====================================================

/**
 * Estado de OAuth - verifica si está configurado y autorizado
 */
router.get('/oauth/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: isOAuthConfigured(),
      authorized: hasValidTokens(),
      message: !isOAuthConfigured()
        ? 'Falta configurar GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET en .env'
        : !hasValidTokens()
          ? 'Un admin debe autorizar visitando /api/drive/oauth/authorize'
          : 'OAuth configurado y autorizado correctamente'
    }
  });
});

/**
 * Inicia el flujo de autorización OAuth
 * Un admin debe visitar esta URL UNA VEZ para autorizar la app
 */
router.get('/oauth/authorize', (req, res) => {
  if (!isOAuthConfigured()) {
    return res.status(400).json({
      success: false,
      message: 'OAuth no configurado. Añade GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET al .env'
    });
  }

  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

/**
 * Callback de OAuth - recibe el código de autorización
 */
router.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: red;">❌ Error de autorización</h1>
          <p>${error}</p>
          <a href="/api/drive/oauth/authorize">Intentar de nuevo</a>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: red;">❌ Código no recibido</h1>
          <a href="/api/drive/oauth/authorize">Intentar de nuevo</a>
        </body>
      </html>
    `);
  }

  try {
    await exchangeCodeForTokens(code);

    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: green;">✅ Autorización completada</h1>
          <p>Google Drive OAuth configurado correctamente.</p>
          <p>Ahora las familias pueden subir documentos.</p>
          <p style="color: gray; font-size: 12px;">Puedes cerrar esta ventana.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error en OAuth callback:', err);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: red;">❌ Error</h1>
          <p>${err.message}</p>
          <a href="/api/drive/oauth/authorize">Intentar de nuevo</a>
        </body>
      </html>
    `);
  }
});

module.exports = router;
