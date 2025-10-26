const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     FamiliarScout:
 *       type: object
 *       required:
 *         - familiar_id
 *         - scout_id
 *         - relacion
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la relación
 *         familiar_id:
 *           type: integer
 *           description: ID del usuario familiar
 *         scout_id:
 *           type: integer
 *           description: ID del usuario scout
 *         relacion:
 *           type: string
 *           enum: [padre, madre, tutor_legal, abuelo, otro]
 *           description: Tipo de relación familiar
 *         es_contacto_principal:
 *           type: boolean
 *           description: Indica si es el contacto principal
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la relación
 *       example:
 *         familiar_id: 1
 *         scout_id: 5
 *         relacion: padre
 *         es_contacto_principal: true
 */

// Función para obtener todos los familiares de un scout
const findByScoutId = async (scoutId) => {
  try {
    const familiares = await query(`
      SELECT fs.*, u.nombre, u.apellidos, u.email, u.telefono
      FROM familiares_scouts fs
      JOIN usuarios u ON fs.familiar_id = u.id
      WHERE fs.scout_id = ? AND u.activo = true
      ORDER BY fs.es_contacto_principal DESC, u.nombre, u.apellidos
    `, [scoutId]);
    return familiares;
  } catch (error) {
    throw error;
  }
};

// Función para obtener todos los scouts de un familiar
const findByFamiliarId = async (familiarId) => {
  try {
    const scouts = await query(`
      SELECT fs.*, u.nombre, u.apellidos, u.fecha_nacimiento, u.telefono,
             s.nombre as seccion_nombre, s.color_principal as seccion_color
      FROM familiares_scouts fs
      JOIN usuarios u ON fs.scout_id = u.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      WHERE fs.familiar_id = ? AND u.activo = true
      ORDER BY u.nombre, u.apellidos
    `, [familiarId]);
    return scouts;
  } catch (error) {
    throw error;
  }
};

// Función para obtener una relación específica
const findById = async (id) => {
  try {
    const relaciones = await query(`
      SELECT fs.*,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos, uf.email as familiar_email,
             us.nombre as scout_nombre, us.apellidos as scout_apellidos
      FROM familiares_scouts fs
      JOIN usuarios uf ON fs.familiar_id = uf.id
      JOIN usuarios us ON fs.scout_id = us.id
      WHERE fs.id = ?
    `, [id]);
    return relaciones.length ? relaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para verificar si existe una relación
const findByFamiliarAndScout = async (familiarId, scoutId) => {
  try {
    const relaciones = await query(`
      SELECT * FROM familiares_scouts
      WHERE familiar_id = ? AND scout_id = ?
    `, [familiarId, scoutId]);
    return relaciones.length ? relaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear una nueva relación familiar
const create = async (relacionData) => {
  try {
    // Verificar si ya existe la relación
    const existente = await findByFamiliarAndScout(relacionData.familiar_id, relacionData.scout_id);
    if (existente) {
      throw new Error('Ya existe una relación entre este familiar y scout');
    }

    const result = await query(`
      INSERT INTO familiares_scouts (familiar_id, scout_id, relacion, es_contacto_principal)
      VALUES (?, ?, ?, ?)
    `, [
      relacionData.familiar_id,
      relacionData.scout_id,
      relacionData.relacion,
      relacionData.es_contacto_principal || false
    ]);

    const newRelacion = await findById(result.insertId);
    return newRelacion;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar una relación
const update = async (id, relacionData) => {
  try {
    let query_str = 'UPDATE familiares_scouts SET ';
    const queryParams = [];

    if (relacionData.relacion) {
      query_str += 'relacion = ?, ';
      queryParams.push(relacionData.relacion);
    }

    if (relacionData.es_contacto_principal !== undefined) {
      query_str += 'es_contacto_principal = ?, ';
      queryParams.push(relacionData.es_contacto_principal);
    }

    if (queryParams.length === 0) {
      return await findById(id);
    }

    query_str = query_str.slice(0, -2);
    query_str += ' WHERE id = ?';
    queryParams.push(id);

    await query(query_str, queryParams);
    return await findById(id);
  } catch (error) {
    throw error;
  }
};

// Función para eliminar una relación
const remove = async (id) => {
  try {
    const result = await query('DELETE FROM familiares_scouts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Función para establecer contacto principal
const setContactoPrincipal = async (familiarId, scoutId, esPrincipal) => {
  try {
    await query(`
      UPDATE familiares_scouts
      SET es_contacto_principal = ?
      WHERE familiar_id = ? AND scout_id = ?
    `, [esPrincipal, familiarId, scoutId]);

    const relacion = await findByFamiliarAndScout(familiarId, scoutId);
    return relacion;
  } catch (error) {
    throw error;
  }
};

// Función para obtener contactos principales de un scout
const getContactosPrincipales = async (scoutId) => {
  try {
    const contactos = await query(`
      SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono
      FROM familiares_scouts fs
      JOIN usuarios u ON fs.familiar_id = u.id
      WHERE fs.scout_id = ? AND fs.es_contacto_principal = true AND u.activo = true
    `, [scoutId]);
    return contactos;
  } catch (error) {
    throw error;
  }
};

// Función para verificar si un familiar tiene acceso a un scout
const verificarAcceso = async (familiarId, scoutId) => {
  try {
    const relacion = await findByFamiliarAndScout(familiarId, scoutId);
    return relacion !== null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findByScoutId,
  findByFamiliarId,
  findById,
  findByFamiliarAndScout,
  create,
  update,
  remove,
  setContactoPrincipal,
  getContactosPrincipales,
  verificarAcceso
};