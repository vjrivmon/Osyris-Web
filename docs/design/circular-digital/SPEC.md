# SPEC — Circular Digital

> Feature: Reemplazar el flujo de circulares en PDF por un formulario digital con datos pre-rellenados, firma táctil y generación automática de PDF para archivo.

**Versión:** 1.0  
**Fecha:** 2026-02-01  
**Autor:** VisiClaw (Diseño técnico) / Vicente (Product Owner)  
**Estado:** Draft  

---

## 1. Resumen Ejecutivo

Actualmente, las familias del grupo scout (~100 familias) deben descargar un PDF circular para cada salida o campamento, imprimirlo, rellenar a mano datos repetitivos (alergias, contacto de emergencia, dieta, medicación…), firmarlo, escanearlo y subirlo. Este proceso se repite idénticamente para cada actividad.

**Circular Digital** elimina este flujo manual reemplazándolo por:
- Un **perfil de salud persistente** por educando que almacena datos médicos y de emergencia.
- Un **formulario digital pre-rellenado** donde el padre/tutor solo confirma o actualiza datos.
- Una **firma digital** con canvas táctil (compatible con móvil y tablet).
- **Generación automática del PDF** firmado para archivo legal.
- **Subida automática a Google Drive** sin intervención manual.

---

## 2. Objetivos y Métricas

### Objetivos
| Objetivo | Descripción |
|----------|-------------|
| **O1** | Reducir el tiempo de cumplimentación de circular de ~15 min a <2 min |
| **O2** | Eliminar la necesidad de impresora/escáner para las familias |
| **O3** | Garantizar que el 100% de circulares firmadas estén en Drive antes de la actividad |
| **O4** | Mantener validez legal equivalente al documento firmado a mano |
| **O5** | Reutilizar datos médicos entre actividades sin re-introducirlos |

### Métricas de Éxito (KPIs)
| Métrica | Baseline | Target |
|---------|----------|--------|
| Tiempo medio de cumplimentación | ~15 min | <2 min |
| % circulares completadas 48h antes de actividad | ~40% | >90% |
| Incidencias por datos médicos incorrectos/desactualizados | Desconocido | Reducción >50% |
| Tasa de adopción digital vs PDF | 0% | >80% en primer trimestre |

---

## 3. Alcance

### En Alcance (v1.0)
- Perfil de salud persistente por educando (CRUD completo)
- Formulario digital de circular con pre-llenado desde perfil
- Firma digital con `signature_pad` (canvas táctil)
- Generación de PDF firmado con `pdf-lib` en backend
- Subida automática del PDF a Google Drive
- Dashboard de admin para ver estado de circulares por actividad
- Notificaciones por email cuando hay circular pendiente
- Compatibilidad móvil (responsive, touch-friendly)

### Fuera de Alcance (v1.0)
- Firma digital cualificada (eIDAS nivel avanzado/cualificado)
- Integración con sistemas de firma electrónica externos (DocuSign, etc.)
- Circulares para actividades que no sean campamentos/salidas
- App nativa móvil
- Firma múltiple (ambos tutores) — se contempla para v2
- Histórico de versiones de perfil de salud

### Fuera de Alcance (permanente)
- Almacenamiento de datos médicos con certificación sanitaria
- Integración con historia clínica electrónica

---

## 4. Personas y Roles

### Padre/Tutor (Usuario Principal)
- **Necesidad:** Cumplimentar circulares rápido, sin repetir datos, desde el móvil.
- **Dolor actual:** Imprimir, rellenar a mano, escanear, subir. Repetir datos idénticos cada vez.
- **Capacidad técnica:** Variable. Muchos usan solo móvil.

### Coordinador de Actividad (Admin)
- **Necesidad:** Tener todas las circulares firmadas antes de la actividad, consultar datos médicos rápido.
- **Dolor actual:** Perseguir a familias para que entreguen circulares, documentos ilegibles.

### Responsable de Grupo (Super Admin)
- **Necesidad:** Garantizar cumplimiento legal y trazabilidad documental.

---

## 5. Requisitos Funcionales

### RF-01: Perfil de Salud del Educando
- El padre puede crear/editar un perfil de salud para cada educando.
- Campos: alergias, intolerancias, dieta especial, medicación, observaciones médicas, grupo sanguíneo, tarjeta sanitaria, enfermedades crónicas.
- Los datos persisten entre actividades.
- Se muestra fecha de última actualización.
- El padre recibe un aviso si el perfil tiene >6 meses sin actualizar.

### RF-02: Contactos de Emergencia
- Mínimo 1, máximo 3 contactos de emergencia por educando.
- Campos: nombre completo, teléfono, relación con el educando.
- Se pre-rellenan desde `familiares_educandos` donde `es_contacto_principal = true`.

### RF-03: Formulario de Circular Digital
- Al inscribirse en una actividad, se presenta el formulario digital en lugar de descargar PDF.
- Datos pre-rellenados desde perfil de salud + contactos de emergencia.
- El padre revisa, modifica si necesario, y confirma.
- Campos específicos de la actividad (autorizaciones especiales, transporte, etc.) se configuran por el admin.
- Checkbox de conformidad con condiciones de la actividad.

