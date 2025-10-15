# 🤖 Carpeta de Contexto para Agentes Especializados

## 📋 Propósito

Esta carpeta contiene **archivos de estado** que permiten a los agentes especializados de Claude Code mantener contexto entre diferentes sesiones y ventanas.

## 🗂️ Estructura de Archivos

```
CONTEXTO_AGENTES/
├── README.md                                   # Este archivo
├── ROADMAP_DASHBOARD_ADMIN_estado.json         # Estado del roadmap de dashboard admin
└── [futuros_roadmaps]_estado.json              # Otros roadmaps activos
```

## 📄 Formato de Archivos de Estado

Cada archivo JSON de estado contiene:

```json
{
  "nombre_proyecto": "Nombre descriptivo del proyecto",
  "archivo_roadmap": "ROADMAP_NOMBRE.md",
  "fecha_creacion": "YYYY-MM-DD",
  "ultima_actualizacion": "YYYY-MM-DD",
  "estado_general": "no_iniciado | en_progreso | completado",
  "estimacion_total": "X horas",
  "tiempo_invertido": "X horas",
  "fases": [
    {
      "numero": 1,
      "titulo": "Título de la fase",
      "prioridad": "URGENTE | Alta | Media | Baja",
      "estimacion": "X min/horas",
      "estado": "pendiente | en_progreso | completado",
      "descripcion": "Descripción breve",
      "tareas": [
        {
          "id": "1.1",
          "descripcion": "Descripción de la tarea",
          "completado": false
        }
      ]
    }
  ],
  "dependencias": {
    "frontend": ["paquete@version"],
    "backend": ["paquete@version"]
  },
  "variables_entorno": {},
  "notas": []
}
```

## 🎯 ¿Cómo Funcionan los Agentes?

### 1. Creación de ROADMAP

Cuando se crea un nuevo ROADMAP:
1. Se genera el archivo `.md` con todas las fases detalladas
2. Se crea automáticamente un archivo `_estado.json` en esta carpeta
3. Todas las fases comienzan con `estado: "pendiente"`

### 2. Inicio de una Fase

Cuando ejecutas `/empieza-fase N`:
1. El agente lee el archivo de estado JSON
2. Busca la fase N
3. Actualiza el estado a `"en_progreso"`
4. Muestra un resumen de las tareas a realizar
5. Pregunta si quieres proceder

### 3. Completar Tareas

Conforme trabajas en las tareas:
- El agente va marcando `completado: true` en cada tarea
- Actualiza `tiempo_invertido`
- Cuando todas las tareas de una fase están completadas, marca la fase como `"completado"`

### 4. Persistencia

Los archivos JSON se mantienen entre sesiones:
- ✅ Si cierras Claude Code y vuelves, el contexto se mantiene
- ✅ Si abres una nueva ventana, puedes continuar donde lo dejaste
- ✅ Evita repetir trabajo ya completado

## 🚀 Comandos Disponibles

### `/empieza-fase N`
Inicia o continúa trabajando en la fase N del roadmap activo.

**Ejemplo:**
```
/empieza-fase 1
```

El agente:
1. Lee `ROADMAP_*_estado.json`
2. Carga la fase 1
3. Muestra qué hay que hacer
4. Comienza la implementación

### `/nueva-fase`
Crea un nuevo ROADMAP desde cero para un proyecto.

**Ejemplo:**
```
/nueva-fase Sistema de Autenticación con OAuth
```

El agente:
1. Pregunta detalles del proyecto
2. Genera un ROADMAP completo con fases
3. Crea el archivo de estado JSON
4. Te muestra el plan completo

## 📊 Estados Posibles

### Estado General del Proyecto
- `no_iniciado` - El proyecto no ha comenzado
- `en_progreso` - Al menos una fase está en progreso
- `completado` - Todas las fases completadas

### Estado de Fases
- `pendiente` ⏳ - No iniciada
- `en_progreso` 🔄 - Actualmente trabajando en ella
- `completado` ✅ - Todas las tareas completadas

## 🔄 Actualización Automática

Los agentes actualizan automáticamente los archivos JSON cuando:
- Marcas una tarea como completada
- Inicias una nueva fase
- Completas una fase completa
- Instalas dependencias
- Configuras variables de entorno

## 🛠️ Script Helper: update-estado.js

Incluye un script Node.js para actualizar manualmente los estados:

### Comandos Disponibles

```bash
# Ver estado completo
node CONTEXTO_AGENTES/update-estado.js DASHBOARD_ADMIN ver-estado

# Marcar una tarea como completada
node CONTEXTO_AGENTES/update-estado.js DASHBOARD_ADMIN marcar-tarea-completada 1 1.1

# Iniciar una fase
node CONTEXTO_AGENTES/update-estado.js DASHBOARD_ADMIN iniciar-fase 3

# Completar una fase completa
node CONTEXTO_AGENTES/update-estado.js DASHBOARD_ADMIN completar-fase 1

# Actualizar tiempo invertido
node CONTEXTO_AGENTES/update-estado.js DASHBOARD_ADMIN actualizar-tiempo 2.5
```

### Uso por los Agentes

Los agentes especializados usan este script internamente para:
- Marcar tareas completadas conforme las implementan
- Actualizar el estado de las fases
- Mantener sincronizado el tiempo invertido

## 📝 Ejemplo de Flujo de Trabajo

```bash
# 1. Crear nuevo roadmap
/nueva-fase Dashboard de Analytics

# 2. Ver estado actual
/estado-roadmap

# 3. Empezar fase 1
/empieza-fase 1

# 4. El agente implementa la fase 1...
# 5. Marca tareas como completadas automáticamente
# 6. Al terminar, actualiza el estado de la fase a "completado"

# 7. Ver progreso actualizado
/estado-roadmap

# 8. Continuar con siguiente fase
/empieza-fase 2

# ... y así sucesivamente
```

## 🧹 Mantenimiento

### Limpiar Roadmaps Completados

Cuando un proyecto está completado al 100%, puedes:
1. Mover el archivo `_estado.json` a una subcarpeta `completados/`
2. O simplemente eliminarlo si ya no lo necesitas

### Respaldar Estado

Los archivos JSON son texto plano, así que:
- Se incluyen en tu control de versiones (git)
- Puedes hacer backup manual copiando la carpeta
- Se sincronizan con tu repositorio

## 🎨 Beneficios del Sistema

✅ **Persistencia:** Mantiene el contexto entre sesiones
✅ **Trazabilidad:** Sabes exactamente qué se ha hecho y qué falta
✅ **Colaboración:** Otros desarrolladores pueden ver el progreso
✅ **Estimaciones:** Tiempo real vs estimado para mejorar futuras estimaciones
✅ **No repetir trabajo:** El agente sabe qué tareas ya están hechas

---

**Última actualización:** 8 de octubre de 2025
