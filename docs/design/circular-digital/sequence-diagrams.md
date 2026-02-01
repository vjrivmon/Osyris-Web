# Diagramas de Secuencia — Circular Digital

> Interacciones detalladas entre actores y componentes del sistema.

**Fecha:** 2026-02-01  
**Estado:** Draft  

---

## 1. Padre Confirma Circular

Flujo completo desde que el padre abre el formulario hasta que recibe confirmación.

```mermaid
sequenceDiagram
    actor Padre
    participant FE as Frontend (Next.js)
    participant API as API (Express)
    participant DB as PostgreSQL
    participant PDF as PDFGeneratorService
    participant Drive as Google Drive
    participant Email as EmailService

    Padre->>FE: Abre wizard de inscripción
    FE->>API: GET /api/circular/{actividadId}/formulario?educandoId={id}
    API->>DB: SELECT perfil_salud WHERE educando_id = ?
    DB-->>API: Datos perfil salud
    API->>DB: SELECT contactos_emergencia WHERE educando_id = ?
    DB-->>API: Contactos emergencia
    API->>DB: SELECT circular_actividad + campos_custom WHERE actividad_id = ?
    DB-->>API: Config circular + campos custom
    API-->>FE: { perfilSalud, contactos, circularConfig, camposCustom }
    FE-->>Padre: Formulario pre-rellenado

    Note over Padre,FE: Padre revisa datos, modifica si necesario

    Padre->>FE: Confirma datos + marca checkbox legal
    Padre->>FE: Firma en canvas táctil
    FE->>FE: Validar firma (min 50 puntos)

    Padre->>FE: Click "Enviar"
    FE->>API: POST /api/circular/{actividadId}/firmar
    Note right of FE: Body: { educandoId, datosMedicos,<br/>contactos, camposCustom,<br/>firmaBase64, aceptaCondiciones }

    API->>API: Validar datos obligatorios
    API->>API: Validar firma no vacía
    API->>API: Verificar que familiar es tutor del educando

    API->>DB: BEGIN TRANSACTION

    API->>DB: INSERT/UPDATE perfil_salud (si padre eligió actualizar)
    API->>DB: INSERT circular_respuesta (estado='firmada')
    API->>DB: UPDATE inscripciones_campamento SET circular_respuesta_id = ?
    API->>DB: INSERT auditoria_datos_medicos

    API->>PDF: generarPDF(datos, firma, plantilla)
    PDF->>DB: SELECT plantilla_pdf_base FROM plantillas_circular
    DB-->>PDF: Plantilla base (bytes)
    PDF->>PDF: Rellenar campos con pdf-lib
    PDF->>PDF: Insertar firma como imagen PNG
    PDF->>PDF: Añadir metadatos (timestamp, hash)
    PDF-->>API: PDF Buffer + SHA-256 hash

    API->>DB: UPDATE circular_respuesta SET pdf_hash_sha256 = ?

    API->>Drive: upload(pdfBuffer, path, fileName)
    Drive-->>API: { fileId, webViewLink }

    API->>DB: UPDATE circular_respuesta SET pdf_drive_id = ?, estado = 'archivada'
    API->>DB: UPDATE inscripciones_campamento SET circular_firmada_drive_id = ?

    API->>DB: COMMIT

    API->>Email: enviarConfirmacion(padre.email, webViewLink)
    Email-->>Padre: Email con enlace al PDF

    API-->>FE: 200 { success: true, pdfUrl: webViewLink }
    FE-->>Padre: Pantalla de confirmación ✅
```

---

## 2. Sistema Genera PDF Firmado (Detalle interno)

Secuencia detallada del servicio de generación de PDF.