### RF-04: Firma Digital
- Canvas táctil para firma manuscrita digitalizada.
- Compatible con dedo en móvil y stylus en tablet.
- Botón de borrar y reintentar.
- La firma se almacena como imagen PNG (base64 → blob).
- Se incrusta en el PDF generado.

### RF-05: Generación de PDF
- El backend genera un PDF con los datos confirmados + firma.
- El PDF sigue el formato/plantilla de la circular actual.
- Incluye: datos del educando, datos médicos, contactos emergencia, autorizaciones, firma, fecha/hora de firma, IP de firma.
- Metadatos del PDF: hash SHA-256 del contenido para integridad.

### RF-06: Subida a Google Drive
- El PDF se sube automáticamente a la carpeta correspondiente en Drive.
- Se actualiza `circular_firmada_drive_id` en `inscripciones_campamento`.
- Si falla la subida, se reintenta con backoff exponencial (max 3 intentos).
- El PDF queda también almacenado localmente como backup temporal.

### RF-07: Dashboard de Admin
- Vista por actividad: lista de educandos con estado de circular (pendiente/firmada/caducada).
- Filtros por sección, estado.
- Botón para enviar recordatorio por email a pendientes.
- Descarga masiva de PDFs firmados (ZIP).
- Acceso rápido a datos médicos de los inscritos (vista de emergencia).

### RF-08: Notificaciones
- Email automático al padre cuando se crea una actividad que requiere circular.
- Recordatorio 7 días y 2 días antes si no ha firmado.
- Confirmación por email tras firmar exitosamente (con enlace al PDF).

---

## 6. Requisitos No Funcionales

| ID | Categoría | Requisito |
|----|-----------|-----------|
| RNF-01 | Rendimiento | Generación de PDF <3 segundos |
| RNF-02 | Rendimiento | Carga del formulario pre-rellenado <1 segundo |
| RNF-03 | Disponibilidad | El formulario debe funcionar offline-first (PWA cache) para la firma |
| RNF-04 | Seguridad | Datos médicos cifrados en reposo (AES-256) |
| RNF-05 | Seguridad | Acceso a datos médicos solo por familiar autorizado o admin |
| RNF-06 | Seguridad | Log de auditoría para accesos a datos médicos |
| RNF-07 | Privacidad | Cumplimiento RGPD: consentimiento explícito, derecho de supresión |
| RNF-08 | Accesibilidad | WCAG 2.1 AA para el formulario |
| RNF-09 | Compatibilidad | Chrome, Safari, Firefox (últimas 2 versiones) + Safari iOS + Chrome Android |
| RNF-10 | UX | Formulario completable en <5 taps si datos no cambian |

---

## 7. Dependencias

| Dependencia | Tipo | Estado |
|-------------|------|--------|
| `signature_pad` (npm) | Librería frontend | Disponible, MIT license |
| `pdf-lib` (npm) | Librería backend | Disponible, MIT license |
| Google Drive API | Servicio externo | Ya integrado en Osyris-Web |
| Servicio de email | Servicio externo | Ya integrado (Nodemailer) |
| Wizard de inscripción actual | Código existente | Requiere refactor parcial |

---

## 8. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Familias sin smartphone/tablet | Baja | Medio | Mantener opción de PDF manual como fallback |
| Validez legal cuestionada | Media | Alto | Incluir timestamp, IP, hash en PDF. Consultar con asesor legal del grupo |
| Datos médicos desactualizados | Media | Alto | Forzar revisión antes de cada actividad con confirmación explícita |
| Fallo en subida a Drive | Baja | Medio | Cola de reintentos + almacenamiento local temporal |
| Canvas de firma no funciona en navegador antiguo | Baja | Bajo | Fallback a checkbox "Acepto" + nombre completo |

---

## 9. Plan de Migración

### Fase 1: Perfil de Salud (Sprint 1)
- Migración DB: crear tabla `perfil_salud`, `contactos_emergencia`
- API CRUD para perfil de salud
- UI de gestión de perfil de salud
- Migrar datos existentes desde `inscripciones_campamento` → `perfil_salud`

### Fase 2: Circular Digital (Sprint 2)
- Crear tablas `plantillas_circular`, `circulares_actividad`, `circular_respuesta`
- Formulario digital con pre-llenado
- Integración firma digital (signature_pad)
- Generación PDF (pdf-lib)
- Subida a Drive

### Fase 3: Admin Dashboard + Notificaciones (Sprint 3)
- Dashboard de estado de circulares
- Sistema de notificaciones por email
- Descarga masiva de PDFs
- Tests e2e

### Convivencia
- Durante la transición, ambos flujos (PDF manual y digital) coexisten.
- El admin puede marcar una actividad como "solo circular digital".
- Tras validación de un trimestre completo, se depreca el flujo PDF.

---

## 10. Glosario

| Término | Definición |
|---------|------------|
| **Circular** | Documento que autoriza la participación de un educando en una actividad, con datos médicos y firma del tutor |
| **Educando** | Menor inscrito en el grupo scout |
| **Familiar/Tutor** | Adulto responsable legal del educando |
| **Perfil de Salud** | Conjunto de datos médicos y de emergencia persistentes de un educando |
| **Actividad** | Campamento, salida, excursión u otra actividad del grupo scout |
| **Sección** | División por edad dentro del grupo scout (Castores, Lobatos, Scouts, Escultas, Rovers) |
