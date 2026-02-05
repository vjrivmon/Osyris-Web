const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     FotoPrivada:
 *       type: object
 *       required:
 *         - album_id
 *         - nombre_album
 *         - nombre_archivo
 *         - archivo_ruta
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la foto
 *         album_id:
 *           type: string
 *           description: ID del álbum
 *         nombre_album:
 *           type: string
 *           description: Nombre del álbum
 *         nombre_archivo:
 *           type: string
 *           description: Nombre del archivo
 *         archivo_ruta:
 *           type: string
 *           description: Ruta del archivo en el servidor
 *         descripcion:
 *           type: string
 *           description: Descripción de la foto
 *         fotografiado_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de los scouts que aparecen en la foto
 *         fecha_tomada:
 *           type: string
 *           format: date
 *           description: Fecha en que se tomó la foto
 *         evento_id:
 *           type: integer
 *           description: ID del evento relacionado
 *         subido_por:
 *           type: integer
 *           description: ID del usuario que subió la foto
 *         visible_para_familiares:
 *           type: boolean
 *           description: Indica si es visible para familiares
 *         fecha_subida:
 *           type: string
 *           format: date-time
 *           description: Fecha de subida
 *         etiquetas:
 *           type: array
 *           items:
 *             type: string
 *           description: Etiquetas de la foto
 *       example:
 *         album_id: campamento-verano-2024
 *         nombre_album: Campamento de Verano 2024
 *         nombre_archivo: foto_grupo.jpg
 *         archivo_ruta: /uploads/galeria/campamento-verano-2024/foto_grupo.jpg
 *         descripcion: Foto del grupo en el campamento
 *         fecha_tomada: 2024-07-15
 *         visible_para_familiares: true
 */

// Función para obtener todas las fotos visibles para un familiar
const findByFamiliarId = async (familiarId, options = {}) => {
  try {
    let query_str = `
      SELECT DISTINCT gp.*,
             a.titulo as evento_titulo, a.fecha_inicio as evento_fecha,
             u.nombre as subido_por_nombre, u.apellidos as subido_por_apellidos
      FROM galeria_fotos_privada gp
      LEFT JOIN actividades a ON gp.evento_id = a.id
      LEFT JOIN usuarios u ON gp.subido_por = u.id
      WHERE gp.visible_para_familiares = true
      AND (
        gp.fotografiado_ids IS NULL OR
        ?::text = ANY(string_to_array(array_to_string(gp.fotografiado_ids, ','), ',')::text[]) OR
        EXISTS (
          SELECT 1 FROM familiares_educandos fe
          WHERE fe.familiar_id = ?
          AND fe.educando_id = ANY(gp.fotografiado_ids)
        )
      )
    `;
    const queryParams = [familiarId, familiarId];

    // Filtros opcionales
    if (options.album_id) {
      query_str += ' AND gp.album_id = ?';
      queryParams.push(options.album_id);
    }

    if (options.evento_id) {
      query_str += ' AND gp.evento_id = ?';
      queryParams.push(options.evento_id);
    }

    if (options.etiqueta) {
      query_str += ' AND ? = ANY(gp.etiquetas)';
      queryParams.push(options.etiqueta);
    }

    if (options.fecha_desde) {
      query_str += ' AND gp.fecha_tomada >= ?';
      queryParams.push(options.fecha_desde);
    }

    if (options.fecha_hasta) {
      query_str += ' AND gp.fecha_tomada <= ?';
      queryParams.push(options.fecha_hasta);
    }

    query_str += ' ORDER BY gp.fecha_tomada DESC, gp.fecha_subida DESC';

    if (options.limit) {
      query_str += ' LIMIT ?';
      queryParams.push(options.limit);
    }

    if (options.offset) {
      query_str += ' OFFSET ?';
      queryParams.push(options.offset);
    }

    const fotos = await query(query_str, queryParams);
    return fotos;
  } catch (error) {
    throw error;
  }
};