```mermaid
sequenceDiagram
    participant API as API Controller
    participant Service as PDFGeneratorService
    participant PdfLib as pdf-lib
    participant FS as FileSystem
    participant Drive as GoogleDriveService
    participant DB as PostgreSQL

    API->>Service: generarYArchivar(circularRespuestaId)

    Service->>DB: SELECT cr.*, ca.*, pc.plantilla_pdf_base<br/>FROM circular_respuesta cr<br/>JOIN circular_actividad ca<br/>JOIN plantillas_circular pc
    DB-->>Service: { respuesta, circular, plantillaBytes }

    Service->>PdfLib: PDFDocument.load(plantillaBytes)
    PdfLib-->>Service: pdfDoc

    Note over Service,PdfLib: Rellenar campos de texto
    Service->>PdfLib: form.getTextField('nombre').setText(...)
    Service->>PdfLib: form.getTextField('alergias').setText(...)
    Service->>PdfLib: form.getTextField('medicacion').setText(...)
    Service->>PdfLib: form.getTextField('contacto_emergencia').setText(...)

    Note over Service,PdfLib: Insertar campos custom
    loop Para cada campo custom respondido
        Service->>PdfLib: Añadir texto/checkbox según tipo
    end

    Note over Service,PdfLib: Insertar firma
    Service->>PdfLib: pdfDoc.embedPng(firmaBase64)
    Service->>PdfLib: page.drawImage(firmaImage, {x, y, width, height})

    Note over Service,PdfLib: Metadatos de integridad
    Service->>PdfLib: pdfDoc.setTitle('Circular - {actividad} - {educando}')
    Service->>PdfLib: pdfDoc.setCreationDate(new Date())
    Service->>PdfLib: pdfDoc.setCustomMetadata('firmado_por', familiar.nombre)
    Service->>PdfLib: pdfDoc.setCustomMetadata('ip_firma', ip)
    Service->>PdfLib: pdfDoc.setCustomMetadata('timestamp', isoDate)

    Service->>PdfLib: pdfDoc.save()
    PdfLib-->>Service: pdfBytes (Uint8Array)

    Service->>Service: SHA-256(pdfBytes) → hash

    Note over Service,FS: Backup local temporal
    Service->>FS: writeFile('/tmp/circulares/{id}.pdf', pdfBytes)

    Note over Service,Drive: Subida a Google Drive
    Service->>Drive: upload({<br/>  name: 'Circular_{educando}_{actividad}.pdf',<br/>  parents: [folderIdActividad],<br/>  mimeType: 'application/pdf',<br/>  body: pdfBytes<br/>})

    alt Subida exitosa
        Drive-->>Service: { id: fileId, webViewLink }
        Service->>DB: UPDATE circular_respuesta<br/>SET pdf_drive_id = fileId,<br/>pdf_hash_sha256 = hash,<br/>estado = 'archivada'
        Service->>FS: unlink('/tmp/circulares/{id}.pdf')
        Service-->>API: { success: true, driveFileId, pdfUrl }
    else Fallo en subida
        Drive-->>Service: Error
        Service->>Service: Reintento con backoff (1s, 2s, 4s)
        alt Reintentos agotados
            Service->>DB: UPDATE circular_respuesta<br/>SET estado = 'error_drive',<br/>pdf_local_path = '/tmp/...'
            Service-->>API: { success: false, error: 'drive_upload_failed' }
        end
    end
```

---

