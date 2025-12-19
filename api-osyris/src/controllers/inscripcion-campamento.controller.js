/**
 * Controlador de Inscripciones a Campamentos
 *
 * Maneja:
 * - Inscripcion de educandos a campamentos
 * - Subida de circulares firmadas (familias)
 * - Subida de justificantes de pago (familias)
 * - Estadisticas y listados para scouters
 */

const inscripcionModel = require('../models/inscripcion-campamento.model');
const actividadModel = require('../models/actividad.model');
const educandoModel = require('../models/educando.model');
const {
  subirCircularFirmada,
  subirJustificantePago
} = require('../services/campamento-documentos.service');
const {
  agregarInscripcion,
  actualizarInscripcion,
  registrarAsistenciaCampamento
} = require('../services/campamento-sheets.service');
const { sendEmail } = require('../utils/email');
const { getEmailSeccion, DRIVE_CONFIG } = require('../config/google-drive.config');
const NotificacionScouterModel = require('../models/notificaciones_scouter.model');

/**
 * Inscribir educando a un campamento
 * POST /api/inscripciones-campamento
 */
const inscribirCampamento = async (req, res) => {
  try {
    const {
      actividad_id,
      educando_id,
      asistira,
      // Datos del familiar
      email_familiar,
      telefono_familiar,
      nombre_familiar,
      // Datos de salud
      alergias,
      intolerancias,
      dieta_especial,
      medicacion,
      observaciones_medicas,
      // Contacto emergencia
      telefono_emergencia,
      persona_emergencia,
      // Observaciones
      observaciones
    } = req.body;

    const familiar_id = req.usuario?.id || req.user?.id;

    // Validar campos requeridos
    if (!actividad_id || !educando_id) {
      return res.status(400).json({
        success: false,
        message: 'actividad_id y educando_id son requeridos'
      });
    }

    // Verificar que la actividad existe y es un campamento
    const actividad = await actividadModel.findById(actividad_id);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    if (actividad.tipo !== 'campamento') {
      return res.status(400).json({
        success: false,
        message: 'La actividad no es un campamento'
      });
    }

    // Detectar tipo de campamento
    const tipoCampamento = detectarTipoCampamento(actividad.titulo);

    // Si marca que no asiste, registrar y terminar
    if (asistira === false) {
      const inscripcion = await inscripcionModel.createOrUpdate({
        actividad_id,
        educando_id,
        familiar_id,
        estado: 'no_asiste',
        email_familiar,
        telefono_familiar,
        nombre_familiar,
        observaciones
      });

      // Actualizar Google Sheets si existe
      if (actividad.sheets_inscripciones_id) {
        const educando = await educandoModel.findById(educando_id);
        await agregarInscripcion(actividad.sheets_inscripciones_id, {
          email: email_familiar,
          nombreFamiliar: nombre_familiar,
          telefono: telefono_familiar,
          nombreAsistente: `${educando.nombre} ${educando.apellidos}`,
          seccion: educando.seccion_nombre || '',
          asistira: false,
          alergias: '',
          dieta: '',
          circularSubida: false,
          justificanteSubido: false,
          estado: 'No asiste'
        });
      }

      // Registrar asistencia en spreadsheet por sección (crea el sheet si es la primera inscripción)
      await registrarAsistenciaCampamento(
        actividad_id,
        educando_id,
        false,  // no asiste
        observaciones || '',
        tipoCampamento,
        actividad.titulo
      );

      // Crear notificacion para scouters de la seccion
      try {
        const educando = await educandoModel.findById(educando_id);
        if (educando && educando.seccion_id) {
          await NotificacionScouterModel.crearParaSeccion({
            educando_id,
            educando_nombre: `${educando.nombre} ${educando.apellidos}`,
            seccion_id: educando.seccion_id,
            tipo: 'cancelacion_campamento',
            titulo: `${educando.nombre} ${educando.apellidos} no asistira al campamento`,
            mensaje: `La familia ha indicado que ${educando.nombre} no asistira a "${actividad.titulo}".`,
            prioridad: 'normal',
            metadata: {
              actividad_id,
              actividad_titulo: actividad.titulo,
              actividad_tipo: 'campamento',
              asistira: false
            }
          });
        }
      } catch (notifError) {
        console.error('Error creando notificacion (no bloquea operacion):', notifError);
      }

      return res.json({
        success: true,
        message: 'Respuesta registrada: No asistira',
        data: inscripcion
      });
    }

    // Inscripcion completa (asiste = true)
    // El estado es 'inscrito' si datos_confirmados es true, sino 'pendiente'
    const estadoInscripcion = req.body.datos_confirmados ? 'inscrito' : 'pendiente';

    const inscripcion = await inscripcionModel.createOrUpdate({
      actividad_id,
      educando_id,
      familiar_id,
      estado: estadoInscripcion,
      email_familiar,
      telefono_familiar,
      nombre_familiar,
      alergias,
      intolerancias,
      dieta_especial,
      medicacion,
      observaciones_medicas,
      telefono_emergencia,
      persona_emergencia,
      observaciones,
      datos_confirmados: req.body.datos_confirmados || false
    });

    // Actualizar Google Sheets si existe
    if (actividad.sheets_inscripciones_id) {
      const educando = await educandoModel.findById(educando_id);
      await agregarInscripcion(actividad.sheets_inscripciones_id, {
        email: email_familiar,
        nombreFamiliar: nombre_familiar,
        telefono: telefono_familiar,
        nombreAsistente: `${educando.nombre} ${educando.apellidos}`,
        seccion: educando.seccion_nombre || '',
        asistira: true,
        alergias: alergias || '',
        dieta: dieta_especial || '',
        circularSubida: false,
        justificanteSubido: false,
        estado: 'Pendiente'
      });
    }

    // Registrar asistencia en spreadsheet por sección (crea el sheet si es la primera inscripción)
    await registrarAsistenciaCampamento(
      actividad_id,
      educando_id,
      true,  // asiste
      observaciones || '',
      tipoCampamento,
      actividad.titulo
    );

    // Crear notificacion para scouters de la seccion
    try {
      const educando = await educandoModel.findById(educando_id);
      if (educando && educando.seccion_id) {
        await NotificacionScouterModel.crearParaSeccion({
          educando_id,
          educando_nombre: `${educando.nombre} ${educando.apellidos}`,
          seccion_id: educando.seccion_id,
          tipo: 'inscripcion_campamento',
          titulo: `${educando.nombre} ${educando.apellidos} se ha inscrito al campamento`,
          mensaje: `La familia ha inscrito a ${educando.nombre} en "${actividad.titulo}".`,
          prioridad: 'alta',
          metadata: {
            actividad_id,
            actividad_titulo: actividad.titulo,
            actividad_tipo: 'campamento',
            asistira: true
          }
        });
      }
    } catch (notifError) {
      console.error('Error creando notificacion (no bloquea operacion):', notifError);
    }

    res.json({
      success: true,
      message: 'Inscripcion registrada correctamente',
      data: inscripcion
    });
  } catch (error) {
    console.error('Error en inscribirCampamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la inscripcion',
      error: error.message
    });
  }
};

