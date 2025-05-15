const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     Seccion:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la sección
 *         nombre:
 *           type: string
 *           description: Nombre de la sección
 *         rango_edad:
 *           type: string
 *           description: Rango de edad de la sección
 *         color:
 *           type: string
 *           description: Color identificativo de la sección
 *         descripcion:
 *           type: string
 *           description: Descripción de la sección
 *         icono:
 *           type: string
 *           description: URL del icono de la sección
 *       example:
 *         nombre: Lobatos
 *         rango_edad: 8-11
 *         color: "#ffb74d"
 *         descripcion: Sección infantil para niños de 8 a 11 años
 */

// Función para obtener todas las secciones
const findAll = async () => {
  try {
    const secciones = await query('SELECT * FROM secciones');
    return secciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener una sección por ID
const findById = async (id) => {
  try {
    const secciones = await query('SELECT * FROM secciones WHERE id = ?', [id]);
    return secciones.length ? secciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear una nueva sección
const create = async (seccionData) => {
  try {
    const result = await query(
      `INSERT INTO secciones 
      (nombre, rango_edad, color, descripcion, icono) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        seccionData.nombre,
        seccionData.rango_edad || null,
        seccionData.color || null,
        seccionData.descripcion || null,
        seccionData.icono || null
      ]
    );
    
    const newSeccion = await findById(result.insertId);
    return newSeccion;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar una sección
const update = async (id, seccionData) => {
  try {
    let query_str = 'UPDATE secciones SET ';
    const queryParams = [];
    
    // Construir la consulta dinámicamente
    if (seccionData.nombre) {
      query_str += 'nombre = ?, ';
      queryParams.push(seccionData.nombre);
    }
    
    if (seccionData.rango_edad !== undefined) {
      query_str += 'rango_edad = ?, ';
      queryParams.push(seccionData.rango_edad);
    }
    
    if (seccionData.color !== undefined) {
      query_str += 'color = ?, ';
      queryParams.push(seccionData.color);
    }
    
    if (seccionData.descripcion !== undefined) {
      query_str += 'descripcion = ?, ';
      queryParams.push(seccionData.descripcion);
    }
    
    if (seccionData.icono !== undefined) {
      query_str += 'icono = ?, ';
      queryParams.push(seccionData.icono);
    }
    
    // Si no hay campos para actualizar, retornar la sección actual
    if (queryParams.length === 0) {
      return await findById(id);
    }
    
    // Eliminar la última coma y espacio
    query_str = query_str.slice(0, -2);
    
    // Añadir la condición WHERE
    query_str += ' WHERE id = ?';
    queryParams.push(id);
    
    await query(query_str, queryParams);
    
    // Devolver la sección actualizada
    return await findById(id);
  } catch (error) {
    throw error;
  }
};

// Función para eliminar una sección
const remove = async (id) => {
  try {
    const result = await query('DELETE FROM secciones WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}; 