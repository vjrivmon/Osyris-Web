const { query } = require('../config/db.config');

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificacionFamilia:
 *       type: object
 *       required:
 *         - familiar_id
 *         - scout_id
 *         - titulo
 *         - mensaje
 *         - tipo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la notificación
 *         familiar_id:
 *           type: integer
 *           description: ID del familiar destinatario
 *         scout_id:
 *           type: integer
 *           description: ID del scout relacionado
 *         titulo:
 *           type: string
 *           description: Título de la notificación
 *         mensaje:
 *           type: string
 *           description: Contenido del mensaje
 *         tipo:
 *           type: string
 *           enum: [urgente, importante, informativo, recordatorio]
 *           description: Tipo de notificación
 *         prioridad:
 *           type: string
 *           enum: [alta, normal, baja]
 *           description: Nivel de prioridad
 *         categoria:
 *           type: string
 *           description: Categoría de la notificación
 *         leida:
 *           type: boolean
 *           description: Indica si la notificación ha sido leída
 *         fecha_lectura:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de lectura
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación
 *         fecha_expiracion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de expiración
 *         enlace_accion:
 *           type: string
 *           description: URL para acción relacionada
 *         metadata:
 *           type: object
 *           description: Datos adicionales en formato JSON
 *       example:
 *         familiar_id: 1
 *         scout_id: 5
 *         titulo: Recordatorio de campamento
 *         mensaje: No olvide preparar el equipaje para el campamento de fin de semana
 *         tipo: recordatorio
 *         prioridad: alta
 *         categoria: actividad
 */

