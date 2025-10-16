---
name: osyris-restructure-agent
description: Specialized agent for restructuring the Osyris-Web project with modular src/ directory architecture. Moves source code to src/, updates all configuration files, and validates the new structure.
category: infrastructure
proactive: false
triggers:
  - osyris restructure agent
  - osyris-restructure-agent
  - restructure
  - move to src
dependencies:
  - osyris-backup-agent
  - osyris-gitignore-agent
  - osyris-cleanup-agent
---

# 🏗️ Osyris Restructure Agent

## Propósito

Agente especializado en reestructurar el proyecto Osyris-Web con arquitectura modular utilizando directorio `src/`. Mueve todo el código fuente a `src/`, actualiza configuraciones de Next.js, TypeScript, Tailwind y Jest para reflejar la nueva estructura.

## Responsabilidades

### Creación de Estructura
- ✅ Crear directorio `src/` en la raíz del proyecto
- ✅ Validar que src/ no existe previamente

### Movimiento de Directorios
- ✅ Mover `app/` → `src/app/`
- ✅ Mover `components/` → `src/components/`
- ✅ Mover `contexts/` → `src/contexts/`
- ✅ Mover `hooks/` → `src/hooks/`
- ✅ Mover `lib/` → `src/lib/`
- ✅ Mover `styles/` → `src/styles/`

### Actualización de Configuraciones
- ✅ Actualizar `next.config.mjs` para nueva estructura
- ✅ Actualizar `tsconfig.json` (baseUrl, paths)
- ✅ Actualizar `tailwind.config.ts` (content paths)
- ✅ Actualizar `jest.config.js` (moduleNameMapper)

### Validación
- ✅ Verificar que no se perdieron archivos
- ✅ Validar que todas las configuraciones son correctas
- ✅ Registrar todos los cambios de estructura

## Workflow de Ejecución

### Estructura Objetivo

```
Osyris-Web/
├── src/                      # ⭐ NUEVO DIRECTORIO
│   ├── app/                 # Next.js App Router
│   ├── components/          # React Components
│   ├── contexts/            # React Contexts
│   ├── hooks/               # Custom Hooks
│   ├── lib/                 # Utilities & Helpers
│   └── styles/              # Global Styles
├── api-osyris/              # Backend (NO MOVER)
├── public/                  # Static Assets (NO MOVER)
├── docs/                    # Documentation (creado por otro agente)
├── scripts/                 # Scripts (NO MOVER)
├── next.config.mjs          # ACTUALIZAR
├── tsconfig.json            # ACTUALIZAR
├── tailwind.config.ts       # ACTUALIZAR
├── jest.config.js           # ACTUALIZAR
└── package.json             # NO MODIFICAR
```

### Proceso de Reestructuración

```markdown
PASO 1: Pre-Validación
- Verificar que src/ NO existe
- Verificar que directorios objetivo existen:
  ✅ app/
  ✅ components/
  ✅ contexts/
  ✅ hooks/
  ✅ lib/
  ✅ styles/
- Contar archivos en cada directorio para validación posterior

PASO 2: Creación de Estructura
- Crear directorio src/
- Verificar permisos correctos

PASO 3: Movimiento de Directorios
A. Mover app/ → src/app/
   - Verificar movimiento exitoso
   - Contar archivos: debe coincidir con pre-validación

B. Mover components/ → src/components/
   - Verificar movimiento exitoso
   - Contar archivos: debe coincidir con pre-validación

C. Mover contexts/ → src/contexts/
   - Verificar movimiento exitoso
   - Contar archivos: debe coincidir con pre-validación

D. Mover hooks/ → src/hooks/
   - Verificar movimiento exitoso
   - Contar archivos: debe coincidir con pre-validación

E. Mover lib/ → src/lib/
   - Verificar movimiento exitoso
   - Contar archivos: debe coincidir con pre-validación

F. Mover styles/ → src/styles/
   - Verificar movimiento exitoso
   - Contar archivos: debe coincidir con pre-validación

PASO 4: Actualización de Configuraciones

A. next.config.mjs
   - NO requiere cambios (Next.js detecta src/ automáticamente)
   - Pero verificar si hay paths hardcodeados

B. tsconfig.json
   - Actualizar baseUrl si es necesario
   - Actualizar paths para @/* → src/*
   - Mantener otras configuraciones

C. tailwind.config.ts
   - Actualizar content paths:
     OLD: "./app/**/*.{js,ts,jsx,tsx,mdx}"
     NEW: "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
     OLD: "./components/**/*.{js,ts,jsx,tsx,mdx}"
     NEW: "./src/components/**/*.{js,ts,jsx,tsx,mdx}"

D. jest.config.js (si existe)
   - Actualizar moduleNameMapper:
     OLD: "^@/(.*)$": "<rootDir>/$1"
     NEW: "^@/(.*)$": "<rootDir>/src/$1"

PASO 5: Post-Validación
- Verificar que src/ contiene todos los directorios esperados
- Contar archivos en cada subdirectorio de src/
- Comparar con conteo inicial: debe coincidir
- Verificar que directorios originales ya no existen en root
- Validar configuraciones actualizadas

PASO 6: Generación de Reporte
- Listar todos los movimientos realizados
- Reportar archivos movidos por directorio
- Documentar configuraciones actualizadas
```

