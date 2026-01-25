# Plan de Verificación Ortográfica - Osyris Web

## Objetivo
Revisar TODOS los archivos con texto visible al usuario para garantizar una ortografía impecable en castellano, enfocándose en:
1. Errores de "ñ" (ny → ñ)
2. Acentos faltantes
3. Acentos incorrectos
4. Otros errores ortográficos

## Resumen de Alcance

| Categoría | Archivos | Prioridad |
|-----------|----------|-----------|
| Páginas principales | 58 | CRÍTICA |
| Componentes | 133 | ALTA |
| Hooks y utils | 26 | MEDIA |
| Backend mensajes | 47 | MEDIA |
| **TOTAL** | **264** | - |

---

## FASE 1: Páginas Principales (58 archivos)
**Duración estimada:** 15-20 minutos
**Prioridad:** CRÍTICA - Son lo primero que ve el usuario

### 1.1 Página de Inicio y Globales
```
□ src/app/page.tsx
□ src/app/layout.tsx
□ src/app/error.tsx
□ src/app/not-found.tsx
□ src/app/dashboard/page.tsx
```

### 1.2 Autenticación y Registro
```
□ src/app/login/page.tsx
□ src/app/login/loading.tsx
□ src/app/registro/page.tsx
□ src/app/recuperar-contrasena/page.tsx
□ src/app/reset-password/page.tsx
```

### 1.3 Secciones Scout (ALTO CONTENIDO TEXTUAL)
```
□ src/app/secciones/page.tsx
□ src/app/secciones/castores/page.tsx
□ src/app/secciones/manada/page.tsx
□ src/app/secciones/tropa/page.tsx
□ src/app/secciones/pioneros/page.tsx
□ src/app/secciones/rutas/page.tsx
```

### 1.4 Información Pública
```
□ src/app/sobre-nosotros/page.tsx
□ src/app/sobre-nosotros/kraal/page.tsx
□ src/app/sobre-nosotros/comite/page.tsx
□ src/app/contacto/page.tsx
□ src/app/calendario/page.tsx
□ src/app/galeria/page.tsx
□ src/app/faq/page.tsx
□ src/app/preguntas-frecuentes/page.tsx
□ src/app/privacidad/page.tsx
□ src/app/terminos/page.tsx
```

### 1.5 Portal Familia
```
□ src/app/familia/layout.tsx
□ src/app/familia/dashboard/page.tsx
□ src/app/familia/calendario/page.tsx
□ src/app/familia/documentos/page.tsx
□ src/app/familia/galeria/page.tsx
□ src/app/familia/notificaciones/page.tsx
□ src/app/familia/perfil/page.tsx
```

### 1.6 Aula Virtual
```
□ src/app/aula-virtual/layout.tsx
□ src/app/aula-virtual/page.tsx
□ src/app/aula-virtual/admin/page.tsx
□ src/app/aula-virtual/calendario/page.tsx
□ src/app/aula-virtual/documentos/page.tsx
□ src/app/aula-virtual/documentos-pendientes/page.tsx
□ src/app/aula-virtual/comunicaciones/page.tsx
□ src/app/aula-virtual/educandos/page.tsx
□ src/app/aula-virtual/solicitudes-desbloqueo/page.tsx
□ src/app/aula-virtual/ajustes/page.tsx
```

### 1.7 Panel Admin
```
□ src/app/admin/page.tsx
□ src/app/admin/layout.tsx
□ src/app/admin/dashboard/page.tsx
□ src/app/admin/analytics/page.tsx
□ src/app/admin/campaigns/page.tsx
□ src/app/admin/users/page.tsx
□ src/app/admin/system/page.tsx
□ src/app/admin/documentos-pendientes/page.tsx
□ src/app/admin/educandos/page.tsx
□ src/app/admin/educandos/nuevo/page.tsx
□ src/app/admin/educandos/[id]/page.tsx
□ src/app/admin/familiares/page.tsx
□ src/app/admin/familiares/listar/page.tsx
□ src/app/admin/familiares/invitar/page.tsx
□ src/app/admin/familiares/estadisticas/page.tsx
□ src/app/admin/familiares/vincular/page.tsx
□ src/app/admin/familiares/documentos/page.tsx
```

