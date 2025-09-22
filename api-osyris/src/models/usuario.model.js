const { query } = require('../config/db.config');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - nombre
 *         - apellidos
 *         - rol
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario (único)
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario (hasheada)
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellidos:
 *           type: string
 *           description: Apellidos del usuario
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento del usuario
 *         telefono:
 *           type: string
 *           description: Número de teléfono del usuario
 *         direccion:
 *           type: string
 *           description: Dirección del usuario
 *         foto_perfil:
 *           type: string
 *           description: URL de la foto de perfil del usuario
 *         rol:
 *           type: string
 *           enum: [admin, coordinador, scouter, padre, educando]
 *           description: Rol del usuario
 *         fecha_registro:
 *           type: string
 *           format: date-time
 *           description: Fecha de registro del usuario
 *         ultimo_acceso:
 *           type: string
 *           format: date-time
 *           description: Última fecha de acceso del usuario
 *         activo:
 *           type: boolean
 *           description: Indica si el usuario está activo
 *       example:
 *         email: usuario@example.com
 *         nombre: Juan
 *         apellidos: Pérez Gómez
 *         fecha_nacimiento: 1990-01-01
 *         telefono: 666123456
 *         direccion: Calle Principal 123
 *         rol: educando
 *         activo: true
 */

// Función para obtener todos los usuarios
const findAll = async () => {
  try {
    const usuarios = await query(
      'SELECT id, email, nombre, apellidos, fecha_nacimiento, telefono, direccion, foto_perfil, rol, fecha_registro, ultimo_acceso, activo FROM usuarios'
    );
    return usuarios;
  } catch (error) {
    throw error;
  }
};

// Función para obtener un usuario por ID
const findById = async (id) => {
  try {
    const usuarios = await query(
      'SELECT id, email, nombre, apellidos, fecha_nacimiento, telefono, direccion, foto_perfil, rol, fecha_registro, ultimo_acceso, activo FROM usuarios WHERE id = ?',
      [id]
    );
    return usuarios.length ? usuarios[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para obtener un usuario por email
const findByEmail = async (email) => {
  try {
    const usuarios = await query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return usuarios.length ? usuarios[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear un nuevo usuario
const create = async (userData) => {
  try {
    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const result = await query(
      `INSERT INTO usuarios 
      (email, password, nombre, apellidos, fecha_nacimiento, telefono, direccion, foto_perfil, rol) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.email,
        hashedPassword,
        userData.nombre,
        userData.apellidos,
        userData.fecha_nacimiento || null,
        userData.telefono || null,
        userData.direccion || null,
        userData.foto_perfil || null,
        userData.rol
      ]
    );
    
    const newUser = await findById(result.insertId);
    return newUser;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar un usuario
const update = async (id, userData) => {
  try {
    let query_str = 'UPDATE usuarios SET ';
    const queryParams = [];
    
    // Construir la consulta dinámicamente
    if (userData.nombre) {
      query_str += 'nombre = ?, ';
      queryParams.push(userData.nombre);
    }
    
    if (userData.apellidos) {
      query_str += 'apellidos = ?, ';
      queryParams.push(userData.apellidos);
    }
    
    if (userData.fecha_nacimiento) {
      query_str += 'fecha_nacimiento = ?, ';
      queryParams.push(userData.fecha_nacimiento);
    }
    
    if (userData.telefono) {
      query_str += 'telefono = ?, ';
      queryParams.push(userData.telefono);
    }
    
    if (userData.direccion) {
      query_str += 'direccion = ?, ';
      queryParams.push(userData.direccion);
    }
    
    if (userData.foto_perfil) {
      query_str += 'foto_perfil = ?, ';
      queryParams.push(userData.foto_perfil);
    }
    
    if (userData.rol) {
      query_str += 'rol = ?, ';
      queryParams.push(userData.rol);
    }
    
    if (userData.activo !== undefined) {
      query_str += 'activo = ?, ';
      queryParams.push(userData.activo);
    }
    
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      query_str += 'password = ?, ';
      queryParams.push(hashedPassword);
    }
    
    // Si no hay campos para actualizar, retornar el usuario actual
    if (queryParams.length === 0) {
      return await findById(id);
    }
    
    // Eliminar la última coma y espacio
    query_str = query_str.slice(0, -2);
    
    // Añadir la condición WHERE
    query_str += ' WHERE id = ?';
    queryParams.push(id);
    
    await query(query_str, queryParams);
    
    // Devolver el usuario actualizado
    return await findById(id);
  } catch (error) {
    throw error;
  }
};

// Función para eliminar un usuario
const remove = async (id) => {
  try {
    const result = await query('DELETE FROM usuarios WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Función para verificar la contraseña de un usuario
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Función para actualizar la fecha de último acceso
const updateLastAccess = async (id) => {
  try {
    await query('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
  verifyPassword,
  updateLastAccess
}; 