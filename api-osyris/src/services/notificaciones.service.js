const { query } = require('../config/db.config');
const notificacionFamiliaModel = require('../models/notificaciones_familia.model');
const notificacionScouterModel = require('../models/notificaciones_scouter.model');

/**
 * Servicio centralizado para crear notificaciones.
 * Consulta config_notificaciones para determinar si un tipo es urgente
 * antes de insertar la notificación.
 */

/**
 * Obtiene la configuración de urgencia para un tipo de notificación.
 * @param {string} tipo - Tipo de notificación (ej: 'cuota_pendiente')
 * @returns {Promise<{es_urgente: boolean}>}
 */
async function getConfigUrgencia(tipo) {
  try {
    const result = await query(
      `SELECT es_urgente FROM config_notificaciones WHERE tipo_notificacion = $1`,
      [tipo]
    );
    if (result.length > 0) {
      return { es_urgente: !!result[0].es_urgente };
    }
    // Si no existe configuración, no es urgente por defecto
    return { es_urgente: false };
  } catch {
    return { es_urgente: false };
  }
}

/**
 * Crea una notificación para una familia vinculada a un educando.
 * Determina automáticamente si es urgente según config_notificaciones.
 *
 * @param {Object} params
 * @param {number} params.familiar_id - ID del usuario familiar destinatario
 * @param {number} params.educando_id - ID del educando relacionado
 * @param {string} params.tipo_config - Tipo para lookup en config_notificaciones (ej: 'cuota_pendiente')
 * @param {string} params.titulo - Título de la notificación
 * @param {string} params.mensaje - Contenido del mensaje
 * @param {Object} [params.options] - Opciones adicionales
 * @param {string} [params.options.tipo] - Tipo de notificación en BD (urgente|importante|informativo|recordatorio). Defaults based on urgencia.
 * @param {string} [params.options.prioridad] - Prioridad (alta|normal|baja)
 * @param {string} [params.options.categoria] - Categoría
 * @param {string} [params.options.enlace_accion] - URL de acción
 * @param {Object} [params.options.metadata] - Datos adicionales
 * @param {string} [params.options.fecha_expiracion] - Fecha de expiración
 * @returns {Promise<Object>} La notificación creada
 */
async function crearNotificacion({
  familiar_id,
  educando_id,
  tipo_config,
  titulo,
  mensaje,
  options = {}
}) {
  const { es_urgente } = await getConfigUrgencia(tipo_config);

  const notificacionData = {
    familiar_id,
    educando_id,
    titulo,
    mensaje,
    tipo: options.tipo || (es_urgente ? 'urgente' : 'informativo'),
    prioridad: options.prioridad || (es_urgente ? 'alta' : 'normal'),
    categoria: options.categoria || null,
    enlace_accion: options.enlace_accion || null,
    metadata: {
      ...options.metadata,
      tipo_config,
    },
    fecha_expiracion: options.fecha_expiracion || null,
  };

  // Crear la notificación base
  const result = await notificacionFamiliaModel.create(notificacionData);

  // Actualizar las columnas urgente y mostrar_modal directamente
  if (result && result.id) {
    await query(
      `UPDATE notificaciones_familia SET urgente = $1, mostrar_modal = $1 WHERE id = $2`,
      [es_urgente, result.id]
    );
  }

  return result;
}

/**
 * Crea una notificación para todos los familiares de un educando.
 *
 * @param {number} educandoId - ID del educando
 * @param {string} tipo_config - Tipo para lookup en config_notificaciones
 * @param {string} titulo - Título
 * @param {string} mensaje - Mensaje
 * @param {Object} [options] - Opciones adicionales (ver crearNotificacion)
 * @returns {Promise<Object[]>} Lista de notificaciones creadas
 */
async function crearNotificacionParaFamiliasDeEducando(educandoId, tipo_config, titulo, mensaje, options = {}) {
  const { es_urgente } = await getConfigUrgencia(tipo_config);

  // Obtener todos los familiares del educando
  const familiares = await query(
    `SELECT familiar_id FROM familiares_educandos WHERE educando_id = $1`,
    [educandoId]
  );

  const results = [];
  for (const fam of familiares) {
    const result = await crearNotificacion({
      familiar_id: fam.familiar_id,
      educando_id: educandoId,
      tipo_config,
      titulo,
      mensaje,
      options: {
        ...options,
        tipo: options.tipo || (es_urgente ? 'urgente' : 'informativo'),
        prioridad: options.prioridad || (es_urgente ? 'alta' : 'normal'),
      }
    });
    results.push(result);
  }

  return results;
}

/**
 * Crea una notificación para scouters de una sección.
 * Usa el modelo de notificaciones scouter existente, añadiendo urgencia.
 *
 * @param {Object} params - Datos de la notificación scouter
 * @param {string} tipo_config - Tipo para lookup en config_notificaciones
 * @returns {Promise<Object>} Notificación creada
 */
async function crearNotificacionScouter(params, tipo_config) {
  const { es_urgente } = await getConfigUrgencia(tipo_config);

  const result = await notificacionScouterModel.crearParaSeccion({
    ...params,
    prioridad: params.prioridad || (es_urgente ? 'alta' : 'normal'),
  });

  // Actualizar columnas urgente/mostrar_modal
  if (result && result.id) {
    await query(
      `UPDATE notificaciones_scouter SET urgente = $1, mostrar_modal = $1 WHERE id = $2`,
      [es_urgente, result.id]
    );
  }

  return result;
}

/**
 * Notifica cuota pendiente a todas las familias de un educando.
 * Llamar desde el endpoint de cuotas cuando se registre/actualice una cuota pendiente.
 *
 * Uso:
 *   const { notificarCuotaPendiente } = require('../services/notificaciones.service');
 *   await notificarCuotaPendiente(educandoId, 'Enero 2026', '25€');
 *
 * @param {number} educandoId - ID del educando
 * @param {string} periodo - Periodo de la cuota (ej: 'Enero 2026')
 * @param {string} importe - Importe (ej: '25€')
 */
async function notificarCuotaPendiente(educandoId, periodo, importe) {
  return crearNotificacionParaFamiliasDeEducando(
    educandoId,
    'cuota_pendiente',
    'Cuota pendiente de pago',
    `Tienes una cuota pendiente de pago: ${periodo} (${importe}). Por favor, realiza el pago lo antes posible.`,
    {
      categoria: 'pagos',
      enlace_accion: '/familia/dashboard',
      metadata: { periodo, importe }
    }
  );
}

module.exports = {
  crearNotificacion,
  crearNotificacionParaFamiliasDeEducando,
  crearNotificacionScouter,
  getConfigUrgencia,
  notificarCuotaPendiente
};
