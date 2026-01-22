# /osyris-fix-issue

Arregla un issue específico del test de usuario creando un worktree dedicado, implementando la solución, y verificándola automáticamente.

## Uso

```
/osyris-fix-issue <ISSUE_ID>
```

## Parámetros

- **ISSUE_ID** (requerido): Identificador del issue a resolver. Ejemplos:
  - `CRIT-001` - Error "No tienes una sección asignada"
  - `CRIT-002` - Notificaciones quedan "pilladas"
  - `CRIT-003` - Carpeta de educando no se crea
  - `CRIT-004` - Formulario educando no se envía
  - `HIGH-001` a `HIGH-005` - Issues de prioridad alta
  - `MED-001` a `MED-006` - Issues de prioridad media
  - `LOW-001` a `LOW-005` - Issues de prioridad baja

## Catálogo de Issues

### PRIORIDAD 1: CRÍTICA

| ID | Problema | Skill |
|----|----------|-------|
| CRIT-001 | Error "No tienes una sección asignada" | fix-seccion-asignada.md |
| CRIT-002 | Notificaciones quedan "pilladas" | fix-notificaciones-pilladas.md |
| CRIT-003 | Carpeta de educando no se crea | fix-carpeta-drive.md |
| CRIT-004 | Formulario educando no se envía | fix-formulario-educando.md |

### PRIORIDAD 2: ALTA

| ID | Problema | Skill |
|----|----------|-------|
| HIGH-001 | Zoom excesivo en documentos | fix-zoom-documentos.md |
| HIGH-002 | Tiempos de carga lentos | fix-performance-imagenes.md |
| HIGH-003 | Calendario solo muestra reuniones | fix-calendario-eventos.md |
| HIGH-004 | Kraal puede crear eventos otras secciones | fix-permisos-eventos.md |
| HIGH-005 | Campo campamento obligatorio inactivo | fix-campo-campamento.md |

### PRIORIDAD 3: MEDIA

| ID | Problema | Skill |
|----|----------|-------|
| MED-001 | Falta teléfono contacto padres | add-telefono-contacto.md |
| MED-002 | Falta autorización imágenes | add-autorizacion-imagenes.md |
| MED-003 | Falta filtrado educandos | add-filtros-educandos.md |
| MED-004 | Exceso de campos | simplify-formulario.md |
| MED-005 | Falta chat con familias | add-mensajeria-familias.md |
| MED-006 | Explicación de campos | add-tooltips-campos.md |

## Flujo de Ejecución

### Paso 1: Cargar Skill del Issue

Buscar y leer el archivo `.claude/skills/issues/<skill-name>.md` correspondiente al issue.

Si no existe la skill:
```
⚠️ No existe skill para ISSUE_ID
¿Deseas crear la skill interactivamente? (S/N)
```

### Paso 2: Crear Worktree

```bash
.claude/scripts/worktree-manager.sh create <ISSUE_ID> fix
```

Esto crea:
- Directorio `trees/<ISSUE_ID>/`
- Rama `fix/<ISSUE_ID>`
- Copia de `.claude/` y `.env`
- Dependencias instaladas

### Paso 3: Implementar Solución

Siguiendo la skill cargada:
1. Leer archivos afectados
2. Implementar cambios
3. Hacer commits atómicos con conventional commits

Formato de commits:
```
fix(<área>): descripción breve del cambio

- Detalle 1
- Detalle 2

Closes #ISSUE_ID
```

### Paso 4: Activar Ralph Loop

Crear archivo `.claude/PROMPT.md` con:

```markdown
# 🔄 RALPH LOOP - Fix ISSUE_ID

## Tarea
[Contenido de la skill]

## Criterios de Completitud
- [ ] Build pasa sin errores
- [ ] Tests pasan
- [ ] Playwright E2E pasa (si aplica)
- [ ] La funcionalidad específica funciona correctamente

## Instrucciones
1. Verificar estado actual
2. Identificar siguiente paso pendiente
3. Implementar y verificar
4. Si TODO completo: `touch .claude/COMPLETE`
```

Activar:
```bash
touch .claude/ralph-active
```

### Paso 5: Verificaciones Automáticas

El ralph-hook.sh ejecutará:
1. `npm run build`
2. `npm run test`
3. `npx playwright test tests/e2e/<related>.spec.ts`

Si falla → reinyecta prompt → continúa iterando (max 30)
Si pasa → marca completo → sugiere merge

### Paso 6: Merge y Deploy

```bash
.claude/scripts/worktree-manager.sh merge <ISSUE_ID>
.claude/scripts/auto-deploy.sh
```

## Ejemplos

### Arreglar error de sección asignada
```
/osyris-fix-issue CRIT-001
```

Resultado esperado:
```
🔧 OSYRIS FIX ISSUE - CRIT-001

📋 Issue: Error "No tienes una sección asignada"
📁 Skill: fix-seccion-asignada.md
🌿 Rama: fix/CRIT-001
📂 Worktree: trees/CRIT-001/

🔄 Iniciando implementación...

📝 Archivos a modificar:
- api-osyris/src/controllers/educando.controller.js
- api-osyris/src/middleware/auth.middleware.js
- api-osyris/database/migrations/fix_scouter_sections.sql

💡 Causa raíz:
Usuarios Rodrigo, Asier, Noelia tienen seccion_id = NULL

🎯 Solución:
1. Migración SQL para asignar secciones
2. Constraint para prevenir futuros NULL
3. Mejorar mensaje de error en UI

⏳ Comenzando Ralph Loop...
```

### Arreglar issue de alta prioridad
```
/osyris-fix-issue HIGH-003
```

## Estados Posibles

### ✅ Issue Resuelto
```
✅ ISSUE HIGH-003 RESUELTO

📊 Resumen:
- Iteraciones Ralph: 3
- Tiempo total: 15 minutos
- Archivos modificados: 2
- Tests: 100% pasando

🚀 Próximo paso:
.claude/scripts/auto-deploy.sh
```

### ⚠️ Issue Requiere Intervención
```
⚠️ RALPH LOOP PAUSADO

Razón: Mismo error 3 veces consecutivas
Error: TypeScript TS2339 - Property 'x' does not exist

💡 Acción requerida:
Revisa el error y proporciona contexto adicional
```

### ❌ Issue No Encontrado
```
❌ No existe skill para: UNKNOWN-001

Skills disponibles:
- CRIT-001, CRIT-002, CRIT-003, CRIT-004
- HIGH-001 a HIGH-005
- MED-001 a MED-006
- LOW-001 a LOW-005
```

## Comandos Relacionados

- **/ralph-loop**: Iniciar/gestionar Ralph Loop
- **/osyris-deploy-now**: Deploy inmediato a producción
- **/coordinator-status**: Ver estado de worktrees

## Tips

### Resolver múltiples issues
```bash
# Crear worktrees en paralelo
.claude/scripts/worktree-manager.sh create CRIT-001 fix
.claude/scripts/worktree-manager.sh create CRIT-002 fix

# Ver estado de todos
.claude/scripts/worktree-manager.sh status
```

### Priorización recomendada
1. Resolver CRIT-001 primero (bloquea CRIT-004)
2. CRIT-002 y CRIT-003 pueden hacerse en paralelo
3. HIGH-* después de todos los CRIT-*

---

*Comando especializado para resolución sistemática de issues del test de usuario.*
