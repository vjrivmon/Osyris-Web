# Storyboard: Videos Tutoriales para Fotografiar Documentos

Este documento contiene los storyboards para los mini-videos tutoriales que se mostrarán
a las familias cuando suban documentos que requieren fotografía (DNI, SIP, Cartilla de Vacunación).

---

## Especificaciones Técnicas

| Parámetro | Valor |
|-----------|-------|
| Resolución | 720p (1280x720) |
| Formato | MP4 (H.264) |
| Audio | Sin audio (muted autoplay) |
| Duración | 10-15 segundos |
| Loop | Infinito |
| Tamaño máximo | 2MB por video |
| Ubicación | `public/videos/tutoriales/` |

---

## Video 1: DNI Padre/Madre

**Archivo:** `tutorial-dni.mp4`
**Duración:** 12-15 segundos

### Escenas

| Segundo | Visual | Texto en pantalla | Animación |
|---------|--------|-------------------|-----------|
| 0-2 | Logo Osyris sobre fondo blanco | "Cómo fotografiar tu DNI" | Fade in |
| 2-4 | Mano colocando DNI sobre mesa blanca/clara | "1. Superficie plana y clara" | Slide desde izquierda |
| 4-6 | Lámpara encendiéndose, iluminando el DNI uniformemente, sin sombras | "2. Buena iluminación" | Icono de bombilla aparece |
| 6-8 | Perspectiva desde arriba: móvil capturando DNI completo en pantalla | "3. Captura completo" | Marco verde alrededor del DNI |
| 8-10 | Split screen: Foto borrosa (X rojo) vs Foto nítida (check verde) | "4. Sin reflejos ni borrosidad" | Comparación animada |
| 10-12 | Split screen: Dedos tapando esquina (X rojo) vs Documento limpio (check verde) | "5. Sin dedos cubriendo" | Comparación animada |
| 12-15 | Foto final perfecta del DNI con check verde grande | "¡Listo para subir!" | Celebración con confeti sutil |

### Notas de Producción
- Usar DNI de ejemplo (no real) o imagen pixelada/censurada
- Colores corporativos Osyris: azul (#1e40af), naranja (#ea580c)
- Tipografía: Sans-serif, bold para títulos
- Transiciones suaves (0.3s)

---

## Video 2: SIP - Tarjeta Sanitaria

**Archivo:** `tutorial-sip.mp4`
**Duración:** 12-15 segundos

### Escenas

| Segundo | Visual | Texto en pantalla | Animación |
|---------|--------|-------------------|-----------|
| 0-2 | Logo Osyris sobre fondo blanco | "Cómo fotografiar tu SIP" | Fade in |
| 2-4 | Tarjeta SIP sobre fondo oscuro (contraste) | "1. Fondo con contraste" | Slide desde izquierda |
| 4-6 | Zoom animado hacia el número de afiliación, destacándolo | "2. Número legible" | Círculo amarillo parpadeante |
| 6-8 | Tarjeta en posición horizontal completa | "3. Orientación horizontal" | Flecha de rotación |
| 8-10 | Split screen: Reflejo brillante en tarjeta plastificada (X) vs Sin reflejo (check) | "4. Evita reflejos" | Comparación animada |
| 10-12 | Foto nítida mostrando todos los datos visibles | "5. Todos los datos visibles" | Highlight de cada campo |
| 12-15 | Foto final perfecta con check verde | "¡Listo para subir!" | Celebración con confeti sutil |

### Notas de Producción
- Usar tarjeta SIP de ejemplo de la Comunitat Valenciana
- Censurar/pixelar datos personales reales
- Mostrar el contraste entre fondo claro y oscuro
- Destacar la importancia del número de afiliación

---

## Video 3: Cartilla de Vacunación

**Archivo:** `tutorial-cartilla.mp4`
**Duración:** 12-15 segundos

### Escenas

| Segundo | Visual | Texto en pantalla | Animación |
|---------|--------|-------------------|-----------|
| 0-2 | Logo Osyris sobre fondo blanco | "Cómo fotografiar la Cartilla" | Fade in |
| 2-4 | Manos abriendo la cartilla sobre una mesa | "1. Ábrela completamente" | Animación de apertura |
| 4-6 | Página con vacunas recientes visible, señalada con flecha | "2. Página con vacunas actuales" | Flecha indicadora |
| 6-8 | Móvil capturando ambas páginas abiertas desde arriba | "3. Captura páginas completas" | Marco verde ajustándose |
| 8-10 | Zoom a texto de vacunas, mostrando que es legible | "4. Texto legible" | Lupa animada |
| 10-12 | Indicador de "si tiene varias páginas" con múltiples fotos | "5. Una foto por página" | Iconos de múltiples fotos |
| 12-15 | Foto final perfecta con check verde | "¡Listo para subir!" | Celebración con confeti sutil |

### Notas de Producción
- Usar cartilla de ejemplo o imagen stock
- Mostrar tanto la página de datos como la de vacunas
- Indicar claramente que pueden necesitarse múltiples fotos
- Enfatizar la legibilidad del texto

---

## Guía de Estilo Visual

### Colores
- **Principal:** #1e40af (Azul Osyris)
- **Secundario:** #ea580c (Naranja Scout)
- **Éxito:** #16a34a (Verde)
- **Error:** #dc2626 (Rojo)
- **Fondo:** #ffffff (Blanco)
- **Texto:** #1f2937 (Gris oscuro)

### Iconografía
- Check verde: Para indicar correcto
- X roja: Para indicar incorrecto
- Bombilla: Iluminación
- Cámara: Captura
- Móvil: Dispositivo

### Tipografía
- Títulos: Inter Bold, 24-32px
- Texto: Inter Regular, 16-20px
- Sombra en texto para legibilidad

### Animaciones
- Fade in/out: 0.3s ease
- Slide: 0.4s ease-out
- Bounce (check final): 0.5s

---

## Implementación en Código

Los videos se integrarán en el modal de resubida (`documento-resubir-modal.tsx`)
según el tipo de documento:

```tsx
// Componente placeholder hasta que se produzcan los videos
const TutorialVideo = ({ tipo }: { tipo: 'dni' | 'sip' | 'cartilla' }) => {
  const videoSrc = `/videos/tutoriales/tutorial-${tipo}.mp4`;

  return (
    <video
      src={videoSrc}
      autoPlay
      muted
      loop
      playsInline
      className="w-full rounded-lg"
    >
      {/* Fallback a instrucciones de texto */}
      <TutorialFotoPlaceholder tipo={tipo} />
    </video>
  );
};
```

---

## Cronograma de Producción

1. **Semana 1:** Pre-producción
   - Conseguir props (DNI ejemplo, SIP ejemplo, cartilla)
   - Preparar setup de grabación
   - Revisar storyboard final

2. **Semana 2:** Grabación
   - Grabar escenas de cada video
   - Revisar calidad de tomas

3. **Semana 3:** Post-producción
   - Edición de videos
   - Añadir textos y animaciones
   - Optimización para web (< 2MB)

4. **Semana 4:** Integración
   - Subir a `public/videos/tutoriales/`
   - Actualizar componente para usar videos reales
   - Testing en diferentes dispositivos

---

## Alternativa: Instrucciones de Texto

Mientras no existan los videos, el modal mostrará instrucciones de texto:

```
Consejos para la foto:
• Coloca el documento sobre una superficie plana y clara
• Asegúrate de tener buena iluminación, sin reflejos
• Captura el documento completo, sin cortar los bordes
• No cubras ningún dato con los dedos
• La imagen debe ser nítida y legible
```

Esta alternativa ya está implementada en `documento-resubir-modal.tsx`.