/**
 * Subir circular firmada
 * POST /api/inscripciones-campamento/:id/circular-firmada
 */
const subirCircularFirmadaController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningun archivo'
      });
    }

    // Obtener inscripcion
    const inscripcion = await inscripcionModel.findById(id);
    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripcion no encontrada'
      });
    }

    // Obtener actividad para el tipo de campamento
    const actividad = await actividadModel.findById(inscripcion.actividad_id);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Determinar tipo de campamento desde titulo o metadata
    const tipoCampamento = detectarTipoCampamento(actividad.titulo);

    // Subir archivo a Drive
    const resultado = await subirCircularFirmada(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      tipoCampamento,
      {
        nombre: `${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}`,
        seccion: inscripcion.seccion_nombre
      }
    );

    // Actualizar inscripcion
    await inscripcionModel.update(id, {
      circular_firmada_drive_id: resultado.fileId,
      circular_firmada_url: resultado.fileUrl
    });

    // Enviar email a la seccion
    const emailSeccion = getEmailSeccion(inscripcion.seccion_nombre);
    if (emailSeccion) {
      try {
        await sendEmail({
          to: emailSeccion,
          subject: `Circular Firmada - ${inscripcion.educando_nombre} ${inscripcion.educando_apellidos} - ${actividad.titulo}`,
          html: `
            <h2>Nueva circular firmada recibida</h2>
            <p><strong>Campamento:</strong> ${actividad.titulo}</p>
            <p><strong>Educando:</strong> ${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}</p>
            <p><strong>Seccion:</strong> ${inscripcion.seccion_nombre}</p>
            <p><strong>Familiar:</strong> ${inscripcion.nombre_familiar || inscripcion.familiar_nombre}</p>
            <p><strong>Email:</strong> ${inscripcion.email_familiar || inscripcion.familiar_email}</p>
            <p><strong>Telefono:</strong> ${inscripcion.telefono_familiar || inscripcion.familiar_telefono}</p>
            <br>
            <p><a href="${resultado.webViewLink || resultado.fileUrl}">Ver circular firmada en Google Drive</a></p>
          `
        });

        // Marcar como enviada
        await inscripcionModel.update(id, {
          circular_enviada_seccion: true
        });
      } catch (emailError) {
        console.error('Error enviando email a seccion:', emailError);
        // No fallar la operacion por error de email
      }
    }

    // Actualizar Google Sheets
    if (actividad.sheets_inscripciones_id) {
      await actualizarInscripcion(
        actividad.sheets_inscripciones_id,
        `${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}`,
        { circularSubida: true }
      );
    }

    // Crear notificacion para scouters de la seccion
    try {
      if (inscripcion.seccion_id) {
        await NotificacionScouterModel.crearParaSeccion({
          educando_id: inscripcion.educando_id,
          educando_nombre: `${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}`,
          seccion_id: inscripcion.seccion_id,
          tipo: 'documento_campamento',
          titulo: `${inscripcion.educando_nombre} ha subido la circular firmada`,
          mensaje: `La familia ha subido la circular firmada de "${actividad.titulo}" para ${inscripcion.educando_nombre}.`,
          prioridad: 'normal',
          metadata: {
            actividad_id: inscripcion.actividad_id,
            actividad_titulo: actividad.titulo,
            tipo_documento: 'circular_firmada',
            documento_url: resultado.fileUrl
          }
        });
      }
    } catch (notifError) {
      console.error('Error creando notificacion (no bloquea operacion):', notifError);
    }

    res.json({
      success: true,
      message: 'Circular firmada subida correctamente',
      data: {
        fileId: resultado.fileId,
        fileUrl: resultado.fileUrl,
        emailEnviado: !!emailSeccion
      }
    });
  } catch (error) {
    console.error('Error en subirCircularFirmada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la circular firmada',
      error: error.message
    });
  }
};