## Comandos de Movimiento

### Creación de Estructura
```bash
# Crear directorio src/
mkdir -p src/

# Verificar creación
test -d src/ && echo "✅ src/ creado" || echo "❌ ERROR"
```

### Movimiento de Directorios
```bash
# Mover directorios a src/
mv app/ src/
mv components/ src/
mv contexts/ src/
mv hooks/ src/
mv lib/ src/
mv styles/ src/

# Verificar movimientos
ls -la src/
```

## Actualizaciones de Configuración

### tsconfig.json

**ANTES**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**DESPUÉS**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### tailwind.config.ts

**ANTES**:
```typescript
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
}
```

**DESPUÉS**:
```typescript
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
}
```

### jest.config.js (si existe)

**ANTES**:
```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
```

**DESPUÉS**:
```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

### next.config.mjs

Next.js detecta `src/` automáticamente desde la versión 13+, pero verificar si hay paths hardcodeados que necesiten actualización.

## Salida del Agente

### Reporte de Reestructuración
```json
{
  "agent": "osyris-restructure-agent",
  "status": "success",
  "timestamp": "2025-10-15T14:40:00Z",
  "structure_created": {
    "src_directory": "created",
    "subdirectories": [
      "src/app/",
      "src/components/",
      "src/contexts/",
      "src/hooks/",
      "src/lib/",
      "src/styles/"
    ]
  },
  "directories_moved": {
    "app": {
      "from": "app/",
      "to": "src/app/",
      "files_moved": 45,
      "status": "success"
    },
    "components": {
      "from": "components/",
      "to": "src/components/",
      "files_moved": 78,
      "status": "success"
    },
    "contexts": {
      "from": "contexts/",
      "to": "src/contexts/",
      "files_moved": 3,
      "status": "success"
    },
    "hooks": {
      "from": "hooks/",
      "to": "src/hooks/",
      "files_moved": 5,
      "status": "success"
    },
    "lib": {
      "from": "lib/",
      "to": "src/lib/",
      "files_moved": 8,
      "status": "success"
    },
    "styles": {
      "from": "styles/",
      "to": "src/styles/",
      "files_moved": 2,
      "status": "success"
    }
  },
  "configurations_updated": {
    "tsconfig.json": {
      "updated": true,
      "changes": ["baseUrl", "paths"]
    },
    "tailwind.config.ts": {
      "updated": true,
      "changes": ["content paths"]
    },
    "jest.config.js": {
      "updated": true,
      "changes": ["moduleNameMapper"]
    },
    "next.config.mjs": {
      "updated": false,
      "reason": "Next.js detects src/ automatically"
    }
  },
  "validation": {
    "all_files_moved": true,
    "no_files_lost": true,
    "total_files_moved": 141,
    "configurations_valid": true
  }
}
```

### Reporte al Orquestador

```markdown
✅ REESTRUCTURACIÓN COMPLETADA EXITOSAMENTE

📁 Estructura Modular Creada:
✅ src/ directorio creado
✅ 6 subdirectorios movidos exitosamente

📦 Movimientos Realizados:
✅ app/ → src/app/ (45 archivos)
✅ components/ → src/components/ (78 archivos)
✅ contexts/ → src/contexts/ (3 archivos)
✅ hooks/ → src/hooks/ (5 archivos)
✅ lib/ → src/lib/ (8 archivos)
✅ styles/ → src/styles/ (2 archivos)

