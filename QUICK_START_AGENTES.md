# ⚡ Quick Start: Sistema de Agentes ROADMAP

**Tiempo de lectura:** 2 minutos
**Nivel:** Principiante

---

## 🎯 En 3 Pasos

### 1️⃣ Crea un Roadmap

```bash
/nueva-fase Sistema de Notificaciones
```

**El agente preguntará:**
- Stack tecnológico
- Objetivo principal
- Prioridad

**Resultado:**
- ✅ `ROADMAP_NOTIFICACIONES.md` creado
- ✅ Estado JSON creado en `CONTEXTO_AGENTES/`

---

### 2️⃣ Empieza a Trabajar

```bash
/empieza-fase 1
```

**El agente:**
- Lee el roadmap
- Muestra las tareas de la fase 1
- Pregunta si proceder
- Implementa cada tarea
- Marca ✅ conforme completa

---

### 3️⃣ Ve tu Progreso

```bash
/estado-roadmap
```

**Verás:**
```
📊 Sistema de Notificaciones
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado:      🔄 En progreso
Progreso:    1/4 fases (25%)
Tiempo:      30min / 3h

Fases:
✅ FASE 1: Configurar Socket.io
🔄 FASE 2: Backend API (EN PROGRESO)
⏳ FASE 3: UI de notificaciones
⏳ FASE 4: Sistema de permisos
```

---

## 🔥 Comandos Esenciales

| Comando | Qué hace |
|---------|----------|
| `/nueva-fase [Nombre]` | Crea un roadmap nuevo |
| `/empieza-fase N` | Trabaja en la fase N |
| `/estado-roadmap` | Ver progreso de todos los roadmaps |

---

## 💡 Ejemplo Completo

```bash
# 1. Crear roadmap
/nueva-fase Sistema de Chat en Tiempo Real

# 2. Responder preguntas del agente
# Stack: Next.js, Socket.io, PostgreSQL
# Prioridad: Alta

# 3. Ver el roadmap generado
cat ROADMAP_CHAT_TIEMPO_REAL.md

# 4. Empezar fase 1
/empieza-fase 1

# 5. El agente implementa automáticamente
# ... código se genera, tareas se marcan ...

# 6. Ver progreso
/estado-roadmap

# 7. Continuar con fase 2
/empieza-fase 2

# 8. Cerrar y volver mañana
# El contexto se mantiene! ✅

# 9. Al día siguiente
/estado-roadmap
# Continuar donde lo dejaste
/empieza-fase 3
```

---

## ✨ Magia del Sistema

### 🔒 Persistencia
Cierras Claude Code → Vuelves mañana → **Todo se mantiene**

### 📊 Tracking Automático
El agente **marca tareas** conforme las completa

### 🚫 No Repetir
El agente **sabe qué ya está hecho**

### 👥 Colaboración
Tu equipo puede **continuar tu trabajo**

---

## 🆘 ¿Problemas?

### No veo mis roadmaps

```bash
ls CONTEXTO_AGENTES/
```

Si está vacío:
```bash
/nueva-fase Mi Primer Proyecto
```

### Quiero ver un roadmap específico

```bash
cat ROADMAP_[NOMBRE].md
```

### Quiero borrar un roadmap

```bash
rm ROADMAP_[NOMBRE].md
rm CONTEXTO_AGENTES/ROADMAP_[NOMBRE]_estado.json
```

---

## 📚 Más Información

- **Guía completa:** [SISTEMA_AGENTES_ROADMAP.md](SISTEMA_AGENTES_ROADMAP.md)
- **Carpeta de contexto:** [CONTEXTO_AGENTES/README.md](CONTEXTO_AGENTES/README.md)
- **Ejemplo de roadmap:** [ROADMAP_DASHBOARD_ADMIN.md](ROADMAP_DASHBOARD_ADMIN.md)

---

## 🎓 Recursos de Aprendizaje

### Video Tutorial (Texto)

**Paso 1:** Crear roadmap
```
Usuario: /nueva-fase Sistema de Comentarios
Agente: ¿Stack tecnológico?
Usuario: Next.js, PostgreSQL
Agente: [Genera roadmap completo con 5 fases]
```

**Paso 2:** Implementar
```
Usuario: /empieza-fase 1
Agente: Implementando fase 1...
        ✅ Tabla comentarios creada
        ✅ Índices añadidos
        ✅ Migración ejecutada
        FASE 1 COMPLETADA
```

**Paso 3:** Continuar
```
Usuario: /empieza-fase 2
Agente: [Continúa con fase 2...]
```

---

## 🚀 Ya Estás Listo

```bash
/nueva-fase [Tu Proyecto Aquí]
```

**¡Empieza ahora!** 🎉

---

**Creado:** 8 de octubre de 2025
**Para:** Osyris Scout Management System