/**
 * Subir justificante de pago
 * POST /api/inscripciones-campamento/:id/justificante-pago
 */
const subirJustificantePagoController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningun archivo'
      });
    }

    // Obtener inscripcion
    const inscripcion = await inscripcionModel.findById(id);
    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripcion no encontrada'
      });
    }

    // Obtener actividad para el tipo de campamento
    const actividad = await actividadModel.findById(inscripcion.actividad_id);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Determinar tipo de campamento
    const tipoCampamento = detectarTipoCampamento(actividad.titulo);

    // Subir archivo a Drive
    const resultado = await subirJustificantePago(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      tipoCampamento,
      {
        nombre: `${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}`,
        seccion: inscripcion.seccion_nombre
      }
    );

    // Actualizar inscripcion - Auto-marcar como pagado al subir justificante
    await inscripcionModel.update(id, {
      justificante_pago_drive_id: resultado.fileId,
      justificante_pago_url: resultado.fileUrl,
      pagado: true,
      fecha_pago: new Date(),
      metodo_pago: 'justificante_automatico'
    });

    // Enviar email a tesoreria
    try {
      await sendEmail({
        to: DRIVE_CONFIG.EMAIL_TESORERIA,
        subject: `Justificante de Pago - ${inscripcion.educando_nombre} ${inscripcion.educando_apellidos} - ${actividad.titulo}`,
        html: `
          <h2>Nuevo justificante de pago recibido</h2>
          <p><strong>Campamento:</strong> ${actividad.titulo}</p>
          <p><strong>Precio:</strong> ${actividad.precio ? actividad.precio + '€' : 'No especificado'}</p>
          <p><strong>Educando:</strong> ${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}</p>
          <p><strong>Seccion:</strong> ${inscripcion.seccion_nombre}</p>
          <p><strong>Familiar:</strong> ${inscripcion.nombre_familiar || inscripcion.familiar_nombre}</p>
          <p><strong>Email:</strong> ${inscripcion.email_familiar || inscripcion.familiar_email}</p>
          <p><strong>Telefono:</strong> ${inscripcion.telefono_familiar || inscripcion.familiar_telefono}</p>
          <br>
          <p><a href="${resultado.webViewLink || resultado.fileUrl}">Ver justificante en Google Drive</a></p>
        `
      });

      // Marcar como enviado
      await inscripcionModel.update(id, {
        justificante_enviado_tesoreria: true
      });
    } catch (emailError) {
      console.error('Error enviando email a tesoreria:', emailError);
      // No fallar la operacion por error de email
    }

    // Actualizar Google Sheets
    if (actividad.sheets_inscripciones_id) {
      await actualizarInscripcion(
        actividad.sheets_inscripciones_id,
        `${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}`,
        { justificanteSubido: true }
      );
    }

    // Crear notificacion para scouters de la seccion
    try {
      if (inscripcion.seccion_id) {
        await NotificacionScouterModel.crearParaSeccion({
          educando_id: inscripcion.educando_id,
          educando_nombre: `${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}`,
          seccion_id: inscripcion.seccion_id,
          tipo: 'pago_campamento',
          titulo: `${inscripcion.educando_nombre} ha subido justificante de pago`,
          mensaje: `La familia ha subido el justificante de pago de "${actividad.titulo}" para ${inscripcion.educando_nombre}.`,
          prioridad: 'normal',
          metadata: {
            actividad_id: inscripcion.actividad_id,
            actividad_titulo: actividad.titulo,
            tipo_documento: 'justificante_pago',
            documento_url: resultado.fileUrl
          }
        });
      }
    } catch (notifError) {
      console.error('Error creando notificacion (no bloquea operacion):', notifError);
    }

    // Obtener inscripción actualizada con pagado: true
    const inscripcionActualizada = await inscripcionModel.findById(id);

    res.json({
      success: true,
      message: 'Justificante de pago subido correctamente',
      data: {
        inscripcion: inscripcionActualizada,
        fileId: resultado.fileId,
        fileUrl: resultado.fileUrl,
        emailEnviado: true
      }
    });
  } catch (error) {
    console.error('Error en subirJustificantePago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir el justificante de pago',
      error: error.message
    });
  }
};