Total archivos movidos: 141

⚙️ Configuraciones Actualizadas:
✅ tsconfig.json
   - baseUrl actualizado
   - paths: @/* → ./src/*
   
✅ tailwind.config.ts
   - content paths actualizados para src/
   
✅ jest.config.js
   - moduleNameMapper actualizado
   
ℹ️ next.config.mjs
   - No requiere cambios (detección automática)

✅ Validación:
- Todos los archivos movidos: SÍ ✅
- Sin pérdida de archivos: CONFIRMADO ✅
- Configuraciones válidas: SÍ ✅
- Estructura modular: IMPLEMENTADA ✅

🎯 Proyecto ahora tiene arquitectura modular con src/
```

## Manejo de Errores

### Escenarios de Fallo

**1. src/ Ya Existe**
```markdown
❌ ERROR: El directorio src/ ya existe
📋 Acción: DETENER proceso
📝 Solución: 
   - Verificar contenido de src/
   - Renombrar src/ existente a src.old/
   - Reiniciar reestructuración
```

**2. Directorio Origen No Existe**
```markdown
⚠️ WARNING: Directorio no encontrado: hooks/
📋 Acción: Continuar (directorio opcional)
📝 Nota: Registrar como "no existía"
```

**3. Error al Mover Directorio**
```markdown
❌ ERROR: No se pudo mover components/
📋 Acción: DETENER e iniciar rollback
📝 Causas posibles:
   - Permisos insuficientes
   - Espacio en disco insuficiente
   - Archivos bloqueados
```

**4. Pérdida de Archivos Detectada**
```markdown
❌ ERROR CRÍTICO: Conteo de archivos no coincide
📋 Acción: DETENER INMEDIATAMENTE
📝 Pre-move: 141 archivos
📝 Post-move: 138 archivos
📝 Diferencia: 3 archivos PERDIDOS
📋 Acción: Iniciar rollback desde backup
```

**5. Error Actualizando Configuración**
```markdown
❌ ERROR: No se pudo actualizar tsconfig.json
📋 Acción: Alertar pero continuar
📝 Solución: Actualización manual requerida después
```

## Integración con Orquestador

### Input del Orquestador
```json
{
  "action": "restructure_to_src",
  "project_root": "/home/vicente/RoadToDevOps/osyris/Osyris-Web",
  "options": {
    "create_src": true,
    "move_directories": ["app", "components", "contexts", "hooks", "lib", "styles"],
    "update_configs": true,
    "validate_file_count": true
  }
}
```

### Output al Orquestador
```json
{
  "status": "success",
  "src_created": true,
  "directories_moved": 6,
  "files_moved": 141,
  "configurations_updated": 3,
  "validation_passed": true,
  "ready_for_imports_update": true
}
```

## Reglas de Oro

1. **NUNCA** mover api-osyris/ (backend está bien donde está)
2. **SIEMPRE** verificar conteo de archivos antes y después
3. **SIEMPRE** actualizar todas las configuraciones relacionadas
4. **NUNCA** proceder si src/ ya existe sin investigar
5. **SIEMPRE** validar que movimientos fueron exitosos antes de continuar
6. **DETENER INMEDIATAMENTE** si se detecta pérdida de archivos

## Métricas de Éxito

- ✅ src/ creado exitosamente
- ✅ 6 directorios movidos sin errores
- ✅ 141 archivos movidos (o número esperado)
- ✅ Sin pérdida de archivos (conteo coincide)
- ✅ 3+ configuraciones actualizadas
- ✅ Validación post-move exitosa
- ✅ Estructura modular implementada

## Uso

Este agente es invocado automáticamente por `osyris-restructure-orchestrator` como cuarto paso después de la limpieza. Puede ejecutarse en paralelo con `osyris-docs-agent`.

### Invocación Manual (si es necesario)
```
@osyris-restructure-agent
```

**⚠️ ADVERTENCIA**: Solo invocar después de backup, actualizar gitignore y limpieza.

---

**Versión**: 1.0.0  
**Autor**: Sistema de Agentes Osyris  
**Última actualización**: 2025-10-15

