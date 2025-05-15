const db = require('../config/db.config');
const bcrypt = require('bcryptjs');

/**
 * Función para crear las tablas de la base de datos
 */
async function createTables() {
  try {
    // Crear tabla de usuarios
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellidos VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        rol ENUM('admin', 'coordinador', 'scouter', 'padre', 'educando') NOT NULL,
        telefono VARCHAR(20),
        fecha_nacimiento DATE,
        direccion TEXT,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de secciones
    await db.query(`
      CREATE TABLE IF NOT EXISTS secciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        color VARCHAR(7),
        rango_edad VARCHAR(50),
        coordinador_id INT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (coordinador_id) REFERENCES usuarios(id)
      )
    `);

    // Crear tabla de actividades
    await db.query(`
      CREATE TABLE IF NOT EXISTS actividades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        fecha_inicio DATETIME NOT NULL,
        fecha_fin DATETIME NOT NULL,
        ubicacion TEXT,
        seccion_id INT,
        creador_id INT NOT NULL,
        estado ENUM('planificada', 'en progreso', 'completada', 'cancelada') DEFAULT 'planificada',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id),
        FOREIGN KEY (creador_id) REFERENCES usuarios(id)
      )
    `);

    // Crear tabla de documentos
    await db.query(`
      CREATE TABLE IF NOT EXISTS documentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        url VARCHAR(255) NOT NULL,
        tipo VARCHAR(50),
        seccion_id INT,
        autor_id INT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id),
        FOREIGN KEY (autor_id) REFERENCES usuarios(id)
      )
    `);

    // Crear tabla de mensajes
    await db.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asunto VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        remitente_id INT NOT NULL,
        seccion_id INT,
        es_global BOOLEAN DEFAULT FALSE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (remitente_id) REFERENCES usuarios(id),
        FOREIGN KEY (seccion_id) REFERENCES secciones(id)
      )
    `);

    console.log('Tablas creadas correctamente');
    return true;
  } catch (error) {
    console.error('Error al crear las tablas:', error);
    throw error;
  }
}

/**
 * Función para crear un usuario administrador de prueba
 */
async function createTestAdmin() {
  try {
    // Comprobar si ya existe un usuario con el email admin@osyris.com
    const result = await db.query('SELECT id FROM usuarios WHERE email = ?', ['admin@osyris.com']);
    
    if (result.length === 0) {
      // Crear un hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Insertar usuario administrador
      await db.query(`
        INSERT INTO usuarios (nombre, apellidos, email, password, rol, telefono, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'Admin', 
        'Osyris', 
        'admin@osyris.com', 
        hashedPassword, 
        'admin', 
        '666777888',
        true
      ]);
      
      console.log('Usuario administrador de prueba creado correctamente');
    } else {
      console.log('El usuario administrador de prueba ya existe');
    }
    
    return true;
  } catch (error) {
    console.error('Error al crear el usuario administrador de prueba:', error);
    throw error;
  }
}

module.exports = {
  createTables,
  createTestAdmin
}; 