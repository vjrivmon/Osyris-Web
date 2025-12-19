const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     Educando:
 *       type: object
 *       required:
 *         - nombre
 *         - apellidos
 *         - fecha_nacimiento
 *         - seccion_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del educando
 *         nombre:
 *           type: string
 *           description: Nombre del educando
 *         apellidos:
 *           type: string
 *           description: Apellidos del educando
 *         genero:
 *           type: string
 *           enum: [masculino, femenino, otro, prefiero_no_decir]
 *           description: Género del educando
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         dni:
 *           type: string
 *           description: DNI/NIE del educando
 *         pasaporte:
 *           type: string
 *           description: Número de pasaporte
 *         direccion:
 *           type: string
 *           description: Dirección completa
 *         codigo_postal:
 *           type: string
 *           description: Código postal
 *         municipio:
 *           type: string
 *           description: Municipio de residencia
 *         telefono_casa:
 *           type: string
 *           description: Teléfono fijo
 *         telefono_movil:
 *           type: string
 *           description: Teléfono móvil
 *         email:
 *           type: string
 *           description: Email del educando
 *         alergias:
 *           type: string
 *           description: Alergias o condiciones médicas
 *         notas_medicas:
 *           type: string
 *           description: Notas médicas adicionales
 *         seccion_id:
 *           type: integer
 *           description: ID de la sección scout
 *         foto_perfil:
 *           type: string
 *           description: URL de la foto de perfil
 *         activo:
 *           type: boolean
 *           description: Si el educando está activo
 *         notas:
 *           type: string
 *           description: Notas generales
 *         id_externo:
 *           type: integer
 *           description: ID del sistema anterior (MEV)
 *       example:
 *         nombre: Joan
 *         apellidos: Bárzena Bresó
 *         genero: masculino
 *         fecha_nacimiento: 2018-03-14
 *         seccion_id: 2
 *         telefono_movil: 645541400
 *         email: ejemplo@email.com
 */

/**
 * Obtener todos los educandos con filtros opcionales
 */