/**
 * Obtener estado de inscripcion
 * GET /api/inscripciones-campamento/:id
 */
const getEstadoInscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripcion = await inscripcionModel.findById(id);
    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripcion no encontrada'
      });
    }

    res.json({
      success: true,
      data: inscripcion
    });
  } catch (error) {
    console.error('Error en getEstadoInscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de inscripcion',
      error: error.message
    });
  }
};

/**
 * Obtener inscripcion por actividad y educando
 * GET /api/inscripciones-campamento/actividad/:actividadId/educando/:educandoId
 */
const getInscripcionByActividadEducando = async (req, res) => {
  try {
    const { actividadId, educandoId } = req.params;

    const inscripcion = await inscripcionModel.findByActividadAndEducando(actividadId, educandoId);

    res.json({
      success: true,
      data: inscripcion
    });
  } catch (error) {
    console.error('Error en getInscripcionByActividadEducando:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripcion',
      error: error.message
    });
  }
};

/**
 * Obtener inscripciones de un familiar
 * GET /api/inscripciones-campamento/mis-inscripciones
 */
const getMisInscripciones = async (req, res) => {
  try {
    const familiarId = req.usuario?.id || req.user?.id;
    const { proximos } = req.query;

    const inscripciones = await inscripcionModel.findByFamiliar(familiarId, {
      proximos: proximos === 'true'
    });

    res.json({
      success: true,
      data: inscripciones
    });
  } catch (error) {
    console.error('Error en getMisInscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripciones',
      error: error.message
    });
  }
};

/**
 * Obtener todas las inscripciones de un campamento (para scouters)
 * GET /api/inscripciones-campamento/campamento/:actividadId
 */