---

## FASE 2: Componentes (133 archivos)
**Duración estimada:** 25-35 minutos
**Prioridad:** ALTA - Contienen la mayoría del texto de la UI

### 2.1 Navegación y Layout
```
□ src/components/main-nav.tsx
□ src/components/site-footer.tsx
□ src/components/theme-toggle.tsx
□ src/components/icons.tsx
□ src/components/error-boundary.tsx
```

### 2.2 Autenticación
```
□ src/components/auth/protected-route.tsx
□ src/components/auth/protected-familia-route.tsx
□ src/components/dev-session-init.tsx
```

### 2.3 Admin
```
□ src/components/admin/admin-nav-tabs.tsx
□ src/components/admin/admin-mobile-nav.tsx
□ src/components/admin/user-table.tsx
□ src/components/admin/edit-user-modal.tsx
□ src/components/admin/quick-add-modal.tsx
□ src/components/admin/search-bar.tsx
□ src/components/admin/page-preview-miniature.tsx
□ src/components/admin/invitaciones-panel.tsx
□ src/components/admin/familias-resumen-card.tsx
```

### 2.4 Admin - Familiares
```
□ src/components/admin/familiares/familiares-list.tsx
□ src/components/admin/familiares/invitar-familiar.tsx
□ src/components/admin/familiares/invitar-familiar-v2.tsx
□ src/components/admin/familiares/bulk-invite-modal.tsx
□ src/components/admin/familiares/tabla-relaciones.tsx
□ src/components/admin/familiares/vincular-educando.tsx
□ src/components/admin/familiares/aprobar-documentos.tsx
```

### 2.5 Aula Virtual
```
□ src/components/aula-virtual/nav-tabs.tsx
□ src/components/aula-virtual/mobile-nav.tsx
□ src/components/aula-virtual/sidebar.tsx
□ src/components/aula-virtual/evento-form-modal.tsx
□ src/components/aula-virtual/evento-cell-kraal.tsx
□ src/components/aula-virtual/asistencia-detail-modal.tsx
□ src/components/aula-virtual/asistencia-badge-kraal.tsx
□ src/components/aula-virtual/proximo-sabado-card.tsx
□ src/components/aula-virtual/proximo-campamento-card.tsx
```

### 2.6 Aula Virtual - Educandos
```
□ src/components/aula-virtual/educandos/educandos-list.tsx
□ src/components/aula-virtual/educandos/educando-filters.tsx
□ src/components/aula-virtual/educandos/educando-form-modal.tsx
□ src/components/aula-virtual/educandos/educando-detail-modal.tsx
□ src/components/aula-virtual/educandos/send-message-modal.tsx
□ src/components/aula-virtual/educandos/send-notification-modal.tsx
```

### 2.7 Familia - Generales
```
□ src/components/familia/familia-nav-sidebar.tsx
□ src/components/familia/familia-sidebar.tsx
□ src/components/familia/mobile-nav-familia.tsx
□ src/components/familia/dashboard-home.tsx
□ src/components/familia/quick-action-button.tsx
□ src/components/familia/quick-action-icon.tsx
□ src/components/familia/alertas-urgentes.tsx
□ src/components/familia/actividad-preview.tsx
□ src/components/familia/hijo-card-compacto.tsx
□ src/components/familia/scout-info-card.tsx
□ src/components/familia/mensajes-monitor-compacto.tsx
```

### 2.8 Familia - Calendario
```
□ src/components/familia/calendario-compacto.tsx
□ src/components/familia/calendario/calendario-view.tsx
□ src/components/familia/calendario/activity-filter.tsx
□ src/components/familia/calendario/asistencia-counter.tsx
□ src/components/familia/calendario/confirmation-badge.tsx
□ src/components/familia/calendario/tipo-evento-badge.tsx
□ src/components/familia/calendario/evento-calendar-cell.tsx
□ src/components/familia/calendario/evento-detail-modal.tsx
□ src/components/familia/calendario/confirmacion-reunion-form.tsx
□ src/components/familia/calendario/inscripcion-campamento-form.tsx
□ src/components/familia/calendario/inscripcion-campamento-wizard.tsx
□ src/components/familia/calendario/documento-campamento-card.tsx
□ src/components/familia/calendario/tipos-evento.ts
```

