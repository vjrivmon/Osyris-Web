const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     FamiliarEducando:
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
 *           description: ID del educando
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

/**
 * Obtener todos los educandos de un familiar
 */
const findEducandosByFamiliar = async (familiarId) => {
  try {
    const educandos = await query(`
      SELECT fe.*, fe.id as relacion_id,
             e.nombre, e.apellidos, e.fecha_nacimiento, e.genero,
             e.telefono_movil, e.email, e.alergias, e.foto_perfil, e.activo,
             s.nombre as seccion_nombre,
             s.id as seccion_id,
             EXTRACT(YEAR FROM AGE(e.fecha_nacimiento)) as edad
      FROM familiares_educandos fe
      JOIN educandos e ON fe.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE fe.familiar_id = $1 AND e.activo = true
      ORDER BY e.apellidos, e.nombre
    `, [familiarId]);
    return educandos;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los familiares de un educando
 */
const findFamiliaresByEducando = async (educandoId) => {
  try {
    const familiares = await query(`
      SELECT fe.*, fe.id as relacion_id,
             u.nombre, u.apellidos, u.email, u.telefono
      FROM familiares_educandos fe
      JOIN usuarios u ON fe.familiar_id = u.id
      WHERE fe.educando_id = $1 AND u.activo = true
      ORDER BY fe.es_contacto_principal DESC, u.nombre, u.apellidos
    `, [educandoId]);
    return familiares;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener una relación específica por ID
 */
const findById = async (id) => {
  try {
    const relaciones = await query(`
      SELECT fe.*,
             uf.nombre as familiar_nombre,
             uf.apellidos as familiar_apellidos,
             uf.email as familiar_email,
             uf.telefono as familiar_telefono,
             e.nombre as educando_nombre,
             e.apellidos as educando_apellidos,
             e.fecha_nacimiento as educando_fecha_nacimiento,
             s.nombre as seccion_nombre
      FROM familiares_educandos fe
      JOIN usuarios uf ON fe.familiar_id = uf.id
      JOIN educandos e ON fe.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE fe.id = $1
    `, [id]);
    return relaciones.length ? relaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Verificar si existe una relación entre familiar y educando
 */
const findByFamiliarAndEducando = async (familiarId, educandoId) => {
  try {
    const relaciones = await query(`
      SELECT * FROM familiares_educandos
      WHERE familiar_id = $1 AND educando_id = $2
    `, [familiarId, educandoId]);
    return relaciones.length ? relaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear una nueva relación familiar-educando (vinculación)
 */
const create = async (relacionData) => {
  try {
    // Verificar si ya existe la relación
    const existente = await findByFamiliarAndEducando(
      relacionData.familiar_id,
      relacionData.educando_id
    );

    if (existente) {
      throw new Error('Ya existe una relación entre este familiar y educando');
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

/**
 * Actualizar una relación existente
 */
const update = async (id, relacionData) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (relacionData.relacion !== undefined) {
      fields.push(`relacion = $${paramIndex}`);
      values.push(relacionData.relacion);
      paramIndex++;
    }

    if (relacionData.es_contacto_principal !== undefined) {
      fields.push(`es_contacto_principal = $${paramIndex}`);
      values.push(relacionData.es_contacto_principal);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await findById(id);
    }

    values.push(id);
    const sql = `UPDATE familiares_educandos SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    await query(sql, values);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una relación (desvincular)
 */
const remove = async (id) => {
  try {
    const result = await query('DELETE FROM familiares_educandos WHERE id = $1', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Establecer/quitar contacto principal
 */
const setContactoPrincipal = async (familiarId, educandoId, esPrincipal) => {
  try {
    await query(`
      UPDATE familiares_educandos
      SET es_contacto_principal = $1
      WHERE familiar_id = $2 AND educando_id = $3
    `, [esPrincipal, familiarId, educandoId]);

    const relacion = await findByFamiliarAndEducando(familiarId, educandoId);
    return relacion;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener contactos principales de un educando
 */
const getContactosPrincipales = async (educandoId) => {
  try {
    const contactos = await query(`
      SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, fe.relacion
      FROM familiares_educandos fe
      JOIN usuarios u ON fe.familiar_id = u.id
      WHERE fe.educando_id = $1 AND fe.es_contacto_principal = true AND u.activo = true
    `, [educandoId]);
    return contactos;
  } catch (error) {
    throw error;
  }
};

/**
 * Verificar si un familiar tiene acceso a un educando
 */
const verificarAcceso = async (familiarId, educandoId) => {
  try {
    const relacion = await findByFamiliarAndEducando(familiarId, educandoId);
    return relacion !== null;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los IDs de educandos vinculados a un familiar
 */
const getEducandosIds = async (familiarId) => {
  try {
    const result = await query(`
      SELECT educando_id FROM familiares_educandos
      WHERE familiar_id = $1
    `, [familiarId]);
    return result.map(row => row.educando_id);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los IDs de familiares vinculados a un educando
 */
const getFamiliaresIds = async (educandoId) => {
  try {
    const result = await query(`
      SELECT familiar_id FROM familiares_educandos
      WHERE educando_id = $1
    `, [educandoId]);
    return result.map(row => row.familiar_id);
  } catch (error) {
    throw error;
  }
};

/**
 * Contar educandos vinculados a un familiar
 */
const countEducandosByFamiliar = async (familiarId) => {
  try {
    const result = await query(`
      SELECT COUNT(*) as total FROM familiares_educandos
      WHERE familiar_id = $1
    `, [familiarId]);
    return result[0]?.total || 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findEducandosByFamiliar,
  findFamiliaresByEducando,
  findById,
  findByFamiliarAndEducando,
  create,
  update,
  remove,
  setContactoPrincipal,
  getContactosPrincipales,
  verificarAcceso,
  getEducandosIds,
  getFamiliaresIds,
  countEducandosByFamiliar
};