const getInscripcionesPorCampamento = async (req, res) => {
  try {
    const { actividadId } = req.params;
    const { estado, seccion_id, pagado } = req.query;

    const inscripciones = await inscripcionModel.findByActividad(actividadId, {
      estado,
      seccion_id: seccion_id ? parseInt(seccion_id) : undefined,
      pagado: pagado !== undefined ? pagado === 'true' : undefined
    });

    res.json({
      success: true,
      data: inscripciones
    });
  } catch (error) {
    console.error('Error en getInscripcionesPorCampamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inscripciones del campamento',
      error: error.message
    });
  }
};

/**
 * Obtener estadisticas de un campamento
 * GET /api/inscripciones-campamento/campamento/:actividadId/estadisticas
 */
const getEstadisticasCampamento = async (req, res) => {
  try {
    const { actividadId } = req.params;

    const estadisticas = await inscripcionModel.getEstadisticas(actividadId);
    const resumenDietas = await inscripcionModel.getResumenDietas(actividadId);

    res.json({
      success: true,
      data: {
        ...estadisticas,
        dietas: resumenDietas
      }
    });
  } catch (error) {
    console.error('Error en getEstadisticasCampamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadisticas',
      error: error.message
    });
  }
};

/**
 * Actualizar inscripcion (para scouters)
 * PUT /api/inscripciones-campamento/:id
 */
const actualizarInscripcionController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Agregar quien actualiza
    updateData.actualizado_por = req.usuario?.id || req.user?.id;

    const inscripcion = await inscripcionModel.update(id, updateData);

    res.json({
      success: true,
      message: 'Inscripcion actualizada correctamente',
      data: inscripcion
    });
  } catch (error) {
    console.error('Error en actualizarInscripcion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar inscripcion',
      error: error.message
    });
  }
};

/**
 * Marcar pago como recibido (para scouters/tesoreria)
 * POST /api/inscripciones-campamento/:id/confirmar-pago
 */
const confirmarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodo_pago, referencia_pago } = req.body;

    const inscripcion = await inscripcionModel.registrarPago(id, metodo_pago, referencia_pago);

    // Actualizar Google Sheets
    const actividad = await actividadModel.findById(inscripcion.actividad_id);
    if (actividad && actividad.sheets_inscripciones_id) {
      await actualizarInscripcion(
        actividad.sheets_inscripciones_id,
        `${inscripcion.educando_nombre} ${inscripcion.educando_apellidos}`,
        { estado: 'Pagado' }
      );
    }

    res.json({
      success: true,
      message: 'Pago confirmado correctamente',
      data: inscripcion
    });
  } catch (error) {
    console.error('Error en confirmarPago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar pago',
      error: error.message
    });
  }
};

/**
 * Prellenar datos de salud desde ficha del educando
 * GET /api/inscripciones-campamento/educando/:educandoId/datos-salud
 */
const getDatosSaludEducando = async (req, res) => {
  try {
    const { educandoId } = req.params;

    const datosSalud = await inscripcionModel.prellenarDatosSalud(educandoId);

    if (!datosSalud) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    res.json({
      success: true,
      data: datosSalud
    });
  } catch (error) {
    console.error('Error en getDatosSaludEducando:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de salud',
      error: error.message
    });
  }
};

/**
 * Detectar tipo de campamento desde titulo
 */
const detectarTipoCampamento = (titulo) => {
  const tituloLower = titulo.toLowerCase();

  if (tituloLower.includes('inicio') || tituloLower.includes('apertura')) {
    return 'INICIO';
  }
  if (tituloLower.includes('navidad') || tituloLower.includes('christmas')) {
    return 'NAVIDAD';
  }
  if (tituloLower.includes('aniversario')) {
    return 'ANIVERSARIO';
  }
  if (tituloLower.includes('pascua') || tituloLower.includes('semana santa')) {
    return 'PASCUA';
  }
  if (tituloLower.includes('verano') || tituloLower.includes('summer')) {
    return 'VERANO';
  }

  // Por defecto retornar INICIO
  return 'INICIO';
};

module.exports = {
  inscribirCampamento,
  subirCircularFirmada: subirCircularFirmadaController,
  subirJustificantePago: subirJustificantePagoController,
  getEstadoInscripcion,
  getInscripcionByActividadEducando,
  getMisInscripciones,
  getInscripcionesPorCampamento,
  getEstadisticasCampamento,
  actualizarInscripcion: actualizarInscripcionController,
  confirmarPago,
  getDatosSaludEducando
};
