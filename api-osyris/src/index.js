// 🚀 CONFIGURACIÓN DE VARIABLES DE ENTORNO (ABSOLUTAMENTE PRIMERO)
// IMPORTANTE: Esto DEBE estar antes de cualquier otro require()
const path = require('path');
const dotenv = require('dotenv');

// Cargar .env desde el directorio raíz del backend
const envPath = path.resolve(__dirname, '..', '.env');
console.log('📁 Cargando variables de entorno desde:', envPath);
dotenv.config({ path: envPath });
console.log('✅ Variables de entorno cargadas');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'Configurado' : 'NO configurado');
console.log('📧 EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Configurado' : 'NO configurado');

// Ahora sí, importar el resto de módulos
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// 🐘 CONFIGURACIÓN POSTGRESQL
const db = require('./config/db.config');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios.routes');
const seccionesRoutes = require('./routes/secciones.routes');
const actividadesRoutes = require('./routes/actividades.routes');
const mensajesRoutes = require('./routes/mensajes.routes');
const authRoutes = require('./routes/auth.routes');
// 🚀 NUEVAS RUTAS
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const registrationRoutes = require('./routes/registration.routes');
// 🏕️ RUTAS DEL SISTEMA FAMILIAR
const familiaresRoutes = require('./routes/familiares.routes');
const documentosFamiliaRoutes = require('./routes/documentos_familia.routes');
const notificacionesFamiliaRoutes = require('./routes/notificaciones_familia.routes');
const galeriaPrivadaRoutes = require('./routes/galeria_privada.routes');
const confirmacionesRoutes = require('./routes/confirmaciones.routes');
// 👨‍👩‍👧‍👦 RUTAS DE EDUCANDOS Y PORTAL FAMILIAS
const educandosRoutes = require('./routes/educandos.routes');
const familiaRoutes = require('./routes/familia.routes');
// const googleDriveRoutes = require('./routes/google-drive.routes'); // ⚠️ DESHABILITADO: falta dependencia googleapis
// 🚀 FEATURE FLAGS
// const featureFlagsRoutes = require('./routes/feature-flags.routes'); // ⚠️ DESHABILITADO: módulo incompleto
// const previewRoutes = require('./routes/preview.routes'); // Temporarily disabled

// Inicialización de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ⚠️ express-fileupload comentado - Usamos multer para uploads
// app.use(fileUpload({
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
//   abortOnLimit: true,
//   useTempFiles: true,
//   tempFileDir: '/tmp/'
// }));

// Opciones de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Grupo Scout Osyris',
      version: '1.0.0',
      description: 'API REST para la gestión del Grupo Scout Osyris',
      contact: {
        name: 'Soporte',
        email: 'info@scoutosyris.com'
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Servidor de desarrollo'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/auth', registrationRoutes); // Nuevas rutas de registro
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/secciones', seccionesRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/mensajes', mensajesRoutes);
// 🚀 NUEVAS RUTAS
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
// 🏕️ RUTAS DEL SISTEMA FAMILIAR
app.use('/api/familiares', familiaresRoutes);
app.use('/api/documentos-familia', documentosFamiliaRoutes);
app.use('/api/notificaciones-familia', notificacionesFamiliaRoutes);
app.use('/api/galeria-privada', galeriaPrivadaRoutes);
app.use('/api/confirmaciones', confirmacionesRoutes);
// 👨‍👩‍👧‍👦 RUTAS DE EDUCANDOS Y PORTAL FAMILIAS
app.use('/api/educandos', educandosRoutes);
app.use('/api/familia', familiaRoutes);
// app.use('/api/drive', googleDriveRoutes); // ⚠️ DESHABILITADO: falta dependencia googleapis
// 🚀 FEATURE FLAGS
// app.use('/api/feature-flags', featureFlagsRoutes); // ⚠️ DESHABILITADO: módulo incompleto
// app.use('/api/preview', previewRoutes); // Temporarily disabled

// Servir archivos estáticos desde uploads (debe ir después de las rutas API)
const uploadsPath = path.join(__dirname, '../uploads');
console.log('📁 Configurando static files en:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Ruta inicial
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API del Grupo Scout Osyris',
    documentation: `http://localhost:${PORT}/api-docs`
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 🚀 INICIALIZACIÓN DEL SERVIDOR
const startServer = async () => {
  try {
    console.log('🔧 Inicializando PostgreSQL...');

    // Inicializar PostgreSQL
    await db.initializeDatabase();

    console.log(`✅ PostgreSQL inicializado correctamente`);
    console.log(`📁 Almacenamiento: Sistema de archivos local`);

    // Levantar servidor
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}`);
      console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
      console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ Base de datos: PostgreSQL`);
      console.log(`${'='.repeat(60)}\n`);
    });

  } catch (error) {
    console.error('❌ Error crítico al inicializar el servidor:', error);
    console.error('Detalles del error:', error.stack);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app; 