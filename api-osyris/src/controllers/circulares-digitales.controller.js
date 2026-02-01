const PerfilSaludModel = require('../models/perfil-salud.model');
const CircularActividadModel = require('../models/circular-actividad.model');
const CircularCampoModel = require('../models/circular-campo.model');
const CircularRespuestaModel = require('../models/circular-respuesta.model');
const pdfService = require('../services/pdf-circular.service');
const { query } = require('../config/db.config');

// =============================================
// PERFIL DE SALUD
// =============================================

exports.getPerfilSalud = async (req, res) => {
  try {
    const educandoId = parseInt(req.params.educandoId);
    const perfil = await PerfilSaludModel.findByEducandoId(educandoId);
    const contactos = await PerfilSaludModel.getContactos(educandoId);

    res.json({ success: true, data: { perfil, contactos } });
  } catch (error) {
    console.error('Error getPerfilSalud:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePerfilSalud = async (req, res) => {
  try {
    const educandoId = parseInt(req.params.educandoId);
    const { contactos, ...perfilData } = req.body;

    const perfil = await PerfilSaludModel.upsert(educandoId, perfilData);
    let contactosResult = [];
    if (contactos && contactos.length > 0) {
      contactosResult = await PerfilSaludModel.replaceContactos(educandoId, contactos);
    }

    // Auditoría
    await query(`
      INSERT INTO auditoria_datos_medicos (educando_id, usuario_id, accion, ip)
      VALUES ($1, $2, 'update', $3)
    `, [educandoId, req.usuario.id, req.ip]);

    res.json({ success: true, data: { perfil, contactos: contactosResult } });
  } catch (error) {
    console.error('Error updatePerfilSalud:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// CIRCULAR - FORMULARIO FAMILIAR
// =============================================

exports.getFormularioCircular = async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const educandoId = parseInt(req.query.educandoId);

    if (!educandoId) {
      return res.status(400).json({ success: false, message: 'educandoId requerido' });
    }

    const circular = await CircularActividadModel.findByActividadId(actividadId);
    if (!circular) {
      return res.status(404).json({ success: false, message: 'No hay circular para esta actividad' });
    }

    const camposCustom = await CircularCampoModel.findByCircularId(circular.id);
    const perfil = await PerfilSaludModel.findByEducandoId(educandoId);
    const contactos = await PerfilSaludModel.getContactos(educandoId);

    // Info educando
    const educandoRows = await query(`
      SELECT e.id, e.nombre, e.apellidos, e.fecha_nacimiento, s.nombre as seccion_nombre
      FROM educandos e JOIN secciones s ON e.seccion_id = s.id WHERE e.id = $1
    `, [educandoId]);
    const educando = educandoRows[0] || null;

    // Respuesta existente
    const respuestaExistente = await CircularRespuestaModel.findByCircularAndEducando(circular.id, educandoId);

    res.json({
      success: true,
      data: { circular, camposCustom, perfilSalud: perfil, contactos, educando, respuestaExistente }
    });
  } catch (error) {
    console.error('Error getFormularioCircular:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// FIRMAR CIRCULAR
// =============================================

exports.firmarCircular = async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const { educandoId, datosMedicos, contactos, camposCustom, firmaBase64, firmaTipo, aceptaCondiciones, actualizarPerfil } = req.body;

    if (!firmaBase64 || !aceptaCondiciones) {
      return res.status(400).json({ success: false, message: 'Firma y aceptación de condiciones requeridas' });
    }

    const circular = await CircularActividadModel.findByActividadId(actividadId);
    if (!circular) {
      return res.status(404).json({ success: false, message: 'Circular no encontrada' });
    }

    if (circular.estado !== 'publicada') {
      return res.status(400).json({ success: false, message: 'La circular no está abierta para firmar' });
    }

    // Actualizar perfil si el familiar lo pidió
    if (actualizarPerfil && datosMedicos) {
      await PerfilSaludModel.upsert(educandoId, datosMedicos);
      if (contactos && contactos.length > 0) {
        await PerfilSaludModel.replaceContactos(educandoId, contactos);
      }
    }

    // Crear respuesta
    const respuesta = await CircularRespuestaModel.create({
      circular_actividad_id: circular.id,
      educando_id: educandoId,
      familiar_id: req.usuario.id,
      datos_medicos_snapshot: datosMedicos || {},
      contactos_emergencia_snapshot: contactos || [],
      campos_custom_respuestas: camposCustom || {},
      firma_base64: firmaBase64,
      firma_tipo: firmaTipo || 'image',
      ip_firma: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      user_agent_firma: req.headers['user-agent'] || 'unknown'
    });

    // Info educando y familiar para PDF
    const educandoRows = await query(`
      SELECT e.*, s.nombre as seccion_nombre FROM educandos e JOIN secciones s ON e.seccion_id = s.id WHERE e.id = $1
    `, [educandoId]);
    const educando = educandoRows[0];

    // Generar PDF
    try {
      const { pdfBytes, hash } = await pdfService.generarPDF({
        respuesta,
        circular,
        educando,
        familiar: req.usuario
      });

      const filename = `Circular_${circular.id}_${educando.nombre}_${educando.apellidos}_v${respuesta.version}.pdf`.replace(/\s/g, '_');
      const driveResult = await pdfService.guardarPDF(pdfBytes, filename);

      await CircularRespuestaModel.updateEstado(respuesta.id, 'archivada', {
        pdf_drive_id: driveResult.fileId,
        pdf_hash_sha256: hash,
        pdf_local_path: driveResult.localPath
      });

      // Vincular con inscripción si existe
      await query(`
        UPDATE inscripciones_campamento SET circular_respuesta_id = $1, circular_firmada_drive_id = $2, circular_firmada_url = $3
        WHERE actividad_id = $4 AND educando_id = $5
      `, [respuesta.id, driveResult.fileId, driveResult.webViewLink, actividadId, educandoId]);

      // Auditoría
      await query(`
        INSERT INTO auditoria_datos_medicos (educando_id, usuario_id, accion, detalles, ip)
        VALUES ($1, $2, 'export', $3, $4)
      `, [educandoId, req.usuario.id, JSON.stringify({ tipo: 'firma_circular', circular_id: circular.id }), req.ip]);

      res.json({
        success: true,
        data: {
          circularRespuestaId: respuesta.id,
          pdfUrl: driveResult.webViewLink,
          pdfDriveId: driveResult.fileId
        }
      });
    } catch (pdfError) {
      console.error('Error generando PDF:', pdfError);
      await CircularRespuestaModel.updateEstado(respuesta.id, 'error_pdf');
      res.json({
        success: true,
        data: { circularRespuestaId: respuesta.id, pdfUrl: null, pdfDriveId: null },
        warning: 'Firma registrada pero hubo error generando PDF'
      });
    }
  } catch (error) {
    console.error('Error firmarCircular:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// ESTADO DE CIRCULAR (familiar)
// =============================================

exports.getEstadoCircular = async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const educandoId = parseInt(req.params.educandoId);

    const circular = await CircularActividadModel.findByActividadId(actividadId);
    if (!circular) {
      return res.json({ success: true, data: { estado: null } });
    }

    const respuesta = await CircularRespuestaModel.findByCircularAndEducando(circular.id, educandoId);
    res.json({ success: true, data: { estado: respuesta?.estado || 'pendiente', respuesta } });
  } catch (error) {
    console.error('Error getEstadoCircular:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// ADMIN: CRUD CIRCULARES
// =============================================

exports.crearCircular = async (req, res) => {
  try {
    const circular = await CircularActividadModel.create({
      ...req.body,
      creado_por: req.usuario.id
    });

    if (req.body.camposCustom && req.body.camposCustom.length > 0) {
      await CircularCampoModel.replaceBulk(circular.id, req.body.camposCustom);
    }

    res.status(201).json({ success: true, data: circular });
  } catch (error) {
    console.error('Error crearCircular:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editarCircular = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const circular = await CircularActividadModel.update(id, req.body);

    if (req.body.camposCustom) {
      await CircularCampoModel.replaceBulk(id, req.body.camposCustom);
    }

    res.json({ success: true, data: circular });
  } catch (error) {
    console.error('Error editarCircular:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listarCirculares = async (req, res) => {
  try {
    const circulares = await CircularActividadModel.findAll(req.query);
    res.json({ success: true, data: circulares });
  } catch (error) {
    console.error('Error listarCirculares:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// ADMIN: DASHBOARD
// =============================================

exports.getDashboardEstado = async (req, res) => {
  try {
    const actividadId = parseInt(req.params.actividadId);
    const circular = await CircularActividadModel.findByActividadId(actividadId);

    if (!circular) {
      return res.json({ success: true, data: { inscritos: [], stats: { total: 0, firmadas: 0, pendientes: 0, error: 0 } } });
    }

    // Todos los inscritos con estado de circular
    const inscritos = await query(`
      SELECT
        e.id as educando_id, e.nombre as educando_nombre, e.apellidos as educando_apellidos,
        s.nombre as seccion,
        u.nombre as familiar_nombre, u.email as familiar_email,
        COALESCE(cr.estado, 'pendiente') as estado_circular,
        cr.fecha_firma, cr.pdf_drive_id,
        cr.pdf_local_path
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN secciones s ON e.seccion_id = s.id
      JOIN usuarios u ON ic.familiar_id = u.id
      LEFT JOIN circular_respuesta cr ON cr.circular_actividad_id = $1
        AND cr.educando_id = e.id AND cr.estado NOT IN ('superseded','anulada')
      WHERE ic.actividad_id = $2 AND ic.estado IN ('pendiente','inscrito')
      ORDER BY s.orden, e.apellidos, e.nombre
    `, [circular.id, actividadId]);

    const stats = await CircularRespuestaModel.getEstadisticas(circular.id);

    res.json({ success: true, data: { circular, inscritos, stats } });
  } catch (error) {
    console.error('Error getDashboardEstado:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// ADMIN: PLANTILLAS
// =============================================

exports.listarPlantillas = async (req, res) => {
  try {
    const plantillas = await query('SELECT id, nombre, descripcion, tipo, campos_estandar, activa FROM plantillas_circular WHERE activa = true ORDER BY nombre');
    res.json({ success: true, data: plantillas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// FAMILIAR: Lista circulares pendientes
// =============================================

exports.getCircularesFamiliar = async (req, res) => {
  try {
    const familiarId = req.usuario.id;

    const circulares = await query(`
      SELECT DISTINCT
        ca.id, ca.titulo, ca.texto_introductorio, ca.fecha_limite_firma, ca.estado as circular_estado,
        a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha, a.lugar as actividad_lugar,
        e.id as educando_id, e.nombre as educando_nombre, e.apellidos as educando_apellidos,
        s.nombre as seccion_nombre,
        cr.estado as respuesta_estado, cr.fecha_firma
      FROM circular_actividad ca
      JOIN actividades a ON ca.actividad_id = a.id
      JOIN inscripciones_campamento ic ON ic.actividad_id = a.id
      JOIN educandos e ON ic.educando_id = e.id
      JOIN secciones s ON e.seccion_id = s.id
      LEFT JOIN circular_respuesta cr ON cr.circular_actividad_id = ca.id
        AND cr.educando_id = e.id AND cr.estado NOT IN ('superseded','anulada')
      WHERE ic.familiar_id = $1
        AND ca.estado = 'publicada'
        AND ic.estado IN ('pendiente','inscrito')
      ORDER BY ca.fecha_limite_firma ASC NULLS LAST, a.fecha_inicio ASC
    `, [familiarId]);

    res.json({ success: true, data: circulares });
  } catch (error) {
    console.error('Error getCircularesFamiliar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
