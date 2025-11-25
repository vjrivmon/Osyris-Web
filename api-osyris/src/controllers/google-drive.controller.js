/**
 * Controlador de Google Drive para documentos de educandos
 */

const driveService = require('../services/google-drive.service');
const educandoModel = require('../models/educando.model');
const documentosFamiliaModel = require('../models/documentos_familia.model');
const notificacionModel = require('../models/notificaciones_familia.model');
const notificacionScouterModel = require('../models/notificaciones_scouter.model');

/**
 * Lista las plantillas disponibles para descargar
 */
const getPlantillas = async (req, res) => {
  try {
    const plantillas = await driveService.listPlantillas();

    res.json({
      success: true,
      data: plantillas
    });
  } catch (error) {
    console.error('Error obteniendo plantillas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas',
      error: error.message
    });
  }
};

/**
 * Descarga una plantilla específica
 */
const downloadPlantilla = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Obtener metadatos para el nombre del archivo
    const metadata = await driveService.getFileMetadata(fileId);
    const fileBuffer = await driveService.downloadFile(fileId);

    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
  } catch (error) {
    console.error('Error descargando plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar plantilla',
      error: error.message
    });
  }
};

/**
 * Obtiene la estructura de documentos de un educando
 */
const getEducandoDocumentos = async (req, res) => {
  try {
    const { educandoId } = req.params;
    const familiarId = req.user?.id;

    // Obtener datos del educando
    const educando = await educandoModel.findById(educandoId);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Verificar que el familiar tiene acceso a este educando
    if (familiarId && req.user.rol !== 'admin' && req.user.rol !== 'scouter') {
      const tieneAcceso = await educandoModel.verificarAccesoFamiliar(educandoId, familiarId);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este educando'
        });
      }
    }

    // Obtener año de nacimiento y calcular edad
    const fechaNacimiento = new Date(educando.fecha_nacimiento);
    const anioNacimiento = fechaNacimiento.getFullYear();
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesCumple = fechaNacimiento.getMonth();
    if (mesActual < mesCumple || (mesActual === mesCumple && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    // Derivar slug de sección desde el nombre (ej: "Lobatos" -> "lobatos")
    const seccionSlug = educando.seccion_nombre?.toLowerCase().replace(/\s+/g, '') || '';

    // Obtener estructura de carpeta y documentos (pasando edad para filtrar documentos opcionales)
    // También pasamos educandoId para consultar estado de revisión en BD
    const estructura = await driveService.getEducandoFolderStructure(
      seccionSlug,
      anioNacimiento,
      `${educando.nombre} ${educando.apellidos}`,
      edad,
      educando.id
    );

    res.json({
      success: true,
      data: {
        educando: {
          id: educando.id,
          nombre: educando.nombre,
          apellidos: educando.apellidos,
          seccion: educando.seccion_nombre
        },
        ...estructura
      }
    });
  } catch (error) {
    console.error('Error obteniendo documentos de educando:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos',
      error: error.message
    });
  }
};

/**
 * Sube un documento a la carpeta del educando en Drive
 */
const uploadDocumento = async (req, res) => {
  try {
    const { educandoId, tipoDocumento } = req.body;
    const familiarId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    // Obtener datos del educando
    const educando = await educandoModel.findById(educandoId);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Verificar acceso del familiar
    if (familiarId && req.user.rol !== 'admin' && req.user.rol !== 'scouter') {
      const tieneAcceso = await educandoModel.verificarAccesoFamiliar(educandoId, familiarId);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este educando'
        });
      }
    }

    // Obtener configuración del tipo de documento
    const tipoConfig = driveService.getTipoDocumentoConfig(tipoDocumento);
    if (!tipoConfig) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento no válido'
      });
    }

    // Obtener o crear carpeta del educando
    const anioNacimiento = new Date(educando.fecha_nacimiento).getFullYear();
    const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;
    const seccionSlug = educando.seccion_nombre?.toLowerCase().replace(/\s+/g, '') || '';

    const folder = await driveService.getOrCreateEducandoFolder(
      seccionSlug,
      anioNacimiento,
      nombreCompleto
    );

    // Generar nombre del archivo según formato
    const fileName = driveService.getDocumentFileName(tipoDocumento, nombreCompleto);

    // Subir archivo a Google Drive
    const uploadedFile = await driveService.uploadDocument(
      folder.id,
      fileName,
      file.buffer,
      file.mimetype
    );

    // Crear registro en base de datos con estado pendiente de revisión
    const documentoData = {
      educando_id: educandoId,  // ✅ Usar educando_id consistentemente
      familiar_id: familiarId,
      tipo_documento: tipoDocumento,
      titulo: tipoConfig.nombre,
      descripcion: `Documento subido por familiar`,
      archivo_nombre: fileName,
      archivo_ruta: uploadedFile.webViewLink,
      tipo_archivo: file.mimetype,
      tamaño_archivo: file.size,
      estado: 'pendiente_revision',
      google_drive_file_id: uploadedFile.id,
      google_drive_folder_id: folder.id
    };

    const documento = await documentosFamiliaModel.create(documentoData);

    // Crear notificación para scouters de la sección
    try {
      await notificacionScouterModel.crearParaSeccion({
        educando_id: educandoId,
        educando_nombre: nombreCompleto,
        seccion_id: educando.seccion_id,
        tipo: 'documento_pendiente',
        titulo: `Documento pendiente: ${tipoConfig.nombre}`,
        mensaje: `${nombreCompleto} ha subido "${tipoConfig.nombre}". Revisa y aprueba el documento.`,
        enlace_accion: '/aula-virtual/documentos-pendientes',
        metadata: {
          documento_id: documento.id,
          tipo_documento: tipoDocumento,
          familiar_id: familiarId
        },
        prioridad: 'alta'
      });
    } catch (notifError) {
      console.error('Error creando notificación scouter:', notifError);
      // No fallar la operación por error de notificación
    }

    res.json({
      success: true,
      message: 'Documento subido correctamente. Pendiente de revisión por el kraal de sección.',
      data: {
        documento,
        driveFile: uploadedFile
      }
    });
  } catch (error) {
    console.error('Error subiendo documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir documento',
      error: error.message
    });
  }
};

