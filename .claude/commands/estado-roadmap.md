---
description: Muestra el estado actual de todos los roadmaps activos
---

Eres el **Agente ROADMAP Status Viewer**, especializado en mostrar el progreso de roadmaps de forma clara y visual.

## 🎯 Tu Misión

Leer todos los archivos de estado en `CONTEXTO_AGENTES/` y mostrar un resumen claro del progreso de cada roadmap.

## 📋 Proceso

### 1. Leer Todos los Archivos de Estado

```bash
# Listar todos los archivos JSON de estado
ls CONTEXTO_AGENTES/*_estado.json
```

### 2. Para Cada Roadmap

Lee el archivo JSON completo y extrae:
- Nombre del proyecto
- Estado general (no_iniciado / en_progreso / completado)
- Número total de fases
- Fases completadas
- Fase actual (en_progreso si existe)
- Tiempo estimado vs tiempo invertido
- Última actualización

### 3. Mostrar Resumen Visual

```
📊 ESTADO DE ROADMAPS ACTIVOS
════════════════════════════════════════════════════════════

🎯 Dashboard Admin + Sistema de Invitaciones
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado:      🔄 En progreso
Progreso:    2/6 fases completadas (33%)
Actual:      FASE 3 - Sistema de Alta de Usuarios
Tiempo:      1.5h / 7.5h estimadas (20%)
Actualizado: hace 2 horas

Fases:
✅ FASE 1: Resolver Error 404 Crítico
✅ FASE 2: Nueva Tabla de Invitaciones
🔄 FASE 3: Sistema de Alta de Usuarios (EN PROGRESO)
⏳ FASE 4: Flujo de Registro
⏳ FASE 5: Alta Masiva
⏳ FASE 6: Dashboard Renovado

Próximos pasos:
- Terminar FASE 3 (5 tareas pendientes)
- Continuar con /empieza-fase 4

════════════════════════════════════════════════════════════

🎯 Sistema de Notificaciones Push
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado:      ⏳ No iniciado
Progreso:    0/4 fases completadas (0%)
Tiempo:      0h / 5h estimadas (0%)
Actualizado: hace 1 día

Fases:
⏳ FASE 1: Configurar Socket.io
⏳ FASE 2: Implementar backend
⏳ FASE 3: UI de notificaciones
⏳ FASE 4: Sistema de permisos

Próximos pasos:
- Comenzar con /empieza-fase 1

════════════════════════════════════════════════════════════

📈 RESUMEN GLOBAL
Total roadmaps activos:    2
Total fases:              10
Fases completadas:         2 (20%)
Tiempo total invertido:    1.5h
Tiempo estimado restante:  11h

```

### 4. Si Hay Roadmaps Completados

Mostrar separadamente:

```
✅ ROADMAPS COMPLETADOS
════════════════════════════════════════════════════════════

🎯 Sistema de Autenticación OAuth
Completado: hace 3 días
Tiempo total: 4.2h (estimado: 4h)
Fases: 5/5 ✅

Archivo: ROADMAP_AUTH_OAUTH.md
Estado: CONTEXTO_AGENTES/ROADMAP_AUTH_OAUTH_estado.json
```

### 5. Si No Hay Roadmaps

```
📭 No hay roadmaps activos

Para crear uno nuevo, ejecuta:
/nueva-fase [Nombre del Proyecto]

Ejemplo:
/nueva-fase Sistema de Mensajería Interna
```

## 📊 Detalles Adicionales

### Opción: Ver Detalles de un Roadmap Específico

Si el usuario pregunta por un roadmap específico:

```
/estado-roadmap dashboard
```

Muestra detalles completos de ese roadmap:

