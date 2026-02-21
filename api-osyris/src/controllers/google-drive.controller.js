/**
 * Controlador de Google Drive para documentos de educandos
 */

const driveService = require('../services/google-drive.service');
const educandoModel = require('../models/educando.model');
const familiarEducandoModel = require('../models/familiar_educando.model');
const documentosFamiliaModel = require('../models/documentos_familia.model');
const documentosHistorialModel = require('../models/documentos_historial.model');
const notificacionModel = require('../models/notificaciones_familia.model');
const notificacionScouterModel = require('../models/notificaciones_scouter.model');
const notificacionesService = require('../services/notificaciones.service');

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
 * Lista las circulares disponibles de un tipo de campamento
 */
const getCircularesCampamento = async (req, res) => {
  try {
    const { tipo } = req.params;

    const circulares = await driveService.listCircularesCampamento(tipo);

    res.json({
      success: true,
      data: circulares
    });
  } catch (error) {
    console.error('Error obteniendo circulares de campamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener circulares',
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
    const familiarId = req.usuario?.id;

    // Obtener datos del educando
    const educando = await educandoModel.findById(educandoId);
    if (!educando) {
      return res.status(404).json({
        success: false,
        message: 'Educando no encontrado'
      });
    }

    // Verificar que el familiar tiene acceso a este educando
    if (familiarId && req.usuario?.rol !== 'admin' && req.usuario?.rol !== 'scouter') {
      const tieneAcceso = await familiarEducandoModel.verificarAcceso(familiarId, educandoId);
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
    const familiarId = req.usuario?.id;
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
    if (familiarId && req.usuario?.rol !== 'admin' && req.usuario?.rol !== 'scouter') {
      const tieneAcceso = await familiarEducandoModel.verificarAcceso(familiarId, educandoId);
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

    // Verificar si ya existe un documento del mismo tipo para este educando
    const documentoExistente = await documentosFamiliaModel.findByEducandoAndTipo(educandoId, tipoDocumento);
    let esActualizacion = false;

    // Verificar límite de subidas (1 por día)
    if (documentoExistente) {
      const hoy = new Date().toISOString().split('T')[0];
      let subidasHoy = documentoExistente.subidas_hoy || 0;

      // Resetear contador si es nuevo día
      if (documentoExistente.fecha_reset_subidas !== hoy) {
        subidasHoy = 0;
      }

      // Verificar límite (permitir si es admin/scouter o si no ha llegado al límite)
      const esAdminOScouter = req.usuario?.rol === 'admin' || req.usuario?.rol === 'scouter';
      if (!esAdminOScouter && subidasHoy >= 1) {
        return res.status(429).json({
          success: false,
          message: 'Has alcanzado el límite de subidas para este documento hoy. Podrás volver a subirlo mañana o solicitar un desbloqueo.',
          data: {
            subidasHoy,
            limiteDiario: 1,
            ultimaSubida: documentoExistente.ultima_subida
          }
        });
      }
    }

    // Si existe documento anterior, GUARDAR EN HISTORIAL antes de eliminar de Drive
    if (documentoExistente && documentoExistente.google_drive_file_id) {
      try {
        // 1. Guardar versión anterior en historial
        console.log(`📦 Guardando versión anterior en historial (ID: ${documentoExistente.id})`);
        await documentosHistorialModel.guardarVersionAnterior(documentoExistente.id, {
          google_drive_file_id: documentoExistente.google_drive_file_id,
          archivo_nombre: documentoExistente.archivo_nombre,
          archivo_ruta: documentoExistente.archivo_ruta,
          tipo_archivo: documentoExistente.tipo_archivo,
          tamaño_archivo: documentoExistente.tamaño_archivo,
          version: documentoExistente.version_activa || 1,
          subido_por: documentoExistente.familiar_id,
          fecha_subida: documentoExistente.fecha_subida,
          estado: 'reemplazado',
          motivo: 'Nueva versión subida por familiar'
        });

        // 2. Eliminar archivo viejo de Drive
        console.log(`🗑️ Eliminando archivo anterior de Drive: ${documentoExistente.google_drive_file_id}`);
        await driveService.deleteFile(documentoExistente.google_drive_file_id);
        esActualizacion = true;
      } catch (historialError) {
        console.error('Error guardando historial o eliminando archivo anterior:', historialError);
        // Continuar con la subida aunque falle
        esActualizacion = true;
      }
    }

    // Subir archivo a carpeta de PENDIENTES (no a la carpeta definitiva)
    // El documento se moverá a la carpeta del educando cuando el scouter lo apruebe
    const uploadedFile = await driveService.uploadDocumentToPendientes(
      fileName,
      file.buffer,
      file.mimetype,
      {
        educandoId,
        tipoDocumento,
        familiarId,
        destinationFolderId: folder.id  // Carpeta destino cuando se apruebe
      }
    );

    console.log(`📤 Documento subido a PENDIENTES: ${fileName} (File ID: ${uploadedFile.id})`);

    let documento;

    const hoy = new Date().toISOString().split('T')[0];

    if (documentoExistente) {
      // Actualizar documento existente - SIEMPRE requiere re-aprobación
      console.log(`🔄 Actualizando documento existente (ID: ${documentoExistente.id})`);
      const nuevaVersion = (documentoExistente.version_activa || 1) + 1;
      const subidasHoyActualizadas = (documentoExistente.fecha_reset_subidas === hoy)
        ? (documentoExistente.subidas_hoy || 0) + 1
        : 1;

      documento = await documentosFamiliaModel.updateForReupload(documentoExistente.id, {
        archivo_nombre: fileName,
        archivo_ruta: uploadedFile.webViewLink,
        tipo_archivo: file.mimetype,
        tamaño_archivo: file.size,
        google_drive_file_id: uploadedFile.id,
        // Campos de control de subidas
        ultima_subida: new Date(),
        subidas_hoy: subidasHoyActualizadas,
        fecha_reset_subidas: hoy,
        version_activa: nuevaVersion,
        tiene_version_anterior: true
      });
      esActualizacion = true;
    } else {
      // Crear nuevo registro en base de datos con estado pendiente de revisión
      const documentoData = {
        educando_id: educandoId,
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
        google_drive_folder_id: folder.id,
        // Campos de control de subidas (nuevos)
        ultima_subida: new Date(),
        subidas_hoy: 1,
        fecha_reset_subidas: hoy,
        version_activa: 1,
        tiene_version_anterior: false
      };

      documento = await documentosFamiliaModel.create(documentoData);
    }

    // Crear notificación para scouters de la sección
    const accion = esActualizacion ? 'actualizado' : 'subido';
    try {
      await notificacionScouterModel.crearParaSeccion({
        educando_id: educandoId,
        educando_nombre: nombreCompleto,
        seccion_id: educando.seccion_id,
        tipo: 'documento_pendiente',
        titulo: `Documento ${accion}: ${tipoConfig.nombre}`,
        mensaje: `${nombreCompleto} ha ${accion} "${tipoConfig.nombre}". Requiere re-aprobación.`,
        enlace_accion: '/aula-virtual/documentos-pendientes',
        metadata: {
          documento_id: documento.id,
          tipo_documento: tipoDocumento,
          familiar_id: familiarId,
          es_actualizacion: esActualizacion
        },
        prioridad: 'alta'
      });
    } catch (notifError) {
      console.error('Error creando notificación scouter:', notifError);
      // No fallar la operación por error de notificación
    }

    const mensajeRespuesta = esActualizacion
      ? 'Documento actualizado correctamente. Requiere re-aprobación por el kraal de sección.'
      : 'Documento subido correctamente. Pendiente de revisión por el kraal de sección.';

    res.json({
      success: true,
      message: mensajeRespuesta,
      data: {
        documento,
        driveFile: uploadedFile,
        esActualizacion
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
 * FLUJO: Mueve el archivo de carpeta Pendientes → carpeta del educando
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

    // ============================================================
    // PASO CRÍTICO: Mover archivo de PENDIENTES a carpeta del educando
    // ============================================================
    if (documento.google_drive_file_id && documento.google_drive_folder_id) {
      try {
        console.log(`📦 Moviendo documento de Pendientes a carpeta del educando...`);
        console.log(`   File ID: ${documento.google_drive_file_id}`);
        console.log(`   Destino: ${documento.google_drive_folder_id}`);

        const movedFile = await driveService.moveFileToFolder(
          documento.google_drive_file_id,
          documento.google_drive_folder_id
        );

        console.log(`✅ Documento movido exitosamente: ${movedFile.name}`);

        // Actualizar el link y file_id del archivo en la BD
        // Aunque el ID generalmente no cambia al mover, sincronizamos para consistencia
        if (movedFile.id || movedFile.webViewLink) {
          const updateData = {};
          if (movedFile.webViewLink) {
            updateData.archivo_ruta = movedFile.webViewLink;
          }
          if (movedFile.id) {
            updateData.google_drive_file_id = movedFile.id;
          }
          await documentosFamiliaModel.update(documentoId, updateData);
          console.log(`📝 BD actualizada con file_id: ${movedFile.id}`);
        }
      } catch (moveError) {
        console.error('Error moviendo archivo en Drive:', moveError);

        // Si falla el movimiento, buscar si ya existe un archivo del mismo tipo
        // en la carpeta del educando y usar ese
        try {
          console.log('🔍 Buscando archivo existente del mismo tipo en carpeta destino...');
          const existingFiles = await driveService.listEducandoDocuments(documento.google_drive_folder_id);
          const tipoDoc = documento.tipo_documento;

          // Buscar archivo que coincida con el tipo de documento
          const matchingFile = existingFiles.find(f => {
            const detectedType = driveService.detectarTipoDocumento(f.name);
            return detectedType === tipoDoc;
          });

          if (matchingFile) {
            console.log(`✅ Encontrado archivo existente: ${matchingFile.name} (ID: ${matchingFile.id})`);
            await documentosFamiliaModel.update(documentoId, {
              google_drive_file_id: matchingFile.id,
              archivo_ruta: matchingFile.webViewLink
            });
            console.log('📝 BD actualizada con archivo existente');
          } else {
            console.log('⚠️ No se encontró archivo existente, el documento quedará pendiente de limpieza manual');
          }
        } catch (fallbackError) {
          console.error('Error en fallback:', fallbackError.message);
        }
      }
    }

    // Aprobar documento con userId validado
    const documentoActualizado = await documentosFamiliaModel.aprobar(documentoId, userId);

    // Eliminar notificaciones de scouter asociadas a este documento
    // (para que no sigan apareciendo como pendientes en "Actividad Reciente")
    try {
      await notificacionScouterModel.removeByDocumentoId(documentoId);
    } catch (removeError) {
      console.error('Error eliminando notificación scouter:', removeError);
    }

    // Notificar a la familia (usa servicio centralizado para urgencia)
    try {
      await notificacionModel.crearNotificacionDocumentoAprobado({
        documentoId,
        familiarId: documento.familiar_id,
        tipoDocumento: documento.titulo
      });
      // Marcar urgencia según config
      const { es_urgente } = await notificacionesService.getConfigUrgencia('documento_aprobado');
      if (es_urgente) {
        const { query: dbQuery } = require('../config/db.config');
        await dbQuery(
          `UPDATE notificaciones_familia SET urgente = TRUE, mostrar_modal = TRUE
           WHERE familiar_id = $1 AND metadata->>'documento_id' = $2 AND urgente IS NOT TRUE`,
          [documento.familiar_id, documentoId.toString()]
        );
      }
    } catch (notifError) {
      console.error('Error creando notificación:', notifError);
    }

    res.json({
      success: true,
      message: 'Documento aprobado y movido a carpeta definitiva',
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

    // 1. Guardar versión rechazada en historial
    if (documento.google_drive_file_id) {
      try {
        await documentosHistorialModel.guardarVersionAnterior(documentoId, {
          google_drive_file_id: documento.google_drive_file_id,
          archivo_nombre: documento.archivo_nombre,
          archivo_ruta: documento.archivo_ruta,
          tipo_archivo: documento.tipo_archivo,
          tamaño_archivo: documento.tamaño_archivo,
          version: documento.version_activa || 1,
          subido_por: documento.familiar_id,
          fecha_subida: documento.fecha_subida,
          estado: 'rechazado',
          motivo: motivo
        });
      } catch (historialError) {
        console.error('Error guardando versión rechazada en historial:', historialError);
      }

      // ============================================================
      // PASO CRÍTICO: Eliminar archivo de carpeta PENDIENTES
      // (El archivo rechazado no debe quedarse en Drive)
      // ============================================================
      try {
        console.log(`🗑️ Eliminando archivo rechazado de Pendientes: ${documento.google_drive_file_id}`);
        await driveService.deleteFile(documento.google_drive_file_id);
        console.log(`✅ Archivo eliminado de Drive`);
      } catch (deleteError) {
        console.error('Error eliminando archivo de Drive:', deleteError);
        // Continuar aunque falle la eliminación
      }
    }

    // 2. Verificar si hay versión anterior válida para restaurar
    let documentoActualizado;
    let versionRestaurada = false;

    if (documento.tiene_version_anterior) {
      const versionAnterior = await documentosHistorialModel.obtenerVersionAnteriorValida(documentoId);

      if (versionAnterior && versionAnterior.google_drive_file_id) {
        // Restaurar versión anterior + resetear límite 24h
        documentoActualizado = await documentosFamiliaModel.update(documentoId, {
          google_drive_file_id: versionAnterior.google_drive_file_id,
          archivo_nombre: versionAnterior.archivo_nombre,
          archivo_ruta: versionAnterior.archivo_ruta,
          tipo_archivo: versionAnterior.tipo_archivo,
          tamaño_archivo: versionAnterior.tamaño_archivo,
          estado: 'vigente',
          estado_revision: 'aprobado',
          aprobado: true,
          motivo_rechazo: null,
          // Resetear límite 24h para permitir nuevo intento inmediato
          subidas_hoy: 0,
          fecha_reset_subidas: new Date().toISOString().split('T')[0]
        });

        // Marcar versión como restaurada
        await documentosHistorialModel.marcarComoRestaurada(versionAnterior.id);
        versionRestaurada = true;
      } else {
        // No hay versión válida, solo rechazar y resetear límite
        documentoActualizado = await documentosFamiliaModel.rechazar(documentoId, userId, motivo);
        await documentosFamiliaModel.update(documentoId, {
          subidas_hoy: 0,
          fecha_reset_subidas: new Date().toISOString().split('T')[0]
        });
      }
    } else {
      // Primera versión rechazada, resetear límite 24h
      documentoActualizado = await documentosFamiliaModel.rechazar(documentoId, userId, motivo);
      await documentosFamiliaModel.update(documentoId, {
        subidas_hoy: 0,
        fecha_reset_subidas: new Date().toISOString().split('T')[0]
      });
    }

    // 3. Eliminar notificaciones de scouter asociadas a este documento
    try {
      await notificacionScouterModel.removeByDocumentoId(documentoId);
    } catch (removeError) {
      console.error('Error eliminando notificación scouter:', removeError);
    }

    // 4. Notificar a la familia (mensaje diferente si se restauró versión)
    try {
      if (versionRestaurada) {
        await notificacionModel.crearNotificacion({
          usuario_id: documento.familiar_id,
          tipo: 'documento_restaurado',
          titulo: 'Documento rechazado - Versión anterior restaurada',
          mensaje: `El documento "${documento.titulo}" ha sido rechazado. Motivo: ${motivo}. Se ha restaurado la versión anterior válida. Puedes subir una nueva versión inmediatamente.`,
          enlace_accion: '/familia/documentos',
          metadata: {
            documento_id: documentoId,
            motivo_rechazo: motivo
          }
        });
      } else {
        await notificacionModel.crearNotificacionDocumentoRechazado({
          documentoId,
          familiarId: documento.familiar_id,
          tipoDocumento: documento.titulo,
          motivo
        });
      }
      // Marcar urgencia según config
      const { es_urgente } = await notificacionesService.getConfigUrgencia('documento_rechazado');
      if (es_urgente) {
        const { query: dbQuery } = require('../config/db.config');
        await dbQuery(
          `UPDATE notificaciones_familia SET urgente = TRUE, mostrar_modal = TRUE
           WHERE familiar_id = $1 AND metadata->>'documento_id' = $2 AND urgente IS NOT TRUE`,
          [documento.familiar_id, documentoId.toString()]
        );
      }
    } catch (notifError) {
      console.error('Error creando notificación:', notifError);
    }

    res.json({
      success: true,
      message: versionRestaurada
        ? 'Documento rechazado. Versión anterior restaurada. Límite de subida reseteado.'
        : 'Documento rechazado. Límite de subida reseteado.',
      data: documentoActualizado,
      versionRestaurada
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

    const fechaNacimiento = new Date(educando.fecha_nacimiento);
    const anioNacimiento = fechaNacimiento.getFullYear();
    const nombreCompleto = `${educando.nombre} ${educando.apellidos}`;
    const seccionSlug = educando.seccion_nombre?.toLowerCase().replace(/\s+/g, '') || '';

    // Calcular edad para filtrar documentos opcionales (DOC08, DOC09)
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesCumple = fechaNacimiento.getMonth();
    if (mesActual < mesCumple || (mesActual === mesCumple && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    // Obtener estado actual en Drive (pasando edad para filtrar documentos opcionales)
    const estructura = await driveService.getEducandoFolderStructure(
      seccionSlug,
      anioNacimiento,
      nombreCompleto,
      edad,
      educandoId
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
  getCircularesCampamento,
  getEducandoDocumentos,
  uploadDocumento,
  aprobarDocumento,
  rechazarDocumento,
  getDocumentosPendientes,
  syncEducandoDocumentos,
  previewFile
};
