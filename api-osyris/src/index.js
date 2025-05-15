const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Importar base de datos
const db = require('./config/db.config');
const { createTables, createTestAdmin } = require('./utils/init-db');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios.routes');
const seccionesRoutes = require('./routes/secciones.routes');
const actividadesRoutes = require('./routes/actividades.routes');
const documentosRoutes = require('./routes/documentos.routes');
const mensajesRoutes = require('./routes/mensajes.routes');
const authRoutes = require('./routes/auth.routes');

// Configuración de variables de entorno
dotenv.config();

// Inicialización de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/secciones', seccionesRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/mensajes', mensajesRoutes);

// Ruta inicial
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API del Grupo Scout Osyris',
    documentation: `http://localhost:${PORT}/api-docs`
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

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
  
  // Inicializar la base de datos
  try {
    await db.initializeDatabase();
    console.log('Base de datos inicializada correctamente');
    
    // Crear tablas
    await createTables();
    console.log('Estructura de la base de datos configurada correctamente');
    
    // Crear usuario administrador de prueba
    await createTestAdmin();
    
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
  }
});

module.exports = app; 