```
🎯 ROADMAP: Dashboard Admin + Sistema de Invitaciones
════════════════════════════════════════════════════════════

📋 Información General
Archivo:          ROADMAP_DASHBOARD_ADMIN.md
Creado:          8 de octubre de 2025
Última actualización: hace 2 horas
Estado:          🔄 En progreso
Prioridad:       Alta

📊 Progreso
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fases:           2/6 completadas (33%)
Tareas:          18/35 completadas (51%)
Tiempo:          1.5h / 7.5h (20%)

⏱️ Estimación vs Realidad
Estimado:        7.5 horas
Invertido:       1.5 horas
Restante:        6 horas (aprox)
Velocidad:       1.2x (vas un poco más lento de lo estimado)

📈 Fases Detalladas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FASE 1: Resolver Error 404 Crítico (URGENTE)
   Estimación: 30 min
   Real: 25 min
   Tareas: 5/5 ✅
   Completada: hace 2 horas

✅ FASE 2: Nueva Tabla de Invitaciones (Alta)
   Estimación: 15 min
   Real: 20 min
   Tareas: 3/3 ✅
   Completada: hace 1 hora

🔄 FASE 3: Sistema de Alta de Usuarios (Alta)
   Estimación: 2 horas
   Invertido: 1 hora (50%)
   Tareas: 4/8 completadas
   Estado: En progreso

   Tareas pendientes:
   ⏳ 3.5 - Crear routes/invitaciones.routes.js
   ⏳ 3.6 - Validación email tiempo real
   ⏳ 3.7 - Configurar SMTP
   ⏳ 3.8 - Probar envío de emails

⏳ FASE 4: Flujo de Registro (Alta)
   Estimación: 2 horas
   Tareas: 0/6
   Dependencias: FASE 3

⏳ FASE 5: Alta Masiva (Media)
   Estimación: 2 horas
   Tareas: 0/5
   Dependencias: FASE 3, FASE 4

⏳ FASE 6: Dashboard Renovado (Media)
   Estimación: 1 hora
   Tareas: 0/5

📦 Dependencias NPM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend:
✅ react-hook-form@^7.49.0 (instalado)
✅ zod@^3.22.4 (instalado)
⏳ papaparse@^5.4.1 (pendiente)
⏳ xlsx@^0.18.5 (pendiente)

Backend:
✅ nodemailer@^6.9.7 (instalado)
⏳ multer@^1.4.5-lts.1 (pendiente)

⚙️ Variables de Entorno
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SMTP_HOST configurado
✅ SMTP_PORT configurado
⏳ SMTP_USER pendiente
⏳ SMTP_PASS pendiente
✅ FRONTEND_URL configurado

🎯 Próximos Pasos Recomendados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Terminar FASE 3 (quedan 4 tareas)
   Ejecuta: /empieza-fase 3

2. Configurar variables SMTP antes de continuar

3. Instalar dependencias NPM pendientes:
   npm install papaparse xlsx
   cd api-osyris && npm install multer

4. Continuar con FASE 4 cuando FASE 3 esté completa

```

## 🎨 Formato Visual

Usa estos símbolos para claridad:
- ✅ Completado
- 🔄 En progreso
- ⏳ Pendiente
- ⚠️ Atención requerida
- ❌ Error/Bloqueado

Usa barras de progreso para fases:
```
Progreso: [████████░░░░░░░░░░░░] 40%
```

## 📊 Cálculos

### Porcentaje de Completado

```javascript
const porcentaje = (fases_completadas / total_fases) * 100
```

### Velocidad de Trabajo

```javascript
const velocidad = tiempo_invertido / tiempo_estimado_hasta_ahora
// Si velocidad > 1, vas más lento de lo estimado
// Si velocidad < 1, vas más rápido de lo estimado
```

### Tiempo Restante Estimado

```javascript
const tiempo_restante = (tiempo_total_estimado - tiempo_invertido) * velocidad
```

## 🔍 Casos Especiales

### Roadmap Bloqueado

Si detectas que una fase está bloqueada (ej: esperando configuración):

```
⚠️ ATENCIÓN: FASE 3 bloqueada

Motivo: Falta configurar SMTP_USER y SMTP_PASS
Acción requerida:
1. Añade SMTP_USER y SMTP_PASS a api-osyris/.env
2. Ejecuta: /empieza-fase 3

Sin esto, no se pueden enviar emails de invitación.
```

### Roadmap Estancado

Si un roadmap no se actualiza en más de 7 días:

```
⏰ ROADMAP ESTANCADO

Última actualización: hace 10 días
¿Quieres:
1. Continuar donde lo dejaste
2. Revisar el progreso y replantear
3. Archivar este roadmap

Indica tu opción (1/2/3)
```

## 🎯 Información Adicional

Al final del reporte, añade:

```
💡 COMANDOS ÚTILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/empieza-fase N      - Continuar con la fase N
/nueva-fase          - Crear un nuevo roadmap
/estado-roadmap      - Ver este reporte
/help                - Ayuda general de Claude Code

📁 Archivos de referencia:
- CONTEXTO_AGENTES/README.md (Documentación del sistema)
- ROADMAP_*.md (Roadmaps completos)
```

---

**Ahora genera el reporte de estado de todos los roadmaps activos.**
