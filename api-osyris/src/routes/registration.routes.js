const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');

/**
 * @swagger
 * tags:
 *   name: Registration
 *   description: Endpoints para registro y autenticación de usuarios
 */

/**
 * @swagger
 * /api/auth/verify-invitation:
 *   get:
 *     summary: Verificar token de invitación
 *     tags: [Registration]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de invitación
 *     responses:
 *       200:
 *         description: Invitación válida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     apellidos:
 *                       type: string
 *                     rol:
 *                       type: string
 *                     seccion_id:
 *                       type: integer
 *       400:
 *         description: Token requerido
 *       404:
 *         description: Invitación no válida o expirada
 */
router.get('/verify-invitation', registrationController.verifyInvitation);

/**
 * @swagger
 * /api/auth/complete-registration:
 *   post:
 *     summary: Completar registro con invitación
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de invitación
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña
 *               telefono:
 *                 type: string
 *                 description: Teléfono (opcional)
 *               direccion:
 *                 type: string
 *                 description: Dirección (opcional)
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento (opcional)
 *     responses:
 *       201:
 *         description: Registro completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Datos del usuario registrado
 *                     token:
 *                       type: string
 *                       description: Token de autenticación JWT
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Invitación no válida o expirada
 */
router.post('/complete-registration', registrationController.completeRegistration);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Registration]
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
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Datos del usuario
 *                     token:
 *                       type: string
 *                       description: Token de autenticación JWT
 *       400:
 *         description: Credenciales inválidas
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', registrationController.login);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Instrucciones enviadas (si el email existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Email requerido
 */
router.post('/request-password-reset', registrationController.requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de restablecimiento
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Token inválido o datos inválidos
 */
router.post('/reset-password', registrationController.resetPassword);

module.exports = router;