// Función para obtener notificaciones de un familiar
const findByFamiliarId = async (familiarId, options = {}) => {
  try {
    let query_str = `
      SELECT nf.*,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             s.nombre as seccion_nombre, s.color_principal as seccion_color
      FROM notificaciones_familia nf
      JOIN educandos e ON nf.educando_id = e.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE nf.familiar_id = $1
    `;
    const queryParams = [familiarId];
    let paramCounter = 2;

    // Filtros opcionales
    if (options.soloNoLeidas) {
      query_str += ' AND nf.leida = false';
    }

    if (options.tipo) {
      query_str += ` AND nf.tipo = $${paramCounter}`;
      queryParams.push(options.tipo);
      paramCounter++;
    }

    if (options.categoria) {
      query_str += ` AND nf.categoria = $${paramCounter}`;
      queryParams.push(options.categoria);
      paramCounter++;
    }

    if (options.prioridad) {
      query_str += ` AND nf.prioridad = $${paramCounter}`;
      queryParams.push(options.prioridad);
      paramCounter++;
    }

    // Excluir notificaciones expiradas
    query_str += ' AND (nf.fecha_expiracion IS NULL OR nf.fecha_expiracion > CURRENT_TIMESTAMP)';

    query_str += ' ORDER BY nf.prioridad DESC, nf.fecha_creacion DESC';

    if (options.limit) {
      query_str += ` LIMIT $${paramCounter}`;
      queryParams.push(options.limit);
      paramCounter++;
    }

    const notificaciones = await query(query_str, queryParams);
    return notificaciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener notificaciones de un scout
const findByScoutId = async (scoutId, options = {}) => {
  try {
    let query_str = `
      SELECT nf.*,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos
      FROM notificaciones_familia nf
      JOIN usuarios uf ON nf.familiar_id = uf.id
      WHERE nf.educando_id = $1
    `;
    const queryParams = [scoutId];
    let paramCounter = 2;

    if (options.soloNoLeidas) {
      query_str += ' AND nf.leida = false';
    }

    if (options.tipo) {
      query_str += ` AND nf.tipo = $${paramCounter}`;
      queryParams.push(options.tipo);
      paramCounter++;
    }

    query_str += ' AND (nf.fecha_expiracion IS NULL OR nf.fecha_expiracion > CURRENT_TIMESTAMP)';
    query_str += ' ORDER BY nf.fecha_creacion DESC';

    const notificaciones = await query(query_str, queryParams);
    return notificaciones;
  } catch (error) {
    throw error;
  }
};

// Función para obtener una notificación por ID
const findById = async (id, familiarId = null) => {
  try {
    let query_str = `
      SELECT nf.*,
             e.nombre as scout_nombre, e.apellidos as scout_apellidos,
             uf.nombre as familiar_nombre, uf.apellidos as familiar_apellidos,
             s.nombre as seccion_nombre
      FROM notificaciones_familia nf
      JOIN educandos e ON nf.educando_id = e.id
      JOIN usuarios uf ON nf.familiar_id = uf.id
      LEFT JOIN secciones s ON e.seccion_id = s.id
      WHERE nf.id = $1
    `;
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND nf.familiar_id = $2';
      queryParams.push(familiarId);
    }

    const notificaciones = await query(query_str, queryParams);
    return notificaciones.length ? notificaciones[0] : null;
  } catch (error) {
    throw error;
  }
};

// Función para crear una nueva notificación
const create = async (notificacionData) => {
  try {
    const result = await query(`
      INSERT INTO notificaciones_familia (
        familiar_id, educando_id, titulo, mensaje, tipo, prioridad,
        categoria, enlace_accion, metadata, fecha_expiracion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      notificacionData.familiar_id,
      notificacionData.educando_id || notificacionData.scout_id,  // Aceptar ambos por compatibilidad
      notificacionData.titulo,
      notificacionData.mensaje,
      notificacionData.tipo,
      notificacionData.prioridad || 'normal',
      notificacionData.categoria || null,
      notificacionData.enlace_accion || null,
      notificacionData.metadata ? JSON.stringify(notificacionData.metadata) : null,
      notificacionData.fecha_expiracion || null
    ]);

    const newId = result.insertId || (Array.isArray(result) ? result[0]?.id : null);
    const newNotificacion = await findById(newId);
    return newNotificacion;
  } catch (error) {
    throw error;
  }
};

// Función para crear notificaciones masivas
const createBulk = async (notificacionesData) => {
  try {
    const results = [];
    for (const notificacion of notificacionesData) {
      const result = await create(notificacion);
      results.push(result);
    }
    return results;
  } catch (error) {
    throw error;
  }
};

// Función para marcar como leída
const marcarComoLeida = async (id, familiarId = null) => {
  try {
    let query_str = `
      UPDATE notificaciones_familia
      SET leida = true, fecha_lectura = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND familiar_id = $2';
      queryParams.push(familiarId);
    }

    await query(query_str, queryParams);
    return await findById(id, familiarId);
  } catch (error) {
    throw error;
  }
};

// Función para marcar todas como leídas de un familiar
const marcarTodasComoLeidas = async (familiarId, scoutId = null) => {
  try {
    let query_str = `
      UPDATE notificaciones_familia
      SET leida = true, fecha_lectura = CURRENT_TIMESTAMP
      WHERE familiar_id = $1 AND leida = false
    `;
    const queryParams = [familiarId];

    if (scoutId) {
      query_str += ' AND educando_id = $2';
      queryParams.push(scoutId);
    }

    query_str += ' AND (fecha_expiracion IS NULL OR fecha_expiracion > CURRENT_TIMESTAMP)';

    const result = await query(query_str, queryParams);
    return result.rowCount || 0;
  } catch (error) {
    throw error;
  }
};

// Función para eliminar una notificación
const remove = async (id, familiarId = null) => {
  try {
    let query_str = 'DELETE FROM notificaciones_familia WHERE id = $1';
    const queryParams = [id];

    if (familiarId) {
      query_str += ' AND familiar_id = $2';
      queryParams.push(familiarId);
    }

    const result = await query(query_str, queryParams);
    return (result.rowCount || 0) > 0;
  } catch (error) {
    throw error;
  }
};

// Función para eliminar notificaciones expiradas
const eliminarExpiradas = async () => {
  try {
    const result = await query(`
      DELETE FROM notificaciones_familia
      WHERE fecha_expiracion IS NOT NULL AND fecha_expiracion < CURRENT_TIMESTAMP
    `);
    return result.rowCount || 0;
  } catch (error) {
    throw error;
  }
};

// Función para obtener contador de no leídas
const getContadorNoLeidas = async (familiarId, scoutId = null) => {
  try {
    let query_str = `
      SELECT COUNT(*) as no_leidas
      FROM notificaciones_familia
      WHERE familiar_id = $1 AND leida = false
    `;
    const queryParams = [familiarId];

    if (scoutId) {
      query_str += ' AND educando_id = $2';
      queryParams.push(scoutId);
    }

    query_str += ' AND (fecha_expiracion IS NULL OR fecha_expiracion > CURRENT_TIMESTAMP)';

    const result = await query(query_str, queryParams);
    return parseInt(result[0].no_leidas) || 0;
  } catch (error) {
    throw error;
  }
};

// Función para enviar notificación a todos los familiares de un scout
const enviarAFamiliaresScout = async (scoutId, notificacionBase) => {
  try {
    // Obtener todos los familiares del scout
    const familiares = await query(`
      SELECT familiar_id FROM familiares_educandos WHERE educando_id = $1
    `, [scoutId]);

    const notificaciones = familiares.map(familiar => ({
      ...notificacionBase,
      familiar_id: familiar.familiar_id,
      educando_id: scoutId
    }));

    return await createBulk(notificaciones);
  } catch (error) {
    throw error;
  }
};

// Función para enviar notificación a todos los familiares de una sección
const enviarAFamiliaresSeccion = async (seccionId, notificacionBase) => {
  try {
    const familiares = await query(`
      SELECT DISTINCT fe.familiar_id, e.id as educando_id
      FROM familiares_educandos fe
      JOIN educandos e ON fe.educando_id = e.id
      WHERE e.seccion_id = $1 AND e.activo = true
    `, [seccionId]);

    const notificaciones = familiares.map(familiar => ({
      ...notificacionBase,
      familiar_id: familiar.familiar_id,
      educando_id: familiar.educando_id
    }));

    return await createBulk(notificaciones);
  } catch (error) {
    throw error;
  }
};

// ==========================================
// FUNCIONES DE NOTIFICACIÓN PARA DOCUMENTOS
// ==========================================

/**
 * Crea notificación cuando se sube un documento pendiente de revisión
 * Notifica a los scouters de la sección
 */
const crearNotificacionDocumentoPendiente = async ({
  educandoId,
  educandoNombre,
  tipoDocumento,
  familiarId,
  seccionId
}) => {
  try {
    // Obtener scouters de la sección
    const scouters = await query(`
      SELECT id FROM usuarios
      WHERE seccion_id = $1 AND rol IN ('scouter', 'admin') AND activo = true
    `, [seccionId]);

    const notificaciones = scouters.map(scouter => ({
      familiar_id: familiarId, // Quien subió el documento
      educando_id: educandoId,
      titulo: 'Documento pendiente de revisión',
      mensaje: `${educandoNombre} ha subido "${tipoDocumento}". Revisa y aprueba el documento.`,
      tipo: 'importante',
      prioridad: 'alta',
      categoria: 'documento',
      enlace_accion: '/admin/documentos-pendientes',
      metadata: {
        tipo: 'documento_pendiente',
        tipo_documento: tipoDocumento,
        scouter_id: scouter.id
      }
    }));

    return await createBulk(notificaciones);
  } catch (error) {
    console.error('Error creando notificación documento pendiente:', error);
    throw error;
  }
};

/**
 * Crea notificación cuando un documento es aprobado
 * Notifica a la familia
 */
const crearNotificacionDocumentoAprobado = async ({
  documentoId,
  familiarId,
  tipoDocumento
}) => {
  try {
    // Obtener educando del documento
    const documentos = await query(`
      SELECT df.educando_id, e.nombre, e.apellidos
      FROM documentos_familia df
      JOIN educandos e ON df.educando_id = e.id
      WHERE df.id = $1
    `, [documentoId]);

    if (documentos.length === 0) return null;

    const doc = documentos[0];

    return await create({
      familiar_id: familiarId,
      educando_id: doc.educando_id,  // ✅ Usar el campo real directamente
      titulo: 'Documento aprobado',
      mensaje: `El documento "${tipoDocumento}" de ${doc.nombre} ${doc.apellidos} ha sido aprobado.`,
      tipo: 'informativo',
      prioridad: 'normal',
      categoria: 'documento',
      enlace_accion: '/familia/dashboard',
      metadata: {
        tipo: 'documento_aprobado',
        documento_id: documentoId,
        tipo_documento: tipoDocumento
      }
    });
  } catch (error) {
    console.error('Error creando notificación documento aprobado:', error);
    throw error;
  }
};

/**
 * Crea notificación cuando un documento es rechazado
 * Notifica a la familia con el motivo
 */
const crearNotificacionDocumentoRechazado = async ({
  documentoId,
  familiarId,
  tipoDocumento,
  motivo
}) => {
  try {
    // Obtener educando del documento
    const documentos = await query(`
      SELECT df.educando_id, e.nombre, e.apellidos
      FROM documentos_familia df
      JOIN educandos e ON df.educando_id = e.id
      WHERE df.id = $1
    `, [documentoId]);

    if (documentos.length === 0) return null;

    const doc = documentos[0];

    return await create({
      familiar_id: familiarId,
      educando_id: doc.educando_id,  // ✅ Usar el campo real directamente
      titulo: 'Documento rechazado',
      mensaje: `El documento "${tipoDocumento}" de ${doc.nombre} ${doc.apellidos} ha sido rechazado. Motivo: ${motivo}`,
      tipo: 'urgente',
      prioridad: 'alta',
      categoria: 'documento',
      enlace_accion: '/familia/dashboard',
      metadata: {
        tipo: 'documento_rechazado',
        documento_id: documentoId,
        tipo_documento: tipoDocumento,
        motivo_rechazo: motivo
      }
    });
  } catch (error) {
    console.error('Error creando notificación documento rechazado:', error);
    throw error;
  }
};

// ==========================================
// FUNCIONES DE MENSAJERIA SCOUTER-FAMILIA
// ==========================================

/**
 * Envia un mensaje de un scouter a todas las familias de su seccion
 * MED-005: Sistema de comunicacion scouter-familia
 */
const enviarMensajeASeccion = async ({
  scouterId,
  scouterNombre,
  seccionId,
  asunto,
  mensaje,
  prioridad = 'normal'
}) => {
  try {
    // Obtener todos los familiares con educandos activos en la seccion
    const familiares = await query(`
      SELECT DISTINCT fe.familiar_id, e.id as educando_id, u.nombre as familiar_nombre
      FROM familiares_educandos fe
      JOIN educandos e ON fe.educando_id = e.id
      JOIN usuarios u ON fe.familiar_id = u.id
      WHERE e.seccion_id = $1 AND e.activo = true
    `, [seccionId]);

    if (familiares.length === 0) {
      return { enviados: 0, mensaje: 'No hay familias vinculadas en esta seccion' };
    }

    const notificaciones = familiares.map(familiar => ({
      familiar_id: familiar.familiar_id,
      educando_id: familiar.educando_id,
      titulo: asunto,
      mensaje: mensaje,
      tipo: 'mensaje_scouter',
      prioridad: prioridad,
      categoria: 'comunicados',
      enlace_accion: '/familia/notificaciones',
      metadata: {
        tipo: 'mensaje_scouter',
        remitente_id: scouterId,
        remitente_nombre: scouterNombre,
        seccion_id: seccionId
      }
    }));

    const resultados = await createBulk(notificaciones);
    return {
      enviados: resultados.length,
      mensaje: `Mensaje enviado a ${resultados.length} familias`
    };
  } catch (error) {
    console.error('Error enviando mensaje a seccion:', error);
    throw error;
  }
};

/**
 * Envia un mensaje de un scouter a las familias de un educando especifico
 * MED-005: Sistema de comunicacion scouter-familia
 */
const enviarMensajeAFamiliasEducando = async ({
  scouterId,
  scouterNombre,
  educandoId,
  asunto,
  mensaje,
  prioridad = 'normal'
}) => {
  try {
    // Obtener todos los familiares del educando
    const familiares = await query(`
      SELECT fe.familiar_id, u.nombre as familiar_nombre
      FROM familiares_educandos fe
      JOIN usuarios u ON fe.familiar_id = u.id
      WHERE fe.educando_id = $1
    `, [educandoId]);

    if (familiares.length === 0) {
      return { enviados: 0, mensaje: 'Este educando no tiene familias vinculadas' };
    }

    const notificaciones = familiares.map(familiar => ({
      familiar_id: familiar.familiar_id,
      educando_id: educandoId,
      titulo: asunto,
      mensaje: mensaje,
      tipo: 'mensaje_scouter',
      prioridad: prioridad,
      categoria: 'comunicados',
      enlace_accion: '/familia/notificaciones',
      metadata: {
        tipo: 'mensaje_scouter',
        remitente_id: scouterId,
        remitente_nombre: scouterNombre
      }
    }));

    const resultados = await createBulk(notificaciones);
    return {
      enviados: resultados.length,
      mensaje: `Mensaje enviado a ${resultados.length} familiares`
    };
  } catch (error) {
    console.error('Error enviando mensaje a familias de educando:', error);
    throw error;
  }
};

/**
 * Envia un mensaje a multiples educandos seleccionados
 * MED-005: Sistema de comunicacion scouter-familia
 */
const enviarMensajeAEducandosSeleccionados = async ({
  scouterId,
  scouterNombre,
  educandoIds,
  asunto,
  mensaje,
  prioridad = 'normal'
}) => {
  try {
    if (!educandoIds || educandoIds.length === 0) {
      return { enviados: 0, mensaje: 'No se seleccionaron educandos' };
    }

    // Obtener todos los familiares de los educandos seleccionados
    const familiares = await query(`
      SELECT DISTINCT fe.familiar_id, fe.educando_id
      FROM familiares_educandos fe
      JOIN educandos e ON fe.educando_id = e.id
      WHERE fe.educando_id = ANY($1) AND e.activo = true
    `, [educandoIds]);

    if (familiares.length === 0) {
      return { enviados: 0, mensaje: 'Los educandos seleccionados no tienen familias vinculadas' };
    }

    const notificaciones = familiares.map(familiar => ({
      familiar_id: familiar.familiar_id,
      educando_id: familiar.educando_id,
      titulo: asunto,
      mensaje: mensaje,
      tipo: 'mensaje_scouter',
      prioridad: prioridad,
      categoria: 'comunicados',
      enlace_accion: '/familia/notificaciones',
      metadata: {
        tipo: 'mensaje_scouter',
        remitente_id: scouterId,
        remitente_nombre: scouterNombre
      }
    }));

    const resultados = await createBulk(notificaciones);
    return {
      enviados: resultados.length,
      mensaje: `Mensaje enviado a ${resultados.length} familias`
    };
  } catch (error) {
    console.error('Error enviando mensaje a educandos seleccionados:', error);
    throw error;
  }
};

module.exports = {
  findByFamiliarId,
  findByScoutId,
  findById,
  create,
  createBulk,
  marcarComoLeida,
  marcarTodasComoLeidas,
  remove,
  eliminarExpiradas,
  getContadorNoLeidas,
  enviarAFamiliaresScout,
  enviarAFamiliaresSeccion,
  // Funciones de documentos
  crearNotificacionDocumentoPendiente,
  crearNotificacionDocumentoAprobado,
  crearNotificacionDocumentoRechazado,
  // MED-005: Funciones de mensajeria scouter-familia
  enviarMensajeASeccion,
  enviarMensajeAFamiliasEducando,
  enviarMensajeAEducandosSeleccionados
};