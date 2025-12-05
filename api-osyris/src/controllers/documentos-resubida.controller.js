/**
 * Controlador: Documentos Resubida
 *
 * Gestiona la verificación de límites de subida,
 * subida de nuevas versiones, y historial de documentos.
 */

const documentosFamiliaModel = require('../models/documentos_familia.model');
const documentosHistorialModel = require('../models/documentos_historial.model');
const educandoModel = require('../models/educando.model');
const familiarEducandoModel = require('../models/familiar_educando.model');
const driveService = require('../services/google-drive.service');
const notificacionScouterModel = require('../models/notificaciones_scouter.model');

// Constante: Límite de subidas por día por documento
const LIMITE_SUBIDAS_DIARIO = 1;

/**
 * Verifica si un documento puede ser subido (límite 24h)
 * GET /api/documentos-resubida/:id/puede-subir
 */
const verificarLimiteSubida = async (req, res) => {
  try {
    const { id } = req.params;
    const familiarId = req.usuario?.id;

    // Obtener documento
    const documento = await documentosFamiliaModel.findById(id);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar acceso del familiar
    if (req.usuario?.rol !== 'admin' && req.usuario?.rol !== 'scouter') {
      const tieneAcceso = await familiarEducandoModel.verificarAcceso(
        familiarId,
        documento.educando_id
      );
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este documento'
        });
      }
    }

    // Obtener fecha actual
    const hoy = new Date().toISOString().split('T')[0];

    // Resetear contador si es nuevo día
    let subidasHoy = documento.subidas_hoy || 0;
    if (documento.fecha_reset_subidas !== hoy) {
      subidasHoy = 0;
      // Actualizar en BD
      await documentosFamiliaModel.update(id, {
        subidas_hoy: 0,
        fecha_reset_subidas: hoy
      });
    }

    const puedeSubir = subidasHoy < LIMITE_SUBIDAS_DIARIO;

    // Calcular tiempo restante hasta próxima subida
    let tiempoRestante = null;
    let proximaSubida = null;

    if (!puedeSubir && documento.ultima_subida) {
      const ultimaSubida = new Date(documento.ultima_subida);
      const manana = new Date(ultimaSubida);
      manana.setDate(manana.getDate() + 1);
      manana.setHours(0, 0, 0, 0);

      tiempoRestante = Math.max(0, manana.getTime() - Date.now());
      proximaSubida = manana;
    }

    return res.json({
      success: true,
      data: {
        puedeSubir,
        subidasHoy,
        limiteDiario: LIMITE_SUBIDAS_DIARIO,
        tiempoRestante, // en milisegundos
        proximaSubida,
        ultimaSubida: documento.ultima_subida,
        tieneVersionAnterior: documento.tiene_version_anterior || false,
        versionActual: documento.version_activa || 1
      }
    });
  } catch (error) {
    console.error('Error verificando límite de subida:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar límite de subida',
      error: error.message
    });
  }
};

/**
 * Obtiene el historial de versiones de un documento
 * GET /api/documentos-resubida/:id/historial
 */
const obtenerHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const familiarId = req.usuario?.id;

    // Obtener documento
    const documento = await documentosFamiliaModel.findById(id);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar acceso
    if (req.usuario?.rol !== 'admin' && req.usuario?.rol !== 'scouter') {
      const tieneAcceso = await familiarEducandoModel.verificarAcceso(
        familiarId,
        documento.educando_id
      );
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este documento'
        });
      }
    }

    // Obtener historial
    const historial = await documentosHistorialModel.obtenerHistorial(id);

    return res.json({
      success: true,
      data: {
        documentoActual: {
          id: documento.id,
          titulo: documento.titulo,
          archivo_nombre: documento.archivo_nombre,
          version: documento.version_activa,
          fecha_subida: documento.fecha_subida,
          estado: documento.estado
        },
        historial: historial.map(v => ({
          id: v.id,
          version: v.version,
          archivo_nombre: v.archivo_nombre,
          fecha_subida: v.fecha_subida,
          estado: v.estado,
          motivo: v.motivo,
          subido_por: v.subido_por_nombre
            ? `${v.subido_por_nombre} ${v.subido_por_apellidos || ''}`
            : 'Desconocido'
        })),
        totalVersiones: historial.length + 1 // Actual + historial
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

/**
 * Restaura una versión anterior de un documento (solo scouter/admin)
 * POST /api/documentos-resubida/:id/restaurar/:versionId
 */
const restaurarVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const scouterId = req.usuario?.id;

    // Solo scouters y admins pueden restaurar
    if (req.usuario?.rol !== 'admin' && req.usuario?.rol !== 'scouter') {
      return res.status(403).json({
        success: false,
        message: 'Solo scouters y administradores pueden restaurar versiones'
      });
    }

    // Obtener documento actual
    const documento = await documentosFamiliaModel.findById(id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Obtener versión a restaurar
    const versionAnterior = await documentosHistorialModel.findById(versionId);
    if (!versionAnterior || versionAnterior.documento_id !== parseInt(id)) {
      return res.status(404).json({
        success: false,
        message: 'Versión no encontrada'
      });
    }

    // 1. Guardar versión actual en historial (como rechazada)
    if (documento.google_drive_file_id) {
      await documentosHistorialModel.guardarVersionAnterior(id, {
        google_drive_file_id: documento.google_drive_file_id,
        archivo_nombre: documento.archivo_nombre,
        archivo_ruta: documento.archivo_ruta,
        tipo_archivo: documento.tipo_archivo,
        tamaño_archivo: documento.tamaño_archivo,
        version: documento.version_activa,
        subido_por: documento.familiar_id,
        fecha_subida: documento.fecha_subida,
        estado: 'rechazado',
        motivo: 'Rechazado por scouter - versión anterior restaurada'
      });
    }

    // 2. Restaurar versión anterior
    await documentosFamiliaModel.update(id, {
      google_drive_file_id: versionAnterior.google_drive_file_id,
      archivo_nombre: versionAnterior.archivo_nombre,
      archivo_ruta: versionAnterior.archivo_ruta,
      tipo_archivo: versionAnterior.tipo_archivo,
      tamaño_archivo: versionAnterior.tamaño_archivo,
      estado: 'vigente',
      estado_revision: 'aprobado',
      aprobado: true,
      aprobado_por: scouterId,
      motivo_rechazo: null,
      // Resetear límite de subidas para permitir nuevo intento
      subidas_hoy: 0,
      fecha_reset_subidas: new Date().toISOString().split('T')[0]
    });

    // 3. Marcar versión restaurada
    await documentosHistorialModel.marcarComoRestaurada(versionId);

    // 4. Obtener documento actualizado
    const documentoActualizado = await documentosFamiliaModel.findById(id);

    return res.json({
      success: true,
      message: 'Versión anterior restaurada correctamente',
      data: documentoActualizado
    });
  } catch (error) {
    console.error('Error restaurando versión:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al restaurar versión',
      error: error.message
    });
  }
};

/**
 * Verifica si un documento puede ser subido usando educando_id y tipo
 * GET /api/documentos-resubida/educando/:educandoId/tipo/:tipoDocumento/puede-subir
 */
const verificarLimiteByTipo = async (req, res) => {
  try {
    const { educandoId, tipoDocumento } = req.params;
    const familiarId = req.usuario?.id;

    // Buscar documento por educando y tipo
    const documento = await documentosFamiliaModel.findByEducandoAndTipo(educandoId, tipoDocumento);

    // Si no existe documento, siempre puede subir (primera vez)
    if (!documento) {
      return res.json({
        success: true,
        data: {
          puedeSubir: true,
          subidasHoy: 0,
          limiteDiario: LIMITE_SUBIDAS_DIARIO,
          tiempoRestante: null,
          proximaSubida: null,
          ultimaSubida: null,
          tieneVersionAnterior: false,
          versionActual: 0,
          documentoId: null,
          esPrimerSubida: true
        }
      });
    }

    // Verificar acceso del familiar si no es admin/scouter
    if (req.usuario?.rol !== 'admin' && req.usuario?.rol !== 'scouter') {
      const tieneAcceso = await familiarEducandoModel.verificarAcceso(
        familiarId,
        documento.educando_id
      );
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este documento'
        });
      }
    }

    // Obtener fecha actual
    const hoy = new Date().toISOString().split('T')[0];

    // Resetear contador si es nuevo día
    let subidasHoy = documento.subidas_hoy || 0;
    if (documento.fecha_reset_subidas !== hoy) {
      subidasHoy = 0;
      // Actualizar en BD
      await documentosFamiliaModel.update(documento.id, {
        subidas_hoy: 0,
        fecha_reset_subidas: hoy
      });
    }

    const puedeSubir = subidasHoy < LIMITE_SUBIDAS_DIARIO;

    // Calcular tiempo restante hasta próxima subida
    let tiempoRestante = null;
    let proximaSubida = null;

    if (!puedeSubir && documento.ultima_subida) {
      const ultimaSubida = new Date(documento.ultima_subida);
      const manana = new Date(ultimaSubida);
      manana.setDate(manana.getDate() + 1);
      manana.setHours(0, 0, 0, 0);

      tiempoRestante = Math.max(0, manana.getTime() - Date.now());
      proximaSubida = manana;
    }

    return res.json({
      success: true,
      data: {
        puedeSubir,
        subidasHoy,
        limiteDiario: LIMITE_SUBIDAS_DIARIO,
        tiempoRestante,
        proximaSubida,
        ultimaSubida: documento.ultima_subida,
        tieneVersionAnterior: documento.tiene_version_anterior || false,
        versionActual: documento.version_activa || 1,
        documentoId: documento.id,
        esPrimerSubida: false
      }
    });
  } catch (error) {
    console.error('Error verificando límite de subida por tipo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar límite de subida',
      error: error.message
    });
  }
};

/**
 * Obtiene información de configuración del tipo de documento
 * GET /api/documentos-resubida/tipo/:tipoDocumento/config
 */
const obtenerConfigTipoDocumento = async (req, res) => {
  try {
    const { tipoDocumento } = req.params;

    const config = driveService.getTipoDocumentoConfig(tipoDocumento);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de documento no encontrado'
      });
    }

    return res.json({
      success: true,
      data: {
        tipo: tipoDocumento,
        nombre: config.nombre,
        prefijo: config.prefijo,
        tienePlantilla: !!config.plantilla,
        plantilla: config.plantilla,
        obligatorio: config.obligatorio,
        edadMinima: config.edadMinima || null,
        requiereTutorial: !config.plantilla && ['dni_padre_madre', 'sip', 'cartilla_vacunacion'].includes(tipoDocumento)
      }
    });
  } catch (error) {
    console.error('Error obteniendo config de tipo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message
    });
  }
};

module.exports = {
  verificarLimiteSubida,
  verificarLimiteByTipo,
  obtenerHistorial,
  restaurarVersion,
  obtenerConfigTipoDocumento
};