// Función para obtener fotos de un scout específico
const findByScoutId = async (scoutId, familiarId = null, options = {}) => {
  try {
    let query_str = `
      SELECT gp.*,
             a.titulo as evento_titulo, a.fecha_inicio as evento_fecha,
             u.nombre as subido_por_nombre, u.apellidos as subido_por_apellidos
      FROM galeria_fotos_privada gp
      LEFT JOIN actividades a ON gp.evento_id = a.id
      LEFT JOIN usuarios u ON gp.subido_por = u.id
      WHERE ? = ANY(gp.fotografiado_ids)
      AND gp.visible_para_familiares = true
    `;
    const queryParams = [scoutId];

    // Si se proporciona familiar_id, verificar que tenga acceso al scout
    if (familiarId) {
      query_str += ` AND EXISTS (
        SELECT 1 FROM familiares_educandos fe
        WHERE fe.familiar_id = ? AND fe.educando_id = ?
      )`;
      queryParams.push(familiarId, scoutId);
    }

    if (options.album_id) {
      query_str += ' AND gp.album_id = ?';
      queryParams.push(options.album_id);
    }

    query_str += ' ORDER BY gp.fecha_tomada DESC, gp.fecha_subida DESC';

    if (options.limit) {
      query_str += ' LIMIT ?';
      queryParams.push(options.limit);
    }

    const fotos = await query(query_str, queryParams);
    return fotos;
  } catch (error) {
    throw error;
  }
};

// Función para obtener todos los álbumes disponibles para un familiar
const getAlbumesByFamiliarId = async (familiarId) => {
  try {
    const albumes = await query(`
      SELECT DISTINCT
        gp.album_id,
        gp.nombre_album,
        COUNT(*) as total_fotos,
        MIN(gp.fecha_tomada) as fecha_inicio,
        MAX(gp.fecha_tomada) as fecha_fin,
        a.titulo as evento_titulo,
        a.fecha_inicio as evento_fecha_inicio
      FROM galeria_fotos_privada gp
      LEFT JOIN actividades a ON gp.evento_id = a.id
      WHERE gp.visible_para_familiares = true
      AND (
        gp.fotografiado_ids IS NULL OR
        $1::text = ANY(string_to_array(array_to_string(gp.fotografiado_ids, ','), ',')::text[]) OR
        EXISTS (
          SELECT 1 FROM familiares_educandos fe
          WHERE fe.familiar_id = $2
          AND fe.educando_id = ANY(gp.fotografiado_ids)
        )
      )
      GROUP BY gp.album_id, gp.nombre_album, a.titulo, a.fecha_inicio
      ORDER BY MAX(gp.fecha_tomada) DESC, MAX(gp.fecha_subida) DESC
    `, [familiarId, familiarId]);

    return albumes;
  } catch (error) {
    throw error;
  }
};