### 2.9 Familia - Documentos
```
□ src/components/familia/documento-item-simple.tsx
□ src/components/familia/documentos-lista-compacta.tsx
□ src/components/familia/documento-upload-modal.tsx
□ src/components/familia/documento-viewer-modal.tsx
□ src/components/familia/documentos/documentos-dashboard.tsx
□ src/components/familia/documentos/documento-card.tsx
□ src/components/familia/documentos/documento-resubir-modal.tsx
□ src/components/familia/documentos/upload-documento.tsx
□ src/components/familia/documentos/plantillas-documentos.tsx
```

### 2.10 Familia - Galería
```
□ src/components/familia/galeria/private-gallery-view.tsx
□ src/components/familia/galeria/album-card.tsx
□ src/components/familia/galeria/photo-lightbox.tsx
□ src/components/familia/galeria/download-batch.tsx
```

### 2.11 Familia - Notificaciones
```
□ src/components/familia/notificaciones/notification-center.tsx
□ src/components/familia/notificaciones/notification-compose.tsx
□ src/components/familia/notificaciones/notification-item.tsx
□ src/components/familia/notificaciones/notification-preferences.tsx
```

### 2.12 Familia - Perfil
```
□ src/components/familia/perfil/perfil-info-personal.tsx
□ src/components/familia/perfil/scouts-vinculados.tsx
□ src/components/familia/perfil/preferencias-interfaz.tsx
□ src/components/familia/perfil/configuracion-seguridad.tsx
```

### 2.13 UI Components con Texto
```
□ src/components/ui/calendar-view.tsx
□ src/components/ui/dynamic-section-page.tsx
□ src/components/ui/dynamic-section-page-new.tsx
□ src/components/ui/section-page-template.tsx
□ src/components/ui/page-editor.tsx
□ src/components/ui/password-strength.tsx
□ src/components/ui/form-field-tooltip.tsx
□ src/components/ui/date-picker.tsx
□ src/components/ui/sonner.tsx
□ src/components/ui/toaster.tsx
```

---

## FASE 3: Hooks, Contextos y Utilidades (26 archivos)
**Duración estimada:** 10-15 minutos
**Prioridad:** MEDIA - Contienen mensajes de error y textos de UI

### 3.1 Contextos
```
□ src/contexts/AuthContext.tsx
□ src/contexts/EditModeContext.tsx
```

### 3.2 Hooks
```
□ src/hooks/useAuth.ts
□ src/hooks/useAuthStatic.ts
□ src/hooks/useFamiliaData.ts
□ src/hooks/useEducandos.ts
□ src/hooks/useEducandosScouter.ts
□ src/hooks/useAdminFamiliares.ts
□ src/hooks/useGaleriaFamilia.ts
□ src/hooks/useDocumentosFamilia.ts
□ src/hooks/useNotificacionesFamilia.ts
□ src/hooks/useNotificacionesScouter.ts
□ src/hooks/useCalendarioFamilia.ts
□ src/hooks/useDashboardData.ts
□ src/hooks/useDashboardScouter.ts
□ src/hooks/usePerfilFamilia.ts
□ src/hooks/useVinculacion.ts
□ src/hooks/useSectionContent.ts
□ src/hooks/useGoogleDrive.ts
□ src/hooks/useInscripcionCampamento.ts
□ src/hooks/useDocumentoResubida.ts
□ src/hooks/use-toast.ts
```

### 3.3 Librerías
```
□ src/lib/auth-utils.ts
□ src/lib/api-utils.ts
□ src/lib/page-connector.ts
□ src/lib/calendar-export.ts
```

---

## FASE 4: Backend - Mensajes de Error/Respuesta (47 archivos)
**Duración estimada:** 15-20 minutos
**Prioridad:** MEDIA - Mensajes que ve el usuario en errores