const findAll = async (filters = {}) => {
  try {
    let sql = `
      SELECT e.*,
             s.nombre as seccion_nombre,
             s.color_principal as seccion_color,
             EXTRACT(YEAR FROM AGE(e.fecha_nacimiento)) as edad
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filtro por sección
    if (filters.seccion_id) {
      sql += ` AND e.seccion_id = $${paramIndex}`;
      params.push(filters.seccion_id);
      paramIndex++;
    }

    // Filtro por activo
    if (filters.activo !== undefined) {
      sql += ` AND e.activo = $${paramIndex}`;
      params.push(filters.activo);
      paramIndex++;
    }

    // Búsqueda por nombre/apellidos
    if (filters.search) {
      sql += ` AND (
        LOWER(e.nombre) LIKE LOWER($${paramIndex}) OR
        LOWER(e.apellidos) LIKE LOWER($${paramIndex + 1}) OR
        LOWER(CONCAT(e.nombre, ' ', e.apellidos)) LIKE LOWER($${paramIndex + 2})
      )`;
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      paramIndex += 3;
    }

    // Filtro por género
    if (filters.genero) {
      sql += ` AND e.genero = $${paramIndex}`;
      params.push(filters.genero);
      paramIndex++;
    }

    // Ordenar
    sql += ` ORDER BY e.apellidos ASC, e.nombre ASC`;

    // Límite y offset para paginación
    if (filters.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    const educandos = await query(sql, params);
    return educandos;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener un educando por ID
 */
const findById = async (id) => {
  try {
    const educandos = await query(`
      SELECT e.*,
             s.nombre as seccion_nombre,
             s.descripcion as seccion_descripcion,
             s.color_principal as seccion_color,
             s.edad_minima as seccion_edad_minima,
             s.edad_maxima as seccion_edad_maxima,
             EXTRACT(YEAR FROM AGE(e.fecha_nacimiento)) as edad
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.id = $1
    `, [id]);
    return educandos.length ? educandos[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener un educando por DNI
 */
const findByDNI = async (dni) => {
  try {
    const educandos = await query(`
      SELECT e.*,
             s.nombre as seccion_nombre,
             EXTRACT(YEAR FROM AGE(e.fecha_nacimiento)) as edad
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.dni = $1
    `, [dni]);
    return educandos.length ? educandos[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener educandos por sección
 */
const findBySeccion = async (seccionId) => {
  try {
    const educandos = await query(`
      SELECT e.*,
             s.nombre as seccion_nombre,
             s.color_principal as seccion_color,
             EXTRACT(YEAR FROM AGE(e.fecha_nacimiento)) as edad
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE e.seccion_id = $1 AND e.activo = true
      ORDER BY e.apellidos ASC, e.nombre ASC
    `, [seccionId]);
    return educandos;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear un nuevo educando
 */
const create = async (educandoData) => {
  try {
    // Verificar si ya existe DNI (si se proporciona)
    if (educandoData.dni) {
      const existente = await findByDNI(educandoData.dni);
      if (existente) {
        throw new Error('Ya existe un educando con ese DNI');
      }
    }

    const result = await query(`
      INSERT INTO educandos (
        nombre, apellidos, genero, fecha_nacimiento,
        dni, pasaporte, direccion, codigo_postal, municipio,
        telefono_casa, telefono_movil, email,
        alergias, notas_medicas, seccion_id, foto_perfil, activo, notas, id_externo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id
    `, [
      educandoData.nombre,
      educandoData.apellidos,
      educandoData.genero || 'prefiero_no_decir',
      educandoData.fecha_nacimiento,
      educandoData.dni?.trim() || null,
      educandoData.pasaporte?.trim() || null,
      educandoData.direccion || null,
      educandoData.codigo_postal || null,
      educandoData.municipio || null,
      educandoData.telefono_casa || null,
      educandoData.telefono_movil || null,
      educandoData.email || null,
      educandoData.alergias || null,
      educandoData.notas_medicas || null,
      educandoData.seccion_id,
      educandoData.foto_perfil || null,
      educandoData.activo !== undefined ? educandoData.activo : true,
      educandoData.notas || null,
      educandoData.id_externo || null
    ]);

    // result es un array cuando hay RETURNING, acceder a result[0].id
    const newEducando = await findById(result[0].id);
    return newEducando;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar un educando
 */
const update = async (id, educandoData) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Construir dinámicamente la query con solo los campos proporcionados
    if (educandoData.nombre !== undefined) {
      fields.push(`nombre = $${paramIndex}`);
      values.push(educandoData.nombre);
      paramIndex++;
    }
    if (educandoData.apellidos !== undefined) {
      fields.push(`apellidos = $${paramIndex}`);
      values.push(educandoData.apellidos);
      paramIndex++;
    }
    if (educandoData.genero !== undefined) {
      fields.push(`genero = $${paramIndex}`);
      values.push(educandoData.genero);
      paramIndex++;
    }
    if (educandoData.fecha_nacimiento !== undefined) {
      fields.push(`fecha_nacimiento = $${paramIndex}`);
      values.push(educandoData.fecha_nacimiento);
      paramIndex++;
    }
    if (educandoData.dni !== undefined) {
      fields.push(`dni = $${paramIndex}`);
      // Convertir string vacío a NULL para evitar violación de constraint UNIQUE
      values.push(educandoData.dni?.trim() || null);
      paramIndex++;
    }
    if (educandoData.pasaporte !== undefined) {
      fields.push(`pasaporte = $${paramIndex}`);
      // Convertir string vacío a NULL para evitar violación de constraint UNIQUE
      values.push(educandoData.pasaporte?.trim() || null);
      paramIndex++;
    }
    if (educandoData.direccion !== undefined) {
      fields.push(`direccion = $${paramIndex}`);
      values.push(educandoData.direccion);
      paramIndex++;
    }
    if (educandoData.codigo_postal !== undefined) {
      fields.push(`codigo_postal = $${paramIndex}`);
      values.push(educandoData.codigo_postal);
      paramIndex++;
    }
    if (educandoData.municipio !== undefined) {
      fields.push(`municipio = $${paramIndex}`);
      values.push(educandoData.municipio);
      paramIndex++;
    }
    if (educandoData.telefono_casa !== undefined) {
      fields.push(`telefono_casa = $${paramIndex}`);
      values.push(educandoData.telefono_casa);
      paramIndex++;
    }
    if (educandoData.telefono_movil !== undefined) {
      fields.push(`telefono_movil = $${paramIndex}`);
      values.push(educandoData.telefono_movil);
      paramIndex++;
    }
    if (educandoData.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(educandoData.email);
      paramIndex++;
    }
    if (educandoData.alergias !== undefined) {
      fields.push(`alergias = $${paramIndex}`);
      values.push(educandoData.alergias);
      paramIndex++;
    }
    if (educandoData.notas_medicas !== undefined) {
      fields.push(`notas_medicas = $${paramIndex}`);
      values.push(educandoData.notas_medicas);
      paramIndex++;
    }
    if (educandoData.seccion_id !== undefined) {
      fields.push(`seccion_id = $${paramIndex}`);
      values.push(educandoData.seccion_id);
      paramIndex++;
    }
    if (educandoData.foto_perfil !== undefined) {
      fields.push(`foto_perfil = $${paramIndex}`);
      values.push(educandoData.foto_perfil);
      paramIndex++;
    }
    if (educandoData.activo !== undefined) {
      fields.push(`activo = $${paramIndex}`);
      values.push(educandoData.activo);
      paramIndex++;
    }
    if (educandoData.notas !== undefined) {
      fields.push(`notas = $${paramIndex}`);
      values.push(educandoData.notas);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await findById(id);
    }

    // Agregar fecha_actualizacion automática
    fields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    // Agregar el ID al final
    values.push(id);

    const sql = `UPDATE educandos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
    await query(sql, values);

    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Desactivar un educando (soft delete)
 */
const deactivate = async (id) => {
  try {
    await query(`
      UPDATE educandos
      SET activo = false, fecha_baja = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Reactivar un educando
 */
const reactivate = async (id) => {
  try {
    await query(`
      UPDATE educandos
      SET activo = true, fecha_baja = NULL
      WHERE id = $1
    `, [id]);
    return await findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar permanentemente un educando (hard delete)
 */
const remove = async (id) => {
  try {
    const result = await query('DELETE FROM educandos WHERE id = $1', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Contar total de educandos
 */
const count = async (filters = {}) => {
  try {
    let sql = 'SELECT COUNT(*) as total FROM educandos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.seccion_id) {
      sql += ` AND seccion_id = $${paramIndex}`;
      params.push(filters.seccion_id);
      paramIndex++;
    }

    if (filters.activo !== undefined) {
      sql += ` AND activo = $${paramIndex}`;
      params.push(filters.activo);
      paramIndex++;
    }

    const result = await query(sql, params);
    return result[0]?.total || 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estadísticas de educandos
 */
const getEstadisticas = async () => {
  try {
    const stats = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN activo = true THEN 1 END) as activos,
        COUNT(CASE WHEN activo = false THEN 1 END) as inactivos,
        COUNT(CASE WHEN genero = 'masculino' THEN 1 END) as masculino,
        COUNT(CASE WHEN genero = 'femenino' THEN 1 END) as femenino,
        s.nombre as seccion_nombre,
        s.id as seccion_id,
        COUNT(*) OVER (PARTITION BY s.id) as por_seccion
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      GROUP BY s.id, s.nombre
      ORDER BY s.orden
    `);

    return stats;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar educandos por múltiples criterios
 * @param {string} searchTerm - Término de búsqueda
 * @param {number|null} seccionId - ID de sección para filtrar (opcional, para scouters)
 */
const search = async (searchTerm, seccionId = null) => {
  try {
    let sql = `
      SELECT e.*,
             s.nombre as seccion_nombre,
             s.color_principal as seccion_color,
             EXTRACT(YEAR FROM AGE(e.fecha_nacimiento)) as edad
      FROM educandos e
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE (
        LOWER(e.nombre) LIKE LOWER($1) OR
        LOWER(e.apellidos) LIKE LOWER($1) OR
        LOWER(CONCAT(e.nombre, ' ', e.apellidos)) LIKE LOWER($1) OR
        e.dni LIKE $1 OR
        e.email LIKE LOWER($1)
      )`;

    const params = [`%${searchTerm}%`];

    // Si se especifica sección, filtrar solo esa sección
    if (seccionId) {
      sql += ` AND e.seccion_id = $2`;
      params.push(seccionId);
    }

    sql += ` ORDER BY e.apellidos ASC, e.nombre ASC LIMIT 50`;

    const educandos = await query(sql, params);
    return educandos;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  findByDNI,
  findBySeccion,
  create,
  update,
  deactivate,
  reactivate,
  remove,
  count,
  getEstadisticas,
  search
};
