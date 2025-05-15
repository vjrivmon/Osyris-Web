const { getConnection } = require('../config/db.config');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  let connection;
  try {
    connection = await getConnection();
    
    // Crear tablas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        apellidos VARCHAR(255) NOT NULL,
        fecha_nacimiento DATE,
        telefono VARCHAR(20),
        direccion TEXT,
        foto_perfil VARCHAR(255),
        tipo_usuario ENUM('educando', 'familiar', 'monitor', 'admin') NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultimo_acceso TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS secciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        rango_edad VARCHAR(50),
        color VARCHAR(20),
        descripcion TEXT,
        icono VARCHAR(255)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS miembros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        seccion_id INT,
        rol VARCHAR(100),
        fecha_ingreso DATE,
        progreso INT DEFAULT 0,
        etapa_actual VARCHAR(100),
        numero_registro VARCHAR(50),
        documentacion_completa BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS familias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255),
        direccion TEXT,
        telefono_emergencia VARCHAR(20)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS relacion_familiar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        familia_id INT,
        usuario_id INT,
        parentesco VARCHAR(50) NOT NULL,
        es_tutor_legal BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS actividades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_inicio TIMESTAMP NOT NULL,
        fecha_fin TIMESTAMP NOT NULL,
        ubicacion VARCHAR(255),
        estado ENUM('planificada', 'confirmada', 'cancelada', 'completada') DEFAULT 'planificada',
        precio DECIMAL(10,2),
        notas_adicionales TEXT,
        creado_por INT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS secciones_actividad (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actividad_id INT,
        seccion_id INT,
        FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS participantes_actividad (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actividad_id INT,
        usuario_id INT,
        autorizado BOOLEAN DEFAULT FALSE,
        pagado BOOLEAN DEFAULT FALSE,
        asistencia BOOLEAN,
        comentarios TEXT,
        FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        tipo ENUM('autorizacion', 'medico', 'legal', 'informativo') NOT NULL,
        url_documento VARCHAR(255) NOT NULL,
        fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_caducidad DATE,
        es_urgente BOOLEAN DEFAULT FALSE,
        subido_por INT,
        FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documentos_usuario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        documento_id INT,
        usuario_id INT,
        estado ENUM('pendiente', 'firmado', 'rechazado') DEFAULT 'pendiente',
        fecha_accion TIMESTAMP,
        comentarios TEXT,
        FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS insignias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        icono VARCHAR(255),
        seccion_id INT,
        requisitos TEXT,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS insignias_usuario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        insignia_id INT,
        usuario_id INT,
        fecha_obtencion DATE NOT NULL,
        otorgado_por INT,
        FOREIGN KEY (insignia_id) REFERENCES insignias(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (otorgado_por) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        remitente_id INT,
        asunto VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        es_anuncio BOOLEAN DEFAULT FALSE,
        seccion_id INT,
        FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS destinatarios_mensaje (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mensaje_id INT,
        destinatario_id INT,
        leido BOOLEAN DEFAULT FALSE,
        fecha_lectura TIMESTAMP,
        FOREIGN KEY (mensaje_id) REFERENCES mensajes(id) ON DELETE CASCADE,
        FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        concepto VARCHAR(255) NOT NULL,
        cantidad DECIMAL(10,2) NOT NULL,
        estado ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
        fecha_vencimiento DATE,
        fecha_pago TIMESTAMP,
        metodo_pago VARCHAR(100),
        actividad_id INT,
        referencia_pago VARCHAR(100),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        descripcion TEXT,
        cantidad INT DEFAULT 1,
        estado ENUM('disponible', 'en uso', 'mantenimiento', 'perdido') DEFAULT 'disponible',
        ubicacion VARCHAR(255),
        responsable_id INT,
        fecha_adquisicion DATE,
        valor DECIMAL(10,2),
        FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS prestamos_inventario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT,
        usuario_id INT,
        fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_devolucion_prevista DATE,
        fecha_devolucion_real TIMESTAMP,
        estado ENUM('prestado', 'devuelto', 'perdido', 'dañado') DEFAULT 'prestado',
        comentarios TEXT,
        FOREIGN KEY (item_id) REFERENCES inventario(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS proyectos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        seccion_id INT,
        fecha_inicio DATE,
        fecha_fin DATE,
        estado ENUM('planificado', 'en progreso', 'completado', 'cancelado') DEFAULT 'planificado',
        porcentaje_progreso INT DEFAULT 0,
        responsable_id INT,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL,
        FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS equipos_proyecto (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proyecto_id INT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS miembros_equipo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        equipo_id INT,
        usuario_id INT,
        rol VARCHAR(100),
        FOREIGN KEY (equipo_id) REFERENCES equipos_proyecto(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Base de datos inicializada con éxito');
    
    // Insertar datos de ejemplo si es necesario
    const adminExists = await connection.query('SELECT COUNT(*) as count FROM usuarios WHERE email = ?', ['admin@osyris.com']);
    
    if (adminExists[0].count === 0) {
      // Contraseña: admin123 (hasheada)
      await connection.query(`
        INSERT INTO usuarios 
        (email, password, nombre, apellidos, tipo_usuario) 
        VALUES 
        (?, ?, ?, ?, ?)
      `, [
        'admin@osyris.com', 
        '$2b$10$YourGeneratedHash123456', 
        'Administrador', 
        'Sistema', 
        'admin'
      ]);
      
      console.log('Usuario administrador creado con éxito');
      
      // Insertar secciones
      await connection.query(`
        INSERT INTO secciones 
        (nombre, rango_edad, color, descripcion) 
        VALUES 
        ('Castores', '6-8', '#7986cb', 'Sección infantil para niños de 6 a 8 años'),
        ('Lobatos', '8-11', '#ffb74d', 'Sección infantil para niños de 8 a 11 años'),
        ('Scouts', '11-14', '#81c784', 'Sección juvenil para niños de 11 a 14 años'),
        ('Escultas', '14-17', '#e57373', 'Sección juvenil para adolescentes de 14 a 17 años'),
        ('Rovers', '17-21', '#64b5f6', 'Sección juvenil para jóvenes de 17 a 21 años'),
        ('Kraal', '21+', '#9575cd', 'Equipo de monitores del grupo')
      `);
      
      console.log('Secciones creadas con éxito');
    }
    
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Ejecutar la inicialización si este script se ejecuta directamente
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error en la inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase }; 