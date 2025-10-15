# 🤖 Sistema de Agentes Especializados para Roadmaps

**Versión:** 1.0.0
**Fecha:** 8 de octubre de 2025
**Autor:** Vicente Rivas Monferrer
**Proyecto:** Osyris Scout Management System

---

## 📋 Índice

1. [¿Qué es este sistema?](#qué-es-este-sistema)
2. [Arquitectura del sistema](#arquitectura-del-sistema)
3. [Comandos disponibles](#comandos-disponibles)
4. [Flujo de trabajo](#flujo-de-trabajo)
5. [Ejemplos prácticos](#ejemplos-prácticos)
6. [Mantenimiento](#mantenimiento)
7. [FAQ](#faq)

---

## 🎯 ¿Qué es este sistema?

Un **sistema inteligente de gestión de roadmaps** que permite:

✅ **Crear roadmaps** detallados con código completo
✅ **Mantener contexto** entre sesiones de Claude Code
✅ **Trackear progreso** automáticamente
✅ **No repetir trabajo** ya completado
✅ **Trabajar por fases** incrementales
✅ **Persistir estado** en archivos JSON

### Problema que Resuelve

**Antes:**
- 😫 Perdías contexto al cerrar Claude Code
- 🔄 Repetías trabajo ya completado
- 📝 No sabías qué faltaba por hacer
- ⏰ Estimaciones imprecisas

**Ahora:**
- ✅ El contexto se mantiene entre sesiones
- ✅ El agente sabe qué está hecho
- ✅ Tracking automático de progreso
- ✅ Estimaciones vs tiempo real

---

## 🏗️ Arquitectura del Sistema

```
Sistema de Agentes ROADMAP
│
├── 🧠 MCP Memory (Persistencia de conocimiento)
│   ├── Entidad: "Agente ROADMAP Creator"
│   ├── Entidad: "Sistema de Fases"
│   ├── Entidad: "Formato de ROADMAP"
│   └── Entidad: "Carpeta CONTEXTO_AGENTES"
│
├── 📁 CONTEXTO_AGENTES/ (Estado de roadmaps)
│   ├── README.md (Documentación)
│   ├── update-estado.js (Script helper)
│   └── ROADMAP_*_estado.json (Estados de cada roadmap)
│
├── 🎯 Comandos Especializados (.claude/commands/)
│   ├── empieza-fase.md (/empieza-fase N)
│   ├── nueva-fase.md (/nueva-fase [Nombre])
│   └── estado-roadmap.md (/estado-roadmap)
│
└── 📄 ROADMAPs Generados
    └── ROADMAP_*.md (Documentación completa con código)
```

---

## 🎮 Comandos Disponibles

### 1️⃣ `/nueva-fase [Nombre del Proyecto]`

**Propósito:** Crear un nuevo roadmap desde cero

**Qué hace:**
1. Pregunta detalles del proyecto (stack, objetivos, prioridad)
2. Genera un ROADMAP completo con fases numeradas
3. Crea archivo de estado JSON en `CONTEXTO_AGENTES/`
4. Muestra resumen y pregunta si empezar

**Ejemplo:**
```bash
/nueva-fase Sistema de Notificaciones Push
```

**Resultado:**
- `ROADMAP_NOTIFICACIONES_PUSH.md` (con código completo)
- `CONTEXTO_AGENTES/ROADMAP_NOTIFICACIONES_PUSH_estado.json`

---

### 2️⃣ `/empieza-fase N`

**Propósito:** Iniciar o continuar una fase específica

**Qué hace:**
1. Lee el archivo de estado JSON
2. Carga la fase N solicitada
3. Verifica qué tareas están completadas
4. Implementa solo las tareas pendientes
5. Actualiza el estado conforme avanza
6. Marca tareas y fases como completadas

**Ejemplo:**
```bash
/empieza-fase 3
```

**Resultado:**
- Implementa todas las tareas de la fase 3
- Actualiza el JSON marcando tareas completadas
- Muestra progreso en tiempo real

---

### 3️⃣ `/estado-roadmap`

**Propósito:** Ver el estado de todos los roadmaps activos

**Qué hace:**
1. Lee todos los archivos `*_estado.json`
2. Calcula progreso de cada roadmap
3. Muestra resumen visual con emojis
4. Indica próximos pasos recomendados

**Ejemplo:**
```bash
/estado-roadmap
```

**Resultado:**
```
📊 ESTADO DE ROADMAPS ACTIVOS
════════════════════════════════════════════════════════════

🎯 Dashboard Admin + Sistema de Invitaciones
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado:      🔄 En progreso
Progreso:    2/6 fases completadas (33%)
Actual:      FASE 3 - Sistema de Alta de Usuarios
Tiempo:      1.5h / 7.5h estimadas (20%)
...
```

---

## 🔄 Flujo de Trabajo Completo

### Escenario: Implementar un Sistema de Comentarios

#### Paso 1: Crear el Roadmap

```bash
/nueva-fase Sistema de Comentarios Anidados
```

**El agente pregunta:**
```
🎨 Voy a crear un ROADMAP nuevo. Necesito la siguiente información:

1. **Nombre del proyecto:** Sistema de Comentarios Anidados
2. **Objetivo principal:** Permitir comentarios con respuestas ilimitadas
3. **Stack tecnológico:** Next.js 15, PostgreSQL, React Query
4. **Prioridad general:** Alta
5. **Contexto adicional:** Similar a Reddit/HackerNews
```

**El agente genera:**
- `ROADMAP_COMENTARIOS_ANIDADOS.md` con 5 fases
- `CONTEXTO_AGENTES/ROADMAP_COMENTARIOS_ANIDADOS_estado.json`

#### Paso 2: Ver el Plan

```bash
# Opción A: Leer el ROADMAP completo
cat ROADMAP_COMENTARIOS_ANIDADOS.md

# Opción B: Ver solo el estado
/estado-roadmap
```

#### Paso 3: Empezar con la FASE 1

```bash
/empieza-fase 1
```

**El agente:**
1. Lee el estado JSON
2. Muestra tareas de la fase 1
3. Pregunta si proceder
4. Implementa cada tarea
5. Va marcando ✅ conforme completa

**Output:**
```
📊 FASE 1: Schema de Base de Datos
Prioridad: URGENTE
Estimación: 30 min

Tareas a realizar:
[ ] 1.1 - Crear tabla comentarios
[ ] 1.2 - Crear índices
[ ] 1.3 - Ejecutar migración

¿Quieres que empiece? (Sí)

🔨 Tarea 1.1: Crear tabla comentarios
[Implementa el código...]
✅ Tarea 1.1 completada

🔨 Tarea 1.2: Crear índices
[Implementa el código...]
✅ Tarea 1.2 completada

...

✅ FASE 1 COMPLETADA
Tiempo invertido: 25 min
¿Quieres continuar con FASE 2?
```

#### Paso 4: Continuar con Siguiente Fase

```bash
/empieza-fase 2
```

El proceso se repite para cada fase.

#### Paso 5: Ver Progreso en Cualquier Momento

```bash
/estado-roadmap
```

```
📊 Sistema de Comentarios Anidados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado:      🔄 En progreso
Progreso:    2/5 fases (40%)
Tiempo:      1.2h / 4h (30%)

Fases:
✅ FASE 1: Schema de BD
✅ FASE 2: API Backend
🔄 FASE 3: Componente React (EN PROGRESO)
⏳ FASE 4: Sistema de respuestas
⏳ FASE 5: Tests E2E
```

#### Paso 6: Cerrar y Retomar Después

**Cierras Claude Code** y vuelves al día siguiente:

```bash
# El contexto se mantiene!
/estado-roadmap

# Ver dónde te quedaste
# Continuar desde la fase 3
/empieza-fase 3
```

**El agente recuerda:**
- Qué fases están completadas ✅
- Qué tareas ya hiciste
- Dónde te quedaste
- Cuánto tiempo has invertido

---

## 🛠️ Script Helper Manual

Si quieres actualizar el estado manualmente:

```bash
# Ver estado completo
node CONTEXTO_AGENTES/update-estado.js COMENTARIOS_ANIDADOS ver-estado

# Marcar tarea como completada
node CONTEXTO_AGENTES/update-estado.js COMENTARIOS_ANIDADOS marcar-tarea-completada 3 3.2

# Iniciar una fase
node CONTEXTO_AGENTES/update-estado.js COMENTARIOS_ANIDADOS iniciar-fase 4

# Completar fase completa
node CONTEXTO_AGENTES/update-estado.js COMENTARIOS_ANIDADOS completar-fase 2

# Actualizar tiempo
node CONTEXTO_AGENTES/update-estado.js COMENTARIOS_ANIDADOS actualizar-tiempo 3.5
```

---

## 📊 Formato de Archivos de Estado

### Estructura JSON

```json
{
  "nombre_proyecto": "Sistema de Comentarios",
  "archivo_roadmap": "ROADMAP_COMENTARIOS.md",
  "fecha_creacion": "2025-10-08",
  "ultima_actualizacion": "2025-10-08",
  "estado_general": "en_progreso",
  "estimacion_total": "4 horas",
  "tiempo_invertido": "1.2 horas",
  "fases": [
    {
      "numero": 1,
      "titulo": "Schema de Base de Datos",
      "prioridad": "URGENTE",
      "estimacion": "30 min",
      "estado": "completado",
      "descripcion": "Crear tablas y relaciones",
      "tareas": [
        {
          "id": "1.1",
          "descripcion": "Crear tabla comentarios",
          "completado": true
        },
        {
          "id": "1.2",
          "descripcion": "Crear índices",
          "completado": true
        }
      ]
    }
  ],
  "dependencias": {
    "frontend": ["react-query@^5.0.0"],
    "backend": []
  },
  "variables_entorno": {
    "DATABASE_URL": "postgresql://..."
  },
  "notas": ["Usar recursión para comentarios anidados"]
}
```

---

## 🎨 Características de los ROADMAPs Generados

### 1. Código Completo

❌ **NO hace esto:**
```typescript
// TODO: Implementar lógica aquí
function crearComentario() {
  // Implementar
}
```

✅ **SÍ hace esto:**
```typescript
async function crearComentario(data: ComentarioInput) {
  try {
    const resultado = await pool.query(
      'INSERT INTO comentarios (texto, usuario_id, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [data.texto, data.usuarioId, data.parentId]
    );
    return resultado.rows[0];
  } catch (error) {
    throw new Error(`Error al crear comentario: ${error.message}`);
  }
}
```

### 2. Sistema de Fases

Cada fase tiene:
- **Número:** Para referencia
- **Título:** Descriptivo
- **Prioridad:** URGENTE, Alta, Media, Baja
- **Estimación:** Tiempo realista
- **Estado:** pendiente, en_progreso, completado
- **Tareas:** Lista de subtareas con checkboxes

### 3. Dependencias Completas

```json
{
  "dependencies": {
    "react-query": "^5.0.0",
    "zod": "^3.22.4"
  }
}
```

### 4. Variables de Entorno

```env
DATABASE_URL=postgresql://localhost:5432/mydb
SMTP_HOST=smtp.gmail.com
```

### 5. Checklist Final

```markdown
## ✅ Checklist de Implementación

### FASE 1: Schema BD ✅
- [x] Crear tabla comentarios
- [x] Crear índices

### FASE 2: API Backend 🔄
- [x] Endpoint POST /comentarios
- [ ] Endpoint GET /comentarios/:id
- [ ] Endpoint DELETE /comentarios/:id
```

---

## 🔍 Casos de Uso

### 1. Desarrollo de Nueva Feature

```bash
/nueva-fase Sistema de Pago con Stripe
/empieza-fase 1
# ... trabajas en cada fase
/estado-roadmap
```

### 2. Refactorización Grande

```bash
/nueva-fase Migración a TypeScript
/empieza-fase 1
# Puedes pausar y retomar después
```

### 3. Fix de Bug Complejo

```bash
/nueva-fase Fix: Memory Leak en Websockets
/empieza-fase 1
# El roadmap te guía paso a paso
```

### 4. Onboarding de Nuevo Dev

Un nuevo desarrollador puede:
```bash
/estado-roadmap
# Ver qué se ha hecho y qué falta
# Continuar desde donde el equipo lo dejó
```

---

## 🧹 Mantenimiento

### Archivar Roadmaps Completados

```bash
mkdir -p CONTEXTO_AGENTES/completados
mv CONTEXTO_AGENTES/ROADMAP_*_completado_estado.json CONTEXTO_AGENTES/completados/
```

### Limpiar Roadmaps Antiguos

```bash
# Listar roadmaps no actualizados en 30+ días
find CONTEXTO_AGENTES -name "*_estado.json" -mtime +30
```

### Backup de Estados

Los archivos JSON se incluyen en git:
```bash
git add CONTEXTO_AGENTES/
git commit -m "Actualizar estados de roadmaps"
git push
```

---

## 🎯 Mejores Prácticas

### 1. Nombrado de Roadmaps

✅ **Bueno:** `Sistema_de_Autenticacion_OAuth`
✅ **Bueno:** `Dashboard_Admin_Renovado`
❌ **Malo:** `Nuevo_proyecto_1`
❌ **Malo:** `Cosas_varias`

### 2. Tamaño de Fases

- **Fase pequeña:** 15-30 min (1-3 tareas)
- **Fase mediana:** 1-2 horas (3-6 tareas)
- **Fase grande:** 2-4 horas (6-10 tareas)

Si una fase supera 4h, divídela en 2 fases.

### 3. Prioridades

- **URGENTE:** Bloquea el proyecto
- **Alta:** Core functionality
- **Media:** Importante pero no crítico
- **Baja:** Nice to have

### 4. Actualización de Tiempo

Actualiza el tiempo invertido al terminar cada sesión:
```bash
node CONTEXTO_AGENTES/update-estado.js MI_PROYECTO actualizar-tiempo 2.5
```

---

## ❓ FAQ

### ¿Puedo tener múltiples roadmaps activos?

✅ **Sí.** Cada roadmap tiene su propio archivo de estado independiente.

```bash
/nueva-fase Proyecto A
/nueva-fase Proyecto B
/estado-roadmap  # Verás ambos
```

### ¿Qué pasa si cierro Claude Code?

✅ **El estado se mantiene.** Los archivos JSON persisten en el disco.

### ¿Puedo editar manualmente el JSON?

✅ **Sí.** Usa cualquier editor de texto. O usa el script helper:
```bash
node CONTEXTO_AGENTES/update-estado.js MI_PROYECTO ver-estado
```

### ¿Puedo compartir un roadmap con mi equipo?

✅ **Sí.** Los archivos están en git. Tu equipo puede:
1. Hacer pull del repo
2. Ver `/estado-roadmap`
3. Continuar con `/empieza-fase N`

### ¿Cómo borro un roadmap?

```bash
rm ROADMAP_MI_PROYECTO.md
rm CONTEXTO_AGENTES/ROADMAP_MI_PROYECTO_estado.json
```

### ¿Puedo cambiar el nombre de un roadmap?

⚠️ **Cuidado:** Debes renombrar ambos archivos:
```bash
mv ROADMAP_VIEJO.md ROADMAP_NUEVO.md
mv CONTEXTO_AGENTES/ROADMAP_VIEJO_estado.json CONTEXTO_AGENTES/ROADMAP_NUEVO_estado.json
```

Y editar el JSON para actualizar `archivo_roadmap`.

---

## 🚀 Próximas Mejoras

Posibles extensiones futuras:

- [ ] Integración con GitHub Issues
- [ ] Dashboard web para visualizar progreso
- [ ] Notificaciones cuando una fase se completa
- [ ] Estadísticas de velocidad de desarrollo
- [ ] Templates de roadmaps predefinidos
- [ ] Export a Notion/Trello/Jira

---

## 📚 Referencias

- **Memoria del agente:** `mcp__memory__read_graph`
- **Carpeta de contexto:** [CONTEXTO_AGENTES/](CONTEXTO_AGENTES/)
- **Comandos:** [.claude/commands/](.claude/commands/)
- **Ejemplo de roadmap:** [ROADMAP_DASHBOARD_ADMIN.md](ROADMAP_DASHBOARD_ADMIN.md)

---

## 🎓 Resumen Ejecutivo

Este sistema transforma la manera de trabajar con Claude Code:

**Antes:** 🔄 Empezabas de cero cada vez
**Ahora:** ✅ Continuidad total entre sesiones

**Antes:** 📝 No sabías qué faltaba
**Ahora:** 📊 Tracking visual de progreso

**Antes:** ⏰ Estimaciones al aire
**Ahora:** 📈 Tiempo real vs estimado

**Antes:** 👤 Trabajo individual
**Ahora:** 👥 Colaboración en equipo

---

**Última actualización:** 8 de octubre de 2025
**Versión del sistema:** 1.0.0
**Autor:** Vicente Rivas Monferrer
**Proyecto:** Osyris Scout Management System

---

## 💡 Para Empezar Ahora

```bash
# 1. Crea tu primer roadmap
/nueva-fase [Nombre de tu proyecto]

# 2. Empieza con la primera fase
/empieza-fase 1

# 3. Disfruta del contexto persistente! 🎉
```
