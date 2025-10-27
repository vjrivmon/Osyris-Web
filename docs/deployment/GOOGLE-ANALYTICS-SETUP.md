# 📊 Configuración de Google Analytics 4

## ✅ Estado de Implementación

**Google Analytics 4 está completamente implementado y configurado en el proyecto Osyris.**

---

## 🎯 ID de Medición

```
G-1D8ZN87TFQ
```

---

## 📋 Archivos Modificados/Creados

### 1. **Layout Principal** - [src/app/layout.tsx](../../src/app/layout.tsx:101-127)

Implementación optimizada usando el componente `<Script>` de Next.js:

```typescript
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

{GA_MEASUREMENT_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `}
    </Script>
  </>
)}
```

**Características:**
- ✅ Carga **optimizada** usando `strategy="afterInteractive"` (no bloquea el render inicial)
- ✅ Solo se carga si la variable de entorno existe (condicional)
- ✅ Compatible con todas las páginas del sitio automáticamente

---

### 2. **Variables de Entorno**

#### Desarrollo - `.env.local` (línea 38)
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1D8ZN87TFQ
```

#### Producción - `.env.production` (líneas 16-18)
```bash
# ===== GOOGLE ANALYTICS =====
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1D8ZN87TFQ
```

#### Template - `.env.example` (líneas 35-37)
```bash
# === GOOGLE ANALYTICS ===
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1D8ZN87TFQ
```

---

## 🚀 Cómo Verificar que Funciona

### 1. **Desarrollo Local**

```bash
# Iniciar servidor de desarrollo
./scripts/dev-start.sh

# Abrir navegador en http://localhost:3000
```

#### Verificar en el Navegador:

1. **Ver código fuente** (Ctrl+U o Ver > Código fuente):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-1D8ZN87TFQ"></script>
   ```

2. **Consola del navegador** (F12 > Console):
   - No deberías ver errores de Google Analytics
   - Verifica que `dataLayer` exista: escribe `window.dataLayer` en la consola

3. **Network tab** (F12 > Network):
   - Busca peticiones a `google-analytics.com`
   - Deberías ver requests a `gtag/js` y `collect`

---

### 2. **Producción**

Una vez desplegado a `https://gruposcoutosyris.es`:

1. **Google Analytics Dashboard**:
   - Ve a [Google Analytics](https://analytics.google.com/)
   - Selecciona tu propiedad `Grupo Scout Osyris`
   - Ve a **Informes > Tiempo real**
   - Abre tu web en una ventana de incógnito
   - Deberías ver tu visita en tiempo real

2. **Google Tag Assistant**:
   - Instala la extensión [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Visita tu web
   - Verifica que detecte el tag `GA4 - G-1D8ZN87TFQ`

---

## 📈 Eventos Rastreados Automáticamente

Google Analytics 4 rastrea automáticamente:

✅ **Visualizaciones de página** (page_view)
✅ **Sesiones** (session_start)
✅ **Primeras visitas** (first_visit)
✅ **Engagement** (user_engagement)
✅ **Scroll** (scroll)
✅ **Clics en enlaces salientes** (click)
✅ **Búsqueda en sitio** (view_search_results)
✅ **Descargas de archivos** (file_download)
✅ **Clics en videos** (video_start, video_progress, video_complete)

---

## 🎯 Eventos Personalizados (Futuras Mejoras)

Si necesitas rastrear eventos personalizados en el futuro:

```typescript
// Ejemplo: Rastrear clic en botón "Únete a Nosotros"
const handleJoinClick = () => {
  // Rastreo de evento
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'join_click', {
      event_category: 'engagement',
      event_label: 'Botón Únete a Nosotros',
    })
  }

  // Tu lógica normal...
}
```

Para implementar eventos personalizados, consulta la [documentación de Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4/events).

---

## 🔒 Privacidad y GDPR

### Cookie Consent

**Importante:** Google Analytics establece cookies. Según GDPR (Reglamento General de Protección de Datos), necesitas obtener consentimiento del usuario antes de rastrear.

**Próximo paso recomendado:** Implementar un banner de cookies.

Opciones populares:
- [Cookie Consent](https://www.cookieconsent.com/)
- [CookieYes](https://www.cookieyes.com/)
- [Osano](https://www.osano.com/)

Ejemplo de implementación con consentimiento:

```typescript
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const [cookieConsent, setCookieConsent] = useState(false)

{cookieConsent && GA_MEASUREMENT_ID && (
  // Scripts de Google Analytics...
)}
```

---

## 🛠️ Troubleshooting

### Problema: No veo datos en Google Analytics

**Soluciones:**

1. **Espera 24-48 horas:** Los datos pueden tardar en aparecer en informes estándar
2. **Verifica en Tiempo Real:** Ve a Informes > Tiempo real en Google Analytics
3. **Revisa que el ID sea correcto:** Debe ser `G-1D8ZN87TFQ`
4. **Verifica que la propiedad esté activa:** En Google Analytics > Admin > Propiedad
5. **Revisa que no tengas AdBlockers:** Pueden bloquear Google Analytics
6. **Modo incógnito:** Prueba en una ventana de incógnito (sin extensiones)

### Problema: Errores en consola del navegador

**Soluciones:**

1. **Error de CORS:** Normal, Google Analytics lo maneja internamente
2. **Error "gtag is not defined":** Verifica que los scripts se carguen correctamente
3. **Error de Content Security Policy:** Añade `https://www.googletagmanager.com` a tu CSP

---

## 📊 Métricas Clave a Monitorear

Una vez que empieces a recibir datos, monitorea:

1. **Usuarios activos** - Cuántas personas visitan tu web
2. **Páginas más visitadas** - Qué secciones son más populares
3. **Origen del tráfico** - De dónde vienen tus visitantes (Google, redes sociales, directo)
4. **Dispositivos** - Desktop vs Mobile vs Tablet
5. **Ubicación geográfica** - Ciudades/países de tus visitantes
6. **Duración de sesión** - Cuánto tiempo pasan en tu web
7. **Tasa de rebote** - Porcentaje que sale sin interactuar

---

## 🎓 Recursos Adicionales

- [Documentación oficial Google Analytics 4](https://support.google.com/analytics/answer/10089681)
- [Google Analytics Academy](https://analytics.google.com/analytics/academy/)
- [Next.js + Google Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/scripts#strategy)

---

## 🔄 Próximas Mejoras Recomendadas

1. ✅ **Cookie Consent Banner** - Para cumplir con GDPR
2. ✅ **Eventos personalizados** - Rastrear acciones específicas (formularios, descargas, etc.)
3. ✅ **Google Tag Manager** - Para gestionar múltiples herramientas de analytics
4. ✅ **Conversiones** - Definir objetivos y conversiones (registros, contactos, etc.)
5. ✅ **Integración con Search Console** - Para datos de búsqueda orgánica

---

**Fecha de implementación:** 27 de octubre de 2025
**Implementado por:** Vicente Rivas Monferrer (con asistencia de Claude Code)
