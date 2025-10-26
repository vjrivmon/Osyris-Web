const express = require('express');
const router = express.Router();
const galeriaFotosController = require('../controllers/galeria_fotos.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Galería Privada
 *   description: Gestión de fotos privadas para familiares
 */

/**
 * @swagger
 * /api/galeria-privada:
 *   get:
 *     summary: Obtener todas las fotos visibles para un familiar
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: album_id
 *         schema:
 *           type: string
 *         description: ID del álbum para filtrar
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *         description: ID del evento para filtrar
 *       - in: query
 *         name: etiqueta
 *         schema:
 *           type: string
 *         description: Etiqueta para filtrar
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Lista de fotos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FotoPrivada'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.getFotosByFamiliar);

/**
 * @swagger
 * /api/galeria-privada/scouts/{scoutId}:
 *   get:
 *     summary: Obtener fotos de un scout específico
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scoutId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del scout
 *       - in: query
 *         name: album_id
 *         schema:
 *           type: string
 *         description: ID del álbum para filtrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de fotos del scout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FotoPrivada'
 *       400:
 *         description: ID de scout inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/scouts/:scoutId', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.getFotosByScout);

/**
 * @swagger
 * /api/galeria-privada/albumes:
 *   get:
 *     summary: Obtener todos los álbumes disponibles para un familiar
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de álbumes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       album_id:
 *                         type: string
 *                       nombre_album:
 *                         type: string
 *                       total_fotos:
 *                         type: integer
 *                       fecha_inicio:
 *                         type: string
 *                         format: date
 *                       fecha_fin:
 *                         type: string
 *                         format: date
 *                       evento_titulo:
 *                         type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/albumes', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.getAlbumesByFamiliar);

/**
 * @swagger
 * /api/galeria-privada/{id}:
 *   get:
 *     summary: Obtener una foto por ID
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la foto
 *     responses:
 *       200:
 *         description: Foto encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FotoPrivada'
 *       400:
 *         description: ID de foto inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Foto no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.getFotoById);

/**
 * @swagger
 * /api/galeria-privada:
 *   post:
 *     summary: Crear una nueva foto
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - album_id
 *               - nombre_album
 *               - nombre_archivo
 *               - archivo_ruta
 *             properties:
 *               album_id:
 *                 type: string
 *                 description: ID del álbum
 *               nombre_album:
 *                 type: string
 *                 description: Nombre del álbum
 *               nombre_archivo:
 *                 type: string
 *                 description: Nombre del archivo
 *               archivo_ruta:
 *                 type: string
 *                 description: Ruta del archivo
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la foto
 *               fotografiado_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los scouts en la foto
 *               fecha_tomada:
 *                 type: string
 *                 format: date
 *                 description: Fecha en que se tomó la foto
 *               evento_id:
 *                 type: integer
 *                 description: ID del evento relacionado
 *               visible_para_familiares:
 *                 type: boolean
 *                 default: true
 *                 description: Si es visible para familiares
 *               etiquetas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Etiquetas de la foto
 *     responses:
 *       201:
 *         description: Foto creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Foto subida correctamente
 *                 data:
 *                   $ref: '#/components/schemas/FotoPrivada'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, checkRole(['admin', 'scouter']), galeriaFotosController.createFoto);

/**
 * @swagger
 * /api/galeria-privada/{id}:
 *   put:
 *     summary: Actualizar una foto
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la foto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               fotografiado_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               fecha_tomada:
 *                 type: string
 *                 format: date
 *               visible_para_familiares:
 *                 type: boolean
 *               etiquetas:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Foto actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Foto actualizada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/FotoPrivada'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Foto no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verifyToken, checkRole(['admin', 'scouter']), galeriaFotosController.updateFoto);

/**
 * @swagger
 * /api/galeria-privada/{id}:
 *   delete:
 *     summary: Eliminar una foto
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la foto
 *     responses:
 *       200:
 *         description: Foto eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Foto eliminada correctamente
 *       400:
 *         description: ID de foto inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Foto no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verifyToken, checkRole(['admin', 'scouter']), galeriaFotosController.deleteFoto);

/**
 * @swagger
 * /api/galeria-privada/albumes/{albumId}:
 *   delete:
 *     summary: Eliminar un álbum completo
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: albumId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del álbum
 *     responses:
 *       200:
 *         description: Álbum eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: X fotos eliminadas del álbum
 *                 eliminadas:
 *                   type: integer
 *                   description: Número de fotos eliminadas
 *       400:
 *         description: ID de álbum inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/albumes/:albumId', verifyToken, checkRole(['admin', 'scouter']), galeriaFotosController.deleteAlbum);

/**
 * @swagger
 * /api/galeria-privada/eventos/{eventoId}:
 *   get:
 *     summary: Obtener fotos por evento
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Lista de fotos del evento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FotoPrivada'
 *       400:
 *         description: ID de evento inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/eventos/:eventoId', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.getFotosByEvento);

/**
 * @swagger
 * /api/galeria-privada/etiquetas-populares:
 *   get:
 *     summary: Obtener etiquetas populares para un familiar
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de etiquetas populares
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       etiqueta:
 *                         type: string
 *                       frecuencia:
 *                         type: integer
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/etiquetas-populares', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.getEtiquetasPopulares);

/**
 * @swagger
 * /api/galeria-privada/{id}/archivo:
 *   get:
 *     summary: Servir archivo de foto
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la foto
 *     responses:
 *       200:
 *         description: Archivo de imagen
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: ID de foto inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Foto o archivo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/archivo', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.serveArchivo);

/**
 * @swagger
 * /api/galeria-privada/{id}/thumbnail:
 *   get:
 *     summary: Obtener miniatura de foto
 *     tags: [Galería Privada]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la foto
 *     responses:
 *       200:
 *         description: Miniatura de imagen
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: ID de foto inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Foto no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/thumbnail', verifyToken, checkRole(['familia', 'admin', 'scouter']), galeriaFotosController.getThumbnail);

module.exports = router;