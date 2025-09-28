const { usuarios } = require('../config/supabase.config');
const bcrypt = require('bcryptjs');

/**
 * 🏕️ MODELO USUARIO - MIGRADO A SUPABASE
 * Migración desde SQLite a PostgreSQL con Supabase
 *
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
 *           enum: [scouter, comite, kraal, familia, educando, super_admin]
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
 *         rol: scouter
 *         activo: true
 */

// 📋 Función para obtener todos los usuarios
const findAll = async () => {
  try {
    const usuarios_data = await usuarios.getAll();

    // Limpiar contraseñas de la respuesta
    return usuarios_data.map(usuario => {
      const { password, ...usuarioSinPassword } = usuario;
      return usuarioSinPassword;
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    throw error;
  }
};

// 🔍 Función para obtener un usuario por ID
const findById = async (id) => {
  try {
    const usuario = await usuarios.getById(id);

    if (!usuario) {
      return null;
    }

    // Limpiar contraseña de la respuesta
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  } catch (error) {
    // Si no existe, Supabase devuelve error, devolvemos null para compatibilidad
    if (error.message.includes('No rows returned')) {
      return null;
    }
    console.error('❌ Error al obtener usuario por ID:', error);
    throw error;
  }
};

// 📧 Función para obtener un usuario por email (incluye contraseña para auth)
const findByEmail = async (email) => {
  try {
    const usuario = await usuarios.getByEmail(email);
    return usuario; // Incluye password para verificación de auth
  } catch (error) {
    // Si no existe, Supabase devuelve error, devolvemos null para compatibilidad
    if (error.message.includes('No rows returned')) {
      return null;
    }
    console.error('❌ Error al obtener usuario por email:', error);
    throw error;
  }
};

// ➕ Función para crear un nuevo usuario
const create = async (userData) => {
  try {
    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Preparar datos del usuario
    const userToCreate = {
      email: userData.email,
      password: hashedPassword,
      nombre: userData.nombre,
      apellidos: userData.apellidos,
      fecha_nacimiento: userData.fecha_nacimiento || null,
      telefono: userData.telefono || null,
      direccion: userData.direccion || null,
      foto_perfil: userData.foto_perfil || null,
      rol: userData.rol,
      activo: userData.activo !== undefined ? userData.activo : true
    };

    const newUser = await usuarios.create(userToCreate);

    // Limpiar contraseña de la respuesta
    const { password, ...usuarioSinPassword } = newUser;
    return usuarioSinPassword;
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);

    // Manejar errores específicos de Supabase
    if (error.message.includes('duplicate key value violates unique constraint')) {
      if (error.message.includes('email')) {
        throw new Error('El email ya está registrado');
      }
    }

    throw error;
  }
};

// ✏️ Función para actualizar un usuario
const update = async (id, userData) => {
  try {
    const updateData = { ...userData };

    // Si se actualiza la contraseña, hashearla
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Filtrar campos undefined/null para no sobreescribir
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedUser = await usuarios.update(id, updateData);

    // Limpiar contraseña de la respuesta
    const { password, ...usuarioSinPassword } = updatedUser;
    return usuarioSinPassword;
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    throw error;
  }
};

// 🗑️ Función para eliminar un usuario
const remove = async (id) => {
  try {
    await usuarios.delete(id);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    throw error;
  }
};

// 🔐 Función para verificar la contraseña de un usuario
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('❌ Error al verificar contraseña:', error);
    throw error;
  }
};

// 🕐 Función para actualizar la fecha de último acceso
const updateLastAccess = async (id) => {
  try {
    await usuarios.update(id, {
      ultimo_acceso: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar último acceso:', error);
    throw error;
  }
};

// 🔍 Función para obtener usuarios por sección
const findBySeccion = async (seccionId) => {
  try {
    const { supabase } = require('../config/supabase.config');

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id, email, nombre, apellidos, fecha_nacimiento,
        telefono, direccion, foto_perfil, rol,
        fecha_registro, ultimo_acceso, activo,
        seccion:secciones(*)
      `)
      .eq('seccion_id', seccionId)
      .eq('activo', true);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error al obtener usuarios por sección:', error);
    throw error;
  }
};

// 🔍 Función para obtener usuarios por rol
const findByRol = async (rol) => {
  try {
    const { supabase } = require('../config/supabase.config');

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id, email, nombre, apellidos, fecha_nacimiento,
        telefono, direccion, foto_perfil, rol,
        fecha_registro, ultimo_acceso, activo
      `)
      .eq('rol', rol)
      .eq('activo', true);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error al obtener usuarios por rol:', error);
    throw error;
  }
};

// 📊 Función para obtener estadísticas de usuarios
const getStats = async () => {
  try {
    const { supabase } = require('../config/supabase.config');

    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('activo', true);

    if (error) throw error;

    // Contar por roles
    const stats = data.reduce((acc, usuario) => {
      acc[usuario.rol] = (acc[usuario.rol] || 0) + 1;
      return acc;
    }, {});

    stats.total = data.length;
    return stats;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de usuarios:', error);
    throw error;
  }
};

module.exports = {
  // Funciones originales (compatibilidad)
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
  verifyPassword,
  updateLastAccess,

  // Nuevas funciones específicas de Supabase
  findBySeccion,
  findByRol,
  getStats
};