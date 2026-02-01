# ADR-002: Firma Digital — signature_pad vs Alternativas

> Architecture Decision Record

**Fecha:** 2026-02-01  
**Estado:** Aceptada  
**Decisores:** Vicente (Tech Lead), VisiClaw (Arquitectura)  

---

## Contexto

La feature Circular Digital requiere que los padres/tutores firmen digitalmente las circulares de actividades. La firma debe:

1. Funcionar en **móvil** (dedo) y **tablet** (stylus).
2. Producir una **imagen de firma manuscrita** que se incrusta en el PDF.
3. Ser **ligera** (no añadir peso excesivo al bundle).
4. Integrarse con **React 19** sin fricción.
5. Ser **accesible** y ofrecer fallback para navegadores sin soporte Canvas.

---

## Decisión

**Usar `signature_pad`** (npm: `signature_pad`) como librería base para el canvas de firma, envuelto en un componente React propio (`FirmaDigitalCanvas`).

---

## Alternativas Consideradas

### Alternativa A: signature_pad ✅ (Elegida)

- **Librería:** [`signature_pad`](https://github.com/szimek/signature_pad)
- **Tamaño:** ~10KB minified + gzipped
- **Stars:** 10k+ GitHub stars
- **Última actualización:** Activa
- **Licencia:** MIT

**Pros:**
- Librería madura y probada (~10 años).
- Sin dependencias externas.
- API simple y limpia.
- Soporte nativo de touch, mouse y pointer events.
- Genera PNG/SVG/JPEG.
- Trazos suaves con interpolación de Bézier.
- Configurable (color, grosor, velocidad).
- Fácil de envolver en React con refs.

**Contras:**
- No tiene wrapper React oficial (se crea uno propio, ~50 líneas).
- No maneja resize automáticamente (se implementa con ResizeObserver).

### Alternativa B: react-signature-canvas

- **Librería:** [`react-signature-canvas`](https://github.com/agilgur5/react-signature-canvas)
- **Tamaño:** ~12KB (wrapper sobre signature_pad)

**Pros:**
- Wrapper React listo para usar.
- API React-friendly con refs.

**Contras:**
- Dependencia sobre `signature_pad` de todas formas.
- Actualizaciones menos frecuentes.
- Menos control sobre la integración.
- Añade una capa de abstracción innecesaria.

**Decisión:** Descartada. Preferimos envolver `signature_pad` directamente para tener control total y menos dependencias.

### Alternativa C: Canvas API puro (sin librería)

**Pros:**
- Sin dependencias externas.
- Control total.

**Contras:**
- Reimplementar interpolación de trazos, gestión de eventos touch/mouse/pointer, presión del stylus, etc.
- Trazos toscos sin interpolación Bézier.
- Mucho más código a mantener.
- Reinventar la rueda para un problema ya resuelto.

**Decisión:** Descartada. No justificado dado que signature_pad es liviano y maduro.

### Alternativa D: Checkbox "Acepto" + nombre completo (sin firma manuscrita)

**Pros:**
- Implementación trivial.
- Sin dependencia de Canvas.
- Funciona en cualquier navegador.

**Contras:**
- No produce firma visual para el PDF.
- Menor percepción de compromiso/seriedad por parte de los padres.
- Puede no cumplir expectativas del grupo scout (están acostumbrados a firma en papel).

**Decisión:** Se mantiene como **fallback** para navegadores sin soporte Canvas, no como opción principal.

### Alternativa E: Servicios de firma electrónica (DocuSign, HelloSign, VIDsigner)

**Pros:**
- Validez legal máxima.
- Flujo estándar de firma.

**Contras:**
- Coste por firma: €0.50-2.00 por firma.
- Estimación anual: ~100 familias × 2 educandos × 10 actividades = ~2000 firmas/año = €1000-4000/año.
- Complejidad de integración API.
- Dependencia de servicio externo.
- Excesivo para el caso de uso (circular scout, no contrato mercantil).

**Decisión:** Descartada por coste y complejidad desproporcionados.

---

## Comparativa

| Criterio | signature_pad | react-signature-canvas | Canvas puro | Checkbox | DocuSign |
|----------|:---:|:---:|:---:|:---:|:---:|
| Calidad de trazo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | N/A | ⭐⭐⭐⭐ |
| Tamaño bundle | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | N/A |
| Soporte móvil | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Control/flexibilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Esfuerzo integración | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Mantenimiento | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Coste | Gratis | Gratis | Gratis | Gratis | €1k-4k/año |
| Validez legal | Suficiente* | Suficiente* | Suficiente* | Mínima | Máxima |

\* Con metadatos de integridad (timestamp, IP, hash SHA-256).

---

## Implementación

### Wrapper React para signature_pad

```typescript
// Esquema del componente FirmaDigitalCanvas
import SignaturePad from 'signature_pad';

// 1. useRef para el canvas
// 2. useEffect para inicializar SignaturePad
// 3. ResizeObserver para redimensionar
// 4. Exportar clear/toDataURL via useImperativeHandle
// 5. Prevenir scroll en touch (touch-action: none en CSS)
```

### Metadatos de integridad de la firma

Para reforzar la validez legal de la firma, cada `CircularRespuesta` incluye:

| Metadato | Descripción | Almacenamiento |
|----------|-------------|----------------|
| `firma_base64` | Imagen PNG de la firma | `circular_respuesta.firma_base64` |
| `firma_tipo` | `"image"` o `"text"` (fallback) | `circular_respuesta.firma_tipo` |
| `fecha_firma` | Timestamp UTC de la firma | `circular_respuesta.fecha_firma` |
| `ip_firma` | IP del cliente | `circular_respuesta.ip_firma` |
| `user_agent_firma` | User-Agent del navegador | `circular_respuesta.user_agent_firma` |
| `pdf_hash_sha256` | Hash del PDF generado | `circular_respuesta.pdf_hash_sha256` |

### Fallback sin Canvas

```typescript
if (!isCanvasSupported()) {
  return (
    <div>
      <p>Tu navegador no soporta firma manuscrita.</p>
      <input type="text" placeholder="Nombre completo del firmante" />
      <label>
        <input type="checkbox" required />
        Confirmo que autorizo esta circular como tutor legal
      </label>
    </div>
  );
}
```

---

## Consecuencias

### Positivas
- Firma manuscrita real que se ve en el PDF (familiar para los padres).
- Librería madura, ligera, sin dependencias.
- Control total sobre la integración React.
- Fallback disponible para casos edge.

### Negativas
- Se debe crear wrapper React propio (~50-100 líneas).
- Se debe manejar resize manualmente con ResizeObserver.
- La firma manuscrita digitalizada no tiene el nivel de validez de una firma electrónica cualificada (aceptable para el caso de uso).

---

## Referencias

- [signature_pad — GitHub](https://github.com/szimek/signature_pad)
- [Reglamento eIDAS — Firma electrónica](https://www.boe.es/doue/2014/257/L00073-00114.pdf)
- [pdf-lib — Embed images](https://pdf-lib.js.org/#embed-png-and-jpeg-images)
