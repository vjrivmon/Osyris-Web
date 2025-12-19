const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     FamiliarScout:
 *       type: object
 *       required:
 *         - familiar_id
 *         - educando_id
 *         - relacion
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la relación
 *         familiar_id:
 *           type: integer
 *           description: ID del usuario familiar
 *         educando_id:
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
 *         educando_id: 5
 *         relacion: padre
 *         es_contacto_principal: true
 */

// Función para obtener todos los familiares de un scout
const findByScoutId = async (scoutId) => {
  try {
    const familiares = await query(`
      SELECT fs.*, u.nombre, u.apellidos, u.email, u.telefono
      FROM familiares_educandos fs
      JOIN usuarios u ON fs.familiar_id = u.id
      WHERE fs.educando_id = $1 AND u.activo = true
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
      FROM familiares_educandos fs
      JOIN usuarios u ON fs.educando_id = u.id
      LEFT JOIN secciones s ON u.seccion_id = s.id
      WHERE fs.familiar_id = $1 AND u.activo = true
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
      FROM familiares_educandos fs
      JOIN usuarios uf ON fs.familiar_id = uf.id
      JOIN usuarios us ON fs.educando_id = us.id
      WHERE fs.id = $1
    `, [id]);
    return relaciones.length ? relaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para verificar si existe una relación
const findByFamiliarAndScout = async (familiarId, scoutId) => {
  // Validar parámetros para evitar SQL error "syntax error at or near AND"
  if (!familiarId || !scoutId) {
    console.warn('findByFamiliarAndScout: parámetros inválidos', { familiarId, scoutId });
    return null;
  }

  try {
    const relaciones = await query(`
      SELECT * FROM familiares_educandos
      WHERE familiar_id = $1 AND educando_id = $2
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
    const existente = await findByFamiliarAndScout(relacionData.familiar_id, relacionData.educando_id);
    if (existente) {
      throw new Error('Ya existe una relación entre este familiar y scout');
    }

    const result = await query(`
      INSERT INTO familiares_educandos (familiar_id, educando_id, relacion, es_contacto_principal)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
      relacionData.familiar_id,
      relacionData.educando_id,
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
    const setClauses = [];
    const queryParams = [];
    let paramIndex = 1;

    if (relacionData.relacion) {
      setClauses.push(`relacion = $${paramIndex}`);
      queryParams.push(relacionData.relacion);
      paramIndex++;
    }

    if (relacionData.es_contacto_principal !== undefined) {
      setClauses.push(`es_contacto_principal = $${paramIndex}`);
      queryParams.push(relacionData.es_contacto_principal);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return await findById(id);
    }

    const query_str = `UPDATE familiares_educandos SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;
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
    const result = await query('DELETE FROM familiares_educandos WHERE id = $1', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Función para establecer contacto principal
const setContactoPrincipal = async (familiarId, scoutId, esPrincipal) => {
  try {
    await query(`
      UPDATE familiares_educandos
      SET es_contacto_principal = $1
      WHERE familiar_id = $2 AND educando_id = $3
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
      FROM familiares_educandos fs
      JOIN usuarios u ON fs.familiar_id = u.id
      WHERE fs.educando_id = $1 AND fs.es_contacto_principal = true AND u.activo = true
    `, [scoutId]);
    return contactos;
  } catch (error) {
    throw error;
  }
};

// Función para verificar si un familiar tiene acceso a un scout
const verificarAcceso = async (familiarId, scoutId) => {
  // Validación temprana - si falta algún parámetro, no tiene acceso
  if (!familiarId || !scoutId) {
    return false;
  }

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