### 4.1 Controladores
```
□ api-osyris/src/controllers/auth.controller.js
□ api-osyris/src/controllers/admin.controller.js
□ api-osyris/src/controllers/familia.controller.js
□ api-osyris/src/controllers/familiar.controller.js
□ api-osyris/src/controllers/educando.controller.js
□ api-osyris/src/controllers/confirmaciones.controller.js
□ api-osyris/src/controllers/galeria_fotos.controller.js
□ api-osyris/src/controllers/notificaciones_familia.controller.js
□ api-osyris/src/controllers/documentos_familia.controller.js
□ api-osyris/src/controllers/upload.controller.js
[... resto de controladores]
```

### 4.2 Rutas con mensajes
```
□ api-osyris/src/routes/auth.routes.js
□ api-osyris/src/routes/admin.routes.js
□ api-osyris/src/routes/familia.routes.js
[... resto de rutas]
```

---

## Patrones de Búsqueda

### Búsqueda de errores de "ñ"
```bash
# Buscar "ny" que debería ser "ñ"
grep -rn "nino\|ninos\|nina\|ninas" --include="*.tsx" --include="*.ts" src/
grep -rn "espanol\|espanola" --include="*.tsx" --include="*.ts" src/
grep -rn "companero\|companera" --include="*.tsx" --include="*.ts" src/
grep -rn "manana\|ano\|anos" --include="*.tsx" --include="*.ts" src/
grep -rn "pequeno\|pequena" --include="*.tsx" --include="*.ts" src/
```

### Búsqueda de acentos faltantes
```bash
# Palabras terminadas en -cion (deberían ser -ción)
grep -rn '"[^"]*cion[^é"]' --include="*.tsx" --include="*.ts" src/

# Palabras comunes sin acento
grep -rn "seccion\|informacion\|notificacion" --include="*.tsx" --include="*.ts" src/
grep -rn "codigo\|numero\|telefono" --include="*.tsx" --include="*.ts" src/
grep -rn "proximo\|ultimo\|pagina" --include="*.tsx" --include="*.ts" src/
```

---

## Checklist de Palabras Críticas

### Deben llevar tilde SIEMPRE:
- [ ] sección (no seccion)
- [ ] información (no informacion)
- [ ] notificación (no notificacion)
- [ ] confirmación (no confirmacion)
- [ ] configuración (no configuracion)
- [ ] vinculación (no vinculacion)
- [ ] autenticación (no autenticacion)
- [ ] administración (no administracion)
- [ ] sesión (no sesion)
- [ ] reunión (no reunion)
- [ ] número (no numero)
- [ ] teléfono (no telefono)
- [ ] código (no codigo)
- [ ] método (no metodo)
- [ ] próximo (no proximo)
- [ ] último (no ultimo)
- [ ] página (no pagina)
- [ ] válido (no valido)
- [ ] móvil (no movil)
- [ ] fácil (no facil)
- [ ] útil (no util)
- [ ] éxito (no exito)
- [ ] sábado (no sabado)
- [ ] miércoles (no miercoles)
- [ ] cámara (no camara)
- [ ] galería (no galeria)
- [ ] más (cuando es adverbio de cantidad)
- [ ] sí (cuando es afirmación)
- [ ] tú (pronombre personal)
- [ ] él (pronombre personal)

### Términos Scout (sin modificar):
- scouter (anglicismo)
- kraal (término específico)
- Waingunga (nombre propio)
- Brownsea (nombre propio)
- castores, lobatos, pioneros, rutas, tropa, manada (sin tilde)

---

## Ejecución del Plan

### Comando para iniciar
```
/verificar-ortografia --completo
```

### Validación post-corrección
```bash
npm run lint
npm run build
```

### Generar reporte
```
/verificar-ortografia --solo-reporte
```

---

## Criterios de Éxito

- [ ] 0 errores de "ñ" (ny → ñ)
- [ ] 0 acentos faltantes en palabras obligatorias
- [ ] 0 errores de acentos diacríticos en contexto
- [ ] Build exitoso después de correcciones
- [ ] Lint sin errores
- [ ] Revisión visual de cambios completada

---

*Plan creado para garantizar la calidad ortográfica profesional de Osyris Web.*
