const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints de autenticación
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             example:
 *               email: usuario@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
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
 *                   example: Inicio de sesión exitoso
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     usuario:
 *                       type: object
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *               - apellidos
 *               - tipo_usuario
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               foto_perfil:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *                 enum: [educando, familiar, monitor, admin]
 *             example:
 *               email: nuevo@example.com
 *               password: password123
 *               nombre: Nuevo
 *               apellidos: Usuario
 *               fecha_nacimiento: 1990-01-01
 *               telefono: 666123456
 *               direccion: Calle Principal 123
 *               tipo_usuario: educando
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El email ya está registrado
 *       500:
 *         description: Error del servidor
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener el perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/profile', verifyToken, authController.profile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar la contraseña del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *             example:
 *               currentPassword: password123
 *               newPassword: newPassword123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Contraseña actual incorrecta
 *       500:
 *         description: Error del servidor
 */
router.post('/change-password', verifyToken, authController.changePassword);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar la autenticación del token
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
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
 *                   example: Token válido
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         nombre:
 *                           type: string
 *                         apellidos:
 *                           type: string
 *                         rol:
 *                           type: string
 *                     tokenInfo:
 *                       type: object
 *                       properties:
 *                         issuedAt:
 *                           type: string
 *                         expiresAt:
 *                           type: string
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/verify', verifyToken, authController.verifyAuth);

module.exports = router; 