## 3. Admin Consulta Estado de Circulares

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Frontend (Next.js)
    participant API as API (Express)
    participant DB as PostgreSQL
    participant Email as EmailService

    Admin->>FE: Accede a Dashboard de Circulares
    FE->>API: GET /api/admin/circular/{actividadId}/estado
    API->>API: Verificar rol admin/coordinador

    API->>DB: SELECT e.nombre, e.apellidos, s.nombre as seccion,<br/>cr.estado, cr.fecha_firma, cr.pdf_drive_id<br/>FROM inscripciones_campamento ic<br/>JOIN educandos e ON ic.educando_id = e.id<br/>JOIN secciones s ON e.seccion_id = s.id<br/>LEFT JOIN circular_respuesta cr<br/>ON ic.circular_respuesta_id = cr.id<br/>WHERE ic.actividad_id = ?

    DB-->>API: Lista de inscripciones con estado circular

    API->>DB: SELECT COUNT(*) FILTER (WHERE estado = 'archivada') as firmadas,<br/>COUNT(*) FILTER (WHERE estado IS NULL OR estado = 'pendiente') as pendientes,<br/>COUNT(*) as total

    DB-->>API: Estadísticas resumen

    API-->>FE: { inscritos: [...], stats: { firmadas, pendientes, total } }
    FE-->>Admin: Dashboard con tabla y estadísticas

    Note over Admin,FE: Admin filtra por "pendientes"
    Admin->>FE: Filtrar por estado = pendiente
    FE->>FE: Filtrado client-side

    Note over Admin,Email: Enviar recordatorio masivo
    Admin->>FE: Click "Enviar recordatorio a pendientes"
    FE->>API: POST /api/admin/circular/{actividadId}/recordatorio
    API->>DB: SELECT f.email, e.nombre<br/>FROM inscripciones_campamento ic<br/>JOIN familiares f ON ic.familiar_id = f.id<br/>JOIN educandos e ON ic.educando_id = e.id<br/>LEFT JOIN circular_respuesta cr ON ic.circular_respuesta_id = cr.id<br/>WHERE ic.actividad_id = ?<br/>AND (cr.estado IS NULL OR cr.estado = 'pendiente')
    DB-->>API: Lista emails pendientes

    loop Para cada familia pendiente
        API->>Email: enviarRecordatorio(email, educando, actividad, fechaLimite)
    end

    API-->>FE: { enviados: N }
    FE-->>Admin: "Se han enviado N recordatorios"
```

---

## 4. Admin Descarga Masiva de PDFs

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Frontend
    participant API as API Backend
    participant Drive as Google Drive
    participant ZIP as Archiver (zip)

    Admin->>FE: Click "Descargar todos los PDFs"
    FE->>API: POST /api/admin/circular/{actividadId}/descargar-masivo

    API->>API: Verificar permisos

    alt Menos de 20 PDFs
        API->>API: Generación síncrona
        API->>Drive: Descargar cada PDF por fileId
        Drive-->>API: PDF buffers

        API->>ZIP: Crear ZIP con todos los PDFs
        ZIP-->>API: zipBuffer

        API-->>FE: 200 (application/zip) zipBuffer
        FE-->>Admin: Descarga automática del ZIP
    else Más de 20 PDFs
        API-->>FE: 202 { jobId, message: "Generando ZIP..." }
        FE-->>Admin: "Recibirás el enlace por email"

        Note over API,ZIP: Procesamiento asíncrono
        API->>Drive: Descargar PDFs en lotes de 10
        Drive-->>API: PDF buffers
        API->>ZIP: Crear ZIP
        ZIP-->>API: zipBuffer
        API->>Drive: Subir ZIP a Drive
        Drive-->>API: { fileId, webViewLink }
        API->>Admin: Email con enlace de descarga
    end
```

---

## 5. Padre Actualiza Perfil de Salud

```mermaid
sequenceDiagram
    actor Padre
    participant FE as Frontend
    participant API as API Backend
    participant DB as PostgreSQL

    Padre->>FE: Accede a "Mi perfil" > Educandos
    FE->>API: GET /api/perfil-salud/educando/{educandoId}
    API->>API: Verificar que padre es familiar del educando
    API->>DB: SELECT * FROM perfil_salud WHERE educando_id = ?
    API->>DB: SELECT * FROM contactos_emergencia WHERE educando_id = ? ORDER BY orden

    DB-->>API: { perfilSalud, contactos }
    API-->>FE: Datos del perfil
    FE-->>Padre: Formulario con datos actuales

    Padre->>FE: Modifica campos (ej: nueva alergia)
    Padre->>FE: Click "Guardar"

    FE->>API: PUT /api/perfil-salud/educando/{educandoId}
    Note right of FE: Body: { alergias, intolerancias,<br/>medicacion, ..., contactos: [...] }

    API->>API: Validar datos
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE perfil_salud SET ... WHERE educando_id = ?
    API->>DB: DELETE contactos_emergencia WHERE educando_id = ?
    API->>DB: INSERT contactos_emergencia (batch)
    API->>DB: INSERT auditoria_datos_medicos (accion='update')
    API->>DB: COMMIT

    DB-->>API: OK
    API-->>FE: 200 { success: true, ultimaActualizacion: now() }
    FE-->>Padre: "Perfil actualizado correctamente ✅"
```