/**
 * Aprueba un documento (solo scouters/admin)
 */
const aprobarDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const userId = req.usuario?.id;  // ✅ Confiar en middleware

    // ✅ Validación explícita de userId
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const documento = await documentosFamiliaModel.findById(documentoId);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Aprobar documento con userId validado
    const documentoActualizado = await documentosFamiliaModel.aprobar(documentoId, userId);

    // Notificar a la familia
    try {
      await notificacionModel.crearNotificacionDocumentoAprobado({
        documentoId,
        familiarId: documento.familiar_id,
        tipoDocumento: documento.titulo
      });
    } catch (notifError) {
      console.error('Error creando notificación:', notifError);
    }

    res.json({
      success: true,
      message: 'Documento aprobado correctamente',
      data: documentoActualizado
    });
  } catch (error) {
    console.error('Error aprobando documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar documento',
      error: error.message
    });
  }
};

/**
 * Rechaza un documento (solo scouters/admin)
 */
const rechazarDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const { motivo } = req.body;
    const userId = req.usuario?.id;  // ✅ Confiar en middleware

    // ✅ Validación explícita de userId
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!motivo) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un motivo de rechazo'
      });
    }

    const documento = await documentosFamiliaModel.findById(documentoId);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Rechazar documento con userId validado (pasando motivo)
    const documentoActualizado = await documentosFamiliaModel.rechazar(documentoId, userId, motivo);

    // Notificar a la familia
    try {
      await notificacionModel.crearNotificacionDocumentoRechazado({
        documentoId,
        familiarId: documento.familiar_id,
        tipoDocumento: documento.titulo,
        motivo
      });
    } catch (notifError) {
      console.error('Error creando notificación:', notifError);
    }

    res.json({
      success: true,
      message: 'Documento rechazado',
      data: documentoActualizado
    });
  } catch (error) {
    console.error('Error rechazando documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar documento',
      error: error.message
    });
  }
};

/**
 * Lista documentos pendientes de revisión (solo scouters/admin)
 */
const getDocumentosPendientes = async (req, res) => {
  try {
    const { seccionId } = req.query;

    const documentos = await documentosFamiliaModel.findByEstadoRevision('pendiente');

    // Filtrar por sección si se especifica
    let filtrados = documentos;
    if (seccionId) {
      filtrados = documentos.filter(d => d.seccion_id === parseInt(seccionId));
    }

    res.json({
      success: true,
      data: filtrados,
      total: filtrados.length
    });
  } catch (error) {
    console.error('Error obteniendo documentos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos pendientes',
      error: error.message
    });
  }
};

/**
 * Sincroniza el estado de documentos entre Drive y BD
 */
const syncEducandoDocumentos = async (req, res) => {
  try {
    const { educandoId } = req.params;

    const educando = await educandoModel.findById(educandoId);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    const anioNacimiento = new Date(educando.fecha_nacimiento).getFullYear();
    const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;
    const seccionSlug = educando.seccion_nombre?.toLowerCase().replace(/\s+/g, '') || '';

    // Obtener estado actual en Drive
    const estructura = await driveService.getEducandoFolderStructure(
      seccionSlug,
      anioNacimiento,
      nombreCompleto
    );

    res.json({
      success: true,
      message: 'Sincronización completada',
      data: estructura
    });
  } catch (error) {
    console.error('Error sincronizando documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al sincronizar documentos',
      error: error.message
    });
  }
};

/**
 * Previsualiza un archivo de Drive (proxy para evitar auth de Google)
 */
const previewFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del archivo'
      });
    }

    const fileContent = await driveService.downloadFileContent(fileId);

    // Configurar headers para el archivo
    res.setHeader('Content-Type', fileContent.mimeType);
    res.setHeader('Content-Length', fileContent.size);
    res.setHeader('Content-Disposition', `inline; filename="${fileContent.fileName}"`);

    // Enviar el contenido del archivo
    res.send(fileContent.data);
  } catch (error) {
    console.error('Error previsualizando archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el archivo',
      error: error.message
    });
  }
};

module.exports = {
  getPlantillas,
  downloadPlantilla,
  getEducandoDocumentos,
  uploadDocumento,
  aprobarDocumento,
  rechazarDocumento,
  getDocumentosPendientes,
  syncEducandoDocumentos,
  previewFile
};
