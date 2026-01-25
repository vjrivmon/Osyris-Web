# /verificar-ortografia

Ejecuta una verificación exhaustiva de ortografía en castellano en toda la web de Osyris, detectando y corrigiendo errores de acentuación, uso incorrecto de "ñ", y otros errores ortográficos comunes.

## Uso

```
/verificar-ortografia [opciones]
```

## Opciones

- `--completo` (por defecto): Verifica todos los 264 archivos con texto visible
- `--archivo <ruta>`: Verifica solo un archivo específico
- `--fase <1-4>`: Verifica solo una fase (1=páginas, 2=componentes, 3=hooks, 4=backend)
- `--solo-reporte`: Genera reporte sin aplicar correcciones
- `--corregir`: Aplica correcciones automáticamente

## Ejemplos

### Verificación Completa
```
/verificar-ortografia
```
Escanea los 264 archivos y genera un reporte detallado.

### Solo Reporte
```
/verificar-ortografia --solo-reporte
```
Genera el reporte sin hacer cambios.

### Archivo Específico
```
/verificar-ortografia --archivo src/app/page.tsx
```

### Por Fases
```
/verificar-ortografia --fase 1
```
Solo verifica las 58 páginas principales.

## Errores que Detecta

### 1. Uso Incorrecto de "ñ" (Severidad: CRÍTICA)
- `ny` en lugar de `ñ`: "nino" → "niño", "espana" → "España"
- `nn` en lugar de `ñ`: "anno" → "año"

### 2. Acentos Faltantes (Severidad: ALTA)
Palabras que SIEMPRE llevan tilde en castellano:
- -ción: sección, información, notificación, confirmación
- -sión: sesión, reunión
- Esdrújulas: número, teléfono, código, método, próximo, último
- Interrogativos: qué, cómo, dónde, cuándo, quién, cuál

### 3. Acentos Diacríticos (Severidad: MEDIA)
- más/mas, sí/si, tú/tu, él/el, mí/mi, sé/se, té/te, dé/de

### 4. Errores Comunes (Severidad: BAJA)
- Mayúsculas después de punto
- Concordancia de género/número
- Signos de puntuación

## Fases de Ejecución

### Fase 1: Páginas (58 archivos)
```
src/app/page.tsx               # Inicio
src/app/layout.tsx             # Layout global
src/app/login/page.tsx         # Login
src/app/registro/page.tsx      # Registro
src/app/secciones/**/*.tsx     # Secciones scout
src/app/familia/**/*.tsx       # Portal familia
src/app/aula-virtual/**/*.tsx  # Aula virtual
src/app/admin/**/*.tsx         # Panel admin
```

### Fase 2: Componentes (133 archivos)
```
src/components/main-nav.tsx        # Navegación
src/components/site-footer.tsx     # Footer
src/components/admin/**/*.tsx      # Componentes admin
src/components/familia/**/*.tsx    # Componentes familia
src/components/aula-virtual/**/*.tsx # Componentes aula
src/components/ui/**/*.tsx         # UI con texto
```

### Fase 3: Hooks y Utils (26 archivos)
```
src/hooks/*.ts                     # Custom hooks
src/contexts/*.tsx                 # Contextos
src/lib/*.ts                       # Utilidades
```

### Fase 4: Backend (mensajes de error)
```
api-osyris/src/controllers/**/*.js # Controladores
api-osyris/src/routes/**/*.js      # Rutas
```

## Proceso de Verificación

```
📋 INICIO DE VERIFICACIÓN ORTOGRÁFICA
════════════════════════════════════════

[1/4] Escaneando páginas...
      ├─ src/app/page.tsx ✓
      ├─ src/app/login/page.tsx ✓
      └─ ... (58 archivos)

[2/4] Escaneando componentes...
      ├─ src/components/main-nav.tsx ✓
      ├─ src/components/site-footer.tsx ⚠️ 2 errores
      └─ ... (133 archivos)

[3/4] Escaneando hooks y utils...
      └─ ... (26 archivos)

[4/4] Escaneando backend...
      └─ ... (47 archivos)

════════════════════════════════════════
📊 REPORTE FINAL
════════════════════════════════════════

Total archivos: 264
Con errores: 12
Sin errores: 252

❌ ERRORES ENCONTRADOS: 23

CRÍTICOS (ñ):
  └─ 0 errores

ALTOS (acentos obligatorios):
  └─ 18 errores

MEDIOS (acentos diacríticos):
  └─ 3 errores

BAJOS (otros):
  └─ 2 errores

════════════════════════════════════════
📝 DETALLE DE ERRORES
════════════════════════════════════════

[src/components/site-footer.tsx]
L45: "seccion" → "sección" (acento faltante)
L67: "informacion" → "información" (acento faltante)

[src/app/familia/dashboard/page.tsx]
L23: "proximo" → "próximo" (acento faltante)
...
```

## Correcciones Automáticas

Cuando se usa `--corregir`:
1. Lee cada archivo con errores
2. Aplica correcciones preservando formato
3. Verifica que el código sigue siendo válido
4. Genera log de cambios

```
🔧 APLICANDO CORRECCIONES
════════════════════════════════════════

[1/12] src/components/site-footer.tsx
       ├─ L45: "seccion" → "sección" ✓
       └─ L67: "informacion" → "información" ✓

[2/12] src/app/familia/dashboard/page.tsx
       └─ L23: "proximo" → "próximo" ✓

...

════════════════════════════════════════
✅ CORRECCIONES COMPLETADAS
════════════════════════════════════════

Archivos modificados: 12
Correcciones aplicadas: 23
Errores pendientes: 0

Ejecutando validación post-corrección...
├─ npm run lint ✓
├─ npm run build ✓
└─ TypeScript ✓

🎉 Todas las correcciones aplicadas exitosamente.
```

## Archivos Generados

- `.claude/reports/ortografia-YYYYMMDD-HHMMSS.json` - Reporte JSON completo
- `.claude/reports/ortografia-YYYYMMDD-HHMMSS.md` - Reporte legible

## Integración con Workflow

Este comando se puede integrar con el workflow de desarrollo:

```
/osyris-workflow-start "mejora-X" "descripción"
# Al finalizar:
/verificar-ortografia
# Antes de commit
```

## Tips

### Buenas Prácticas
- Ejecutar antes de cada commit importante
- Incluir en el checklist de PR
- Usar `--solo-reporte` primero para revisar

### Exclusiones Automáticas
El sistema ignora automáticamente:
- Código JavaScript/TypeScript (variables, funciones)
- Imports y exports
- URLs y paths
- Clases CSS
- Atributos HTML técnicos
- Términos en inglés técnico (scouter, kraal, etc.)

### Falsos Positivos
Si encuentras falsos positivos, añádelos a:
`.claude/config/ortografia-excepciones.json`

```json
{
  "excepciones": [
    "scouter",
    "kraal",
    "Waingunga",
    "Brownsea"
  ]
}
```

## Prerrequisitos

- Proyecto Next.js configurado
- Acceso de lectura/escritura a src/
- Node.js instalado (para validación)

## Comando Relacionados

- `/verificar-ortografia` - Este comando
- `/osyris-workflow-start` - Workflow completo de desarrollo
- `/coordinator-status` - Estado del workflow

---

*Garantiza la calidad profesional del texto en toda la web Osyris.*
