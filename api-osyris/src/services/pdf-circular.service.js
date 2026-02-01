const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Genera un PDF de circular firmada con los datos proporcionados
 */
async function generarPDF({ respuesta, circular, educando, familiar }) {
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
  if (circular.actividad_fecha_inicio) {
    const fecha = new Date(circular.actividad_fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    drawText(`Fecha: ${fecha}`);
  }
  if (circular.actividad_lugar) {
    drawText(`Lugar: ${circular.actividad_lugar}`);
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

  // Campos custom
  const camposCustom = respuesta.campos_custom_respuestas || {};
  if (Object.keys(camposCustom).length > 0) {
    drawText('AUTORIZACIONES ESPECÍFICAS', { bold: true, size: 12 });
    for (const [key, value] of Object.entries(camposCustom)) {
      const displayVal = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value);
      drawText(`${key}: ${displayVal}`);
    }
    y -= 5;
    drawLine();
  }

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
  } else {
    drawText(`[Firma texto: ${respuesta.firma_base64 || 'N/A'}]`);
  }

  y -= 5;
  drawLine();

  // Metadatos
  drawText('METADATOS DE INTEGRIDAD', { size: 8, color: rgb(0.5, 0.5, 0.5) });
  drawText(`IP: ${respuesta.ip_firma || 'N/A'} | Versión: ${respuesta.version}`, { size: 8, color: rgb(0.5, 0.5, 0.5) });

  // PDF metadata
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
