# ADR-001: Circular Digital vs PDF Manual

> Architecture Decision Record

**Fecha:** 2026-02-01  
**Estado:** Aceptada  
**Decisores:** Vicente (Tech Lead), VisiClaw (Arquitectura)  

---

## Contexto

Osyris-Web gestiona la inscripción de educandos (~100 familias) en actividades del grupo scout. Cada actividad requiere una "circular": documento que recoge datos médicos, contactos de emergencia, autorizaciones parentales y firma del tutor legal.

### Flujo actual
1. El admin genera un PDF de circular en blanco por actividad.
2. El padre descarga el PDF desde el wizard de inscripción.
3. El padre imprime, rellena a mano, firma, escanea/fotografía y sube.
4. El sistema almacena el archivo en Google Drive.

### Problemas identificados
- **Repetición de datos:** Los mismos datos (alergias, medicación, contacto emergencia) se rellenan en cada actividad (~8-12 por año).
- **Barrera de acceso:** Requiere impresora y escáner/cámara. Muchas familias usan solo móvil.
- **Calidad variable:** Documentos escaneados ilegibles, fotos torcidas, datos incompletos.
- **Carga administrativa:** Perseguir firmas pendientes, verificar documentos manualmente.
- **Datos no estructurados:** La información está en PDFs escaneados, no consultable programáticamente.

---

## Decisión

**Implementar un sistema de circular digital** que reemplace el flujo PDF manual con:

1. **Perfil de salud persistente** por educando (base de datos).
2. **Formulario digital pre-rellenado** que el padre confirma o modifica.
3. **Firma digital** manuscrita en canvas táctil.
4. **Generación automática de PDF** en el backend para archivo.
5. **Subida automática a Google Drive** sin intervención manual.

---

## Alternativas Consideradas

### Alternativa A: Mantener PDF con mejoras menores
- Pre-rellenar el PDF antes de descarga con datos conocidos.
- **Pro:** Mínimo esfuerzo de desarrollo.
- **Contra:** Sigue requiriendo imprimir/escanear. No resuelve el problema de fondo.

### Alternativa B: Google Forms / Typeform externo
- Crear formularios externos para cada actividad.
- **Pro:** Sin desarrollo. Herramientas maduras.
- **Contra:** No integrado con Osyris-Web. Sin pre-llenado de datos. Sin firma manuscrita. Duplicación de datos. Gestión manual de respuestas.

### Alternativa C: Circular Digital integrada ✅ (Elegida)
- Formulario nativo en Osyris-Web con datos persistentes, firma y generación PDF.
- **Pro:** UX óptima. Datos integrados. Pre-llenado real. Firma digital. Trazabilidad completa.
- **Contra:** Mayor esfuerzo de desarrollo (~3 sprints).

### Alternativa D: Firma electrónica cualificada (eIDAS)
- Integrar con proveedor externo (DocuSign, VIDsigner, Cl@ve).
- **Pro:** Máxima validez legal.
- **Contra:** Coste por firma (€0.50-2.00/firma × ~100 familias × ~10 actividades = €500-2000/año). Complejidad excesiva para el caso de uso. Las circulares scouts no requieren firma cualificada.

---

## Justificación

| Criterio | PDF Manual | Google Forms | **Circular Digital** | Firma Cualificada |
|----------|-----------|-------------|---------------------|-------------------|
| UX para padres | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Pre-llenado de datos | ❌ | ❌ | ✅ | ✅ |
| Firma manuscrita | ✅ (papel) | ❌ | ✅ (digital) | ✅ (cualificada) |
| Integración con Osyris | ✅ | ❌ | ✅ | Parcial |
| Coste operativo | Bajo | Bajo | Bajo | Alto |
| Esfuerzo desarrollo | Nulo | Nulo | Medio | Alto |
| Datos estructurados | ❌ | Parcial | ✅ | ✅ |
| Trazabilidad | Baja | Media | Alta | Alta |
| Validez legal* | ✅ | ⚠️ | ✅ | ✅✅ |

\* Para circulares de actividades scouts, la firma manuscrita digitalizada con timestamp, IP y hash SHA-256 es suficiente. No se requiere firma cualificada eIDAS.

---

## Consecuencias

### Positivas
- Reducción drástica del tiempo de cumplimentación (15min → 2min).
- Eliminación de la barrera impresora/escáner.
- Datos médicos siempre actualizados y consultables.
- Trazabilidad completa (quién firmó, cuándo, desde dónde).
- Base para futuras features (historial médico, alertas automáticas).

### Negativas
- Esfuerzo de desarrollo de ~3 sprints.
- Necesidad de migrar datos históricos.
- Periodo de transición con dos flujos coexistiendo.
- Dependencia de nuevas librerías (`signature_pad`, `pdf-lib`).

### Riesgos Aceptados
- La firma manuscrita digitalizada no tiene la misma validez que una firma electrónica cualificada. Es aceptable para el contexto de actividades scouts.
- Algunas familias pueden preferir el flujo papel. Se mantiene como fallback.

---

## Notas

- Se mantiene el flujo PDF manual como fallback durante al menos un trimestre.
- Se consultará con el asesor legal del grupo sobre la validez de la firma digital para el contexto específico.
- La generación de PDF firmado garantiza que siempre existe un documento archivable.