// Función para obtener una foto por ID
const findById = async (id, familiarId = null) => {
  try {
    let query_str = `
      SELECT gp.*,
             a.titulo as evento_titulo, a.fecha_inicio as evento_fecha,
             u.nombre as subido_por_nombre, u.apellidos as subido_por_apellidos,
             array(
               SELECT json_build_object(
                 'id', ed.id,
                 'nombre', ed.nombre,
                 'apellidos', ed.apellidos
               )
               FROM unnest(gp.fotografiado_ids) as educando_id
               JOIN educandos ed ON ed.id = educando_id
             ) as fotografiados
      FROM galeria_fotos_privada gp
      LEFT JOIN actividades a ON gp.evento_id = a.id
      LEFT JOIN usuarios u ON gp.subido_por = u.id
      WHERE gp.id = ?
    `;
    const queryParams = [id];

    // Si se proporciona familiar_id, verificar que tenga acceso
    if (familiarId) {
      query_str += ` AND (
        gp.visible_para_familiares = true AND (
          gp.fotografiado_ids IS NULL OR
          ?::text = ANY(string_to_array(array_to_string(gp.fotografiado_ids, ','), ',')::text[]) OR
          EXISTS (
            SELECT 1 FROM familiares_educandos fe
            WHERE fe.familiar_id = ?
            AND fe.educando_id = ANY(gp.fotografiado_ids)
          )
        )
      )`;
      queryParams.push(familiarId, familiarId);
    }

    const fotos = await query(query_str, queryParams);
    return fotos.length ? fotos[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear una nueva foto
const create = async (fotoData) => {
  try {
    const result = await query(`
      INSERT INTO galeria_fotos_privada (
        album_id, nombre_album, nombre_archivo, archivo_ruta, descripcion,
        fotografiado_ids, fecha_tomada, evento_id, subido_por,
        visible_para_familiares, etiquetas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fotoData.album_id,
      fotoData.nombre_album,
      fotoData.nombre_archivo,
      fotoData.archivo_ruta,
      fotoData.descripcion || null,
      fotoData.fotografiado_ids || [],
      fotoData.fecha_tomada || null,
      fotoData.evento_id || null,
      fotoData.subido_por || null,
      fotoData.visible_para_familiares !== undefined ? fotoData.visible_para_familiares : true,
      fotoData.etiquetas || []
    ]);

    const newFoto = await findById(result.insertId);
    return newFoto;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar una foto
const update = async (id, fotoData) => {
  try {
    let query_str = 'UPDATE galeria_fotos_privada SET ';
    const queryParams = [];

    if (fotoData.descripcion !== undefined) {
      query_str += 'descripcion = ?, ';
      queryParams.push(fotoData.descripcion);
    }

    if (fotoData.fotografiado_ids) {
      query_str += 'fotografiado_ids = ?, ';
      queryParams.push(fotoData.fotografiado_ids);
    }

    if (fotoData.fecha_tomada) {
      query_str += 'fecha_tomada = ?, ';
      queryParams.push(fotoData.fecha_tomada);
    }

    if (fotoData.visible_para_familiares !== undefined) {
      query_str += 'visible_para_familiares = ?, ';
      queryParams.push(fotoData.visible_para_familiares);
    }

    if (fotoData.etiquetas) {
      query_str += 'etiquetas = ?, ';
      queryParams.push(fotoData.etiquetas);
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

// Función para eliminar una foto
const remove = async (id, userId = null) => {
  try {
    let query_str = 'DELETE FROM galeria_fotos_privada WHERE id = ?';
    const queryParams = [id];

    if (userId) {
      query_str += ' AND subido_por = ?';
      queryParams.push(userId);
    }

    const result = await query(query_str, queryParams);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Función para eliminar un álbum completo
const removeAlbum = async (albumId, userId = null) => {
  try {
    let query_str = 'DELETE FROM galeria_fotos_privada WHERE album_id = ?';
    const queryParams = [albumId];

    if (userId) {
      query_str += ' AND subido_por = ?';
      queryParams.push(userId);
    }

    const result = await query(query_str, queryParams);
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
};

// Función para obtener fotos por evento
const findByEventoId = async (eventoId, familiarId = null) => {
  try {
    let query_str = `
      SELECT gp.*,
             u.nombre as subido_por_nombre, u.apellidos as subido_por_apellidos
      FROM galeria_fotos_privada gp
      LEFT JOIN usuarios u ON gp.subido_por = u.id
      WHERE gp.evento_id = ? AND gp.visible_para_familiares = true
    `;
    const queryParams = [eventoId];

    if (familiarId) {
      query_str += ` AND (
        gp.fotografiado_ids IS NULL OR
        ?::text = ANY(string_to_array(array_to_string(gp.fotografiado_ids, ','), ',')::text[]) OR
        EXISTS (
          SELECT 1 FROM familiares_educandos fe
          WHERE fe.familiar_id = ?
          AND fe.educando_id = ANY(gp.fotografiado_ids)
        )
      )`;
      queryParams.push(familiarId, familiarId);
    }

    query_str += ' ORDER BY gp.fecha_tomada ASC, gp.fecha_subida ASC';

    const fotos = await query(query_str, queryParams);
    return fotos;
  } catch (error) {
    throw error;
  }
};

// Función para obtener etiquetas populares para un familiar
const getEtiquetasPopulares = async (familiarId, limit = 20) => {
  try {
    const etiquetas = await query(`
      SELECT DISTINCT unnest(etiquetas) as etiqueta, COUNT(*) as frecuencia
      FROM galeria_fotos_privada gp
      WHERE gp.visible_para_familiares = true
      AND gp.etiquetas IS NOT NULL
      AND (
        gp.fotografiado_ids IS NULL OR
        ?::text = ANY(string_to_array(array_to_string(gp.fotografiado_ids, ','), ',')::text[]) OR
        EXISTS (
          SELECT 1 FROM familiares_educandos fe
          WHERE fe.familiar_id = ?
          AND fe.educando_id = ANY(gp.fotografiado_ids)
        )
      )
      GROUP BY etiqueta
      ORDER BY frecuencia DESC, etiqueta ASC
      LIMIT ?
    `, [familiarId, familiarId, limit]);

    return etiquetas;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findByFamiliarId,
  findByScoutId,
  getAlbumesByFamiliarId,
  findById,
  create,
  update,
  remove,
  removeAlbum,
  findByEventoId,
  getEtiquetasPopulares
};