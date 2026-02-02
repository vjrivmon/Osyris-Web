const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../../templates/circular-template.pdf');

/**
 * Rellena un campo de texto del formulario PDF de forma segura.
 * Si el campo no existe, lo ignora silenciosamente.
 */
function setTextField(form, fieldName, value, fontSize) {
  try {
    const field = form.getTextField(fieldName);
    if (fontSize) {
      field.setFontSize(fontSize);
    }
    field.setText(value || '');
  } catch (err) {
    // Campo no encontrado en el template — ignorar
    console.warn(`Campo PDF no encontrado: ${fieldName}`);
  }
}

/**
 * Genera un PDF de circular firmada usando el template PDF del grupo scout.
 * Rellena los 32 campos editables del template con los datos proporcionados.
 */
async function generarPDF({ respuesta, circular, educando, familiar, configRonda }) {
  // Intentar usar template; si no existe, usar fallback
  let pdfDoc;
  let useTemplate = false;

  if (fs.existsSync(TEMPLATE_PATH)) {
    try {
      const templateBytes = fs.readFileSync(TEMPLATE_PATH);
      pdfDoc = await PDFDocument.load(templateBytes);
      useTemplate = true;
    } catch (err) {
      console.error('Error cargando template PDF, usando fallback:', err.message);
      pdfDoc = null;
    }
  }

  if (!useTemplate || !pdfDoc) {
    return generarPDFFallback({ respuesta, circular, educando, familiar });
  }

  const form = pdfDoc.getForm();

  // ==========================================
  // CAMPOS CIRCULAR (admin rellena al crear)
  // ==========================================
  setTextField(form, 'numero_dia', circular.numero_dia);
  setTextField(form, 'nombre_actividad', circular.titulo || circular.actividad_titulo || '');
  setTextField(form, 'destinatarios', circular.destinatarios || 'Familias del Grupo Scout Osyris');
  setTextField(form, 'fecha_actividad', circular.fecha_actividad);
  setTextField(form, 'lugar', circular.lugar || circular.actividad_lugar || '');
  setTextField(form, 'hora_y_lugar_salida', circular.hora_y_lugar_salida);
  setTextField(form, 'hora_y_lugar_llegada', circular.hora_y_lugar_llegada);
  setTextField(form, 'que_llevar', circular.que_llevar);
  setTextField(form, 'precio_info_pago', circular.precio_info_pago);
  setTextField(form, 'info_familias', circular.info_familias);

  // ==========================================
  // CAMPOS CONFIG RONDA (contactos por sección)
  // ==========================================
  if (configRonda) {
    const RESP_FONT = 8;
    setTextField(form, 'responsable_castores', configRonda.responsable_castores, RESP_FONT);
    setTextField(form, 'numero_responsable_castores', configRonda.numero_responsable_castores, RESP_FONT);
    setTextField(form, 'responsable_manada', configRonda.responsable_manada, RESP_FONT);
    setTextField(form, 'numero_responsable_manada', configRonda.numero_responsable_manada, RESP_FONT);
    setTextField(form, 'responsable_tropa', configRonda.responsable_tropa, RESP_FONT);
    setTextField(form, 'numero_responsable_tropa', configRonda.numero_responsable_tropa, RESP_FONT);
    setTextField(form, 'responsable_pioneros', configRonda.responsable_pioneros, RESP_FONT);
    setTextField(form, 'numero_responsable_pioneros', configRonda.numero_responsable_pioneros, RESP_FONT);
    setTextField(form, 'responsable_rutas', configRonda.responsable_rutas, RESP_FONT);
    setTextField(form, 'numero_responsable_rutas', configRonda.numero_responsable_rutas, RESP_FONT);
  }

  // ==========================================
  // CAMPOS AUTORIZACIÓN (auto-rellenados)
  // ==========================================
  const nombreTutor = familiar ? `${familiar.nombre || ''} ${familiar.apellidos || ''}`.trim() : '';
  const dniTutor = familiar?.dni || '';
  const nombreEducando = educando ? `${educando.nombre || ''} ${educando.apellidos || ''}`.trim() : '';
  const seccion = educando?.seccion_nombre || '';

  // Tamaño reducido (8pt) para que quepa en las cajas de la autorización
  const AUTH_FONT = 8;
  setTextField(form, 'nombre_tutor', nombreTutor, AUTH_FONT);
  setTextField(form, 'dni_tutor', dniTutor, AUTH_FONT);
  setTextField(form, 'nombre_educando', nombreEducando, AUTH_FONT);
  setTextField(form, 'seccion', seccion, AUTH_FONT);

  // nombre_activididad (typo intencional — así está en el PDF template)
  setTextField(form, 'nombre_activididad', circular.titulo || circular.actividad_titulo || '', AUTH_FONT);

  // fecha_abreviada_actividad
  setTextField(form, 'fecha_abreviada_actividad', circular.fecha_actividad || '', AUTH_FONT);

  // Campos de año (cabecera y firma)
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  // Campo "año" — puede ser simple o con sufijo #0/#1 según versión del template
  setTextField(form, 'año', currentYear);
  try { form.getTextField('año#0')?.setText(currentYear); } catch { /* no existe en este template */ }
  try { form.getTextField('año#1')?.setText(currentYear); } catch { /* no existe en este template */ }

  // Fecha de firma
  const fechaFirma = respuesta.fecha_firma ? new Date(respuesta.fecha_firma) : now;
  setTextField(form, 'dia_fecha_firma', fechaFirma.getDate().toString());

  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  setTextField(form, 'mes_fecha_firma', meses[fechaFirma.getMonth()]);

  // Teléfono de contacto del familiar
  setTextField(form, 'telefono_contacto', familiar?.telefono || '', AUTH_FONT);

  // Medicamentos (de los datos médicos del snapshot)
  const dm = respuesta.datos_medicos_snapshot || {};
  const medicamentos = [dm.medicacion, dm.alergias].filter(Boolean).join('. ') || 'Ninguno';
  setTextField(form, 'medicamentos', medicamentos, 6);

  // ==========================================
  // FIRMA (PDFButton con imagen)
  // ==========================================
  if (respuesta.firma_base64 && respuesta.firma_tipo === 'image') {
    try {
      const firmaData = respuesta.firma_base64.replace(/^data:image\/png;base64,/, '');
      const firmaBytes = Buffer.from(firmaData, 'base64');
      const firmaImage = await pdfDoc.embedPng(firmaBytes);
      const firmaField = form.getButton('firma');
      firmaField.setImage(firmaImage);
    } catch (err) {
      console.warn('Error insertando firma en PDF:', err.message);
    }
  }

  // Aplanar el formulario para que no sea editable
  form.flatten();

  // Metadata
  pdfDoc.setTitle(`Circular - ${circular.titulo || 'Actividad'} - ${nombreEducando}`);
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setProducer('Osyris-Web Circular Digital v2');

  const pdfBytes = await pdfDoc.save();
  const hash = crypto.createHash('sha256').update(pdfBytes).digest('hex');

  return { pdfBytes: Buffer.from(pdfBytes), hash };
}

/**
 * Fallback: genera un PDF básico desde cero si no hay template disponible.
 * Mantiene compatibilidad con el sistema anterior.
 */
async function generarPDFFallback({ respuesta, circular, educando, familiar }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  const drawText = (text, options = {}) => {
    const size = options.size || 11;
    const f = options.bold ? boldFont : font;
    const color = options.color || rgb(0, 0, 0);
    page.drawText(text || '', { x: options.x || margin, y, size, font: f, color });
    y -= (size + 6);
  };

  const drawLine = () => {
    page.drawLine({
      start: { x: margin, y: y + 5 },
      end: { x: width - margin, y: y + 5 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7)
    });
    y -= 10;
  };

  // Header
  drawText('GRUPO SCOUT OSYRIS', { size: 16, bold: true });
  drawText('Circular Digital - Autorización de Participación', { size: 13, bold: true });
  y -= 5;
  drawLine();

  // Actividad
  drawText(`Actividad: ${circular.titulo || circular.actividad_titulo || 'N/A'}`, { bold: true, size: 12 });
  if (circular.fecha_actividad) {
    drawText(`Fecha: ${circular.fecha_actividad}`);
  } else if (circular.actividad_fecha_inicio) {
    const fecha = new Date(circular.actividad_fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    drawText(`Fecha: ${fecha}`);
  }
  if (circular.lugar || circular.actividad_lugar) {
    drawText(`Lugar: ${circular.lugar || circular.actividad_lugar}`);
  }
  y -= 5;
  drawLine();

  // Educando
  drawText('DATOS DEL EDUCANDO', { bold: true, size: 12 });
  drawText(`Nombre: ${educando.nombre} ${educando.apellidos}`);
  drawText(`Sección: ${educando.seccion_nombre || 'N/A'}`);
  if (educando.fecha_nacimiento) {
    drawText(`Fecha de nacimiento: ${new Date(educando.fecha_nacimiento).toLocaleDateString('es-ES')}`);
  }
  y -= 5;
  drawLine();

  // Datos médicos
  const dm = respuesta.datos_medicos_snapshot;
  drawText('DATOS MÉDICOS', { bold: true, size: 12 });
  drawText(`Alergias: ${dm.alergias || 'Ninguna'}`);
  drawText(`Intolerancias: ${dm.intolerancias || 'Ninguna'}`);
  drawText(`Dieta especial: ${dm.dieta_especial || 'Ninguna'}`);
  drawText(`Medicación: ${dm.medicacion || 'Ninguna'}`);
  if (dm.enfermedades_cronicas) drawText(`Enf. crónicas: ${dm.enfermedades_cronicas}`);
  if (dm.grupo_sanguineo) drawText(`Grupo sanguíneo: ${dm.grupo_sanguineo}`);
  if (dm.tarjeta_sanitaria) drawText(`Tarjeta sanitaria: ${dm.tarjeta_sanitaria}`);
  drawText(`Puede hacer deporte: ${dm.puede_hacer_deporte !== false ? 'Sí' : 'No'}`);
  if (dm.observaciones_medicas) drawText(`Observaciones: ${dm.observaciones_medicas}`);
  y -= 5;
  drawLine();

  // Contactos emergencia
  const contactos = respuesta.contactos_emergencia_snapshot || [];
  drawText('CONTACTOS DE EMERGENCIA', { bold: true, size: 12 });
  for (const c of contactos) {
    drawText(`${c.orden}. ${c.nombre_completo} - Tel: ${c.telefono} (${c.relacion})`);
  }
  y -= 5;
  drawLine();

  // Firma
  drawText('FIRMA DEL FAMILIAR/TUTOR', { bold: true, size: 12 });
  drawText(`Nombre: ${familiar.nombre} ${familiar.apellidos}`);
  drawText(`Fecha de firma: ${new Date(respuesta.fecha_firma || Date.now()).toLocaleString('es-ES')}`);

  if (respuesta.firma_base64 && respuesta.firma_tipo === 'image') {
    try {
      const firmaData = respuesta.firma_base64.replace(/^data:image\/png;base64,/, '');
      const firmaBytes = Buffer.from(firmaData, 'base64');
      const firmaImage = await pdfDoc.embedPng(firmaBytes);
      const firmaDims = firmaImage.scale(0.4);
      y -= 10;
      page.drawImage(firmaImage, {
        x: margin,
        y: y - firmaDims.height,
        width: Math.min(firmaDims.width, 200),
        height: Math.min(firmaDims.height, 80)
      });
      y -= (Math.min(firmaDims.height, 80) + 10);
    } catch (err) {
      drawText('[Firma digital incluida]');
    }
  }

  y -= 5;
  drawLine();
  drawText('METADATOS DE INTEGRIDAD', { size: 8, color: rgb(0.5, 0.5, 0.5) });
  drawText(`IP: ${respuesta.ip_firma || 'N/A'} | Versión: ${respuesta.version}`, { size: 8, color: rgb(0.5, 0.5, 0.5) });

  pdfDoc.setTitle(`Circular - ${circular.titulo || 'Actividad'} - ${educando.nombre} ${educando.apellidos}`);
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setProducer('Osyris-Web Circular Digital');

  const pdfBytes = await pdfDoc.save();
  const hash = crypto.createHash('sha256').update(pdfBytes).digest('hex');

  return { pdfBytes: Buffer.from(pdfBytes), hash };
}

/**
 * Guarda PDF en disco local (desarrollo) o sube a Drive (producción)
 */
async function guardarPDF(pdfBuffer, filename) {
  const uploadsDir = path.join(__dirname, '../../uploads/circulares');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, pdfBuffer);

  // En desarrollo, retornamos path local como si fuera Drive
  if (process.env.NODE_ENV !== 'production') {
    return {
      fileId: `local_${Date.now()}`,
      webViewLink: `/uploads/circulares/${filename}`,
      localPath: filePath
    };
  }

  // En producción, usar el servicio de Google Drive existente
  // TODO: Integrar con google-drive service existente
  return {
    fileId: `local_${Date.now()}`,
    webViewLink: `/uploads/circulares/${filename}`,
    localPath: filePath
  };
}

module.exports = { generarPDF, guardarPDF };
