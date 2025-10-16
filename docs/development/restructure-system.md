# 🎭 Sistema de Reestructuración Osyris

## Descripción

Sistema de agentes especializados para reestructurar proyectos con precisión quirúrgica. Diseñado específicamente para migrar Osyris-Web a una arquitectura modular con directorio `src/`, consolidar documentación y eliminar archivos innecesarios.

## Componentes

### Agentes Especializados

El sistema está compuesto por **8 agentes especializados** + **1 orquestador maestro**:

1. **osyris-backup-agent** - Crea backup completo y rama de trabajo segura
2. **osyris-gitignore-agent** - Actualiza .gitignore con reglas completas
3. **osyris-cleanup-agent** - Elimina archivos duplicados y data innecesaria
4. **osyris-restructure-agent** - Mueve código fuente a `src/`
5. **osyris-docs-agent** - Consolida documentación en `docs/`
6. **osyris-imports-agent** - Actualiza todos los imports a nueva estructura
7. **osyris-testing-agent** - Valida build, tests y calidad
8. **osyris-deploy-agent** - Prepara commit estructurado final
9. **osyris-restructure-orchestrator** - Coordina todo el sistema

### Arquitectura de Ejecución

```
Usuario ejecuta: @osyris-restructure-orchestrator
    ↓
FASE 1: Preparación (Secuencial)
    backup → gitignore → cleanup
    
FASE 2: Reestructuración (Paralelo)
    restructure + docs
    
FASE 3: Actualización y Validación (Secuencial)
    imports → testing
    
FASE 4: Commit (Con Aprobación del Usuario)
    Resumen → Aprobación → commit
```

## Uso

### Invocación

```bash
@osyris-restructure-orchestrator
```

El orquestador te preguntará confirmación y luego ejecutará toda la reestructuración automáticamente.

### Flujo Completo

1. **Pre-validación**
   - Verifica que git working directory está limpio
   - Confirma que estás en la rama correcta
   - Valida que node_modules existe

2. **Ejecución**
   - Fase 1: Preparación (~16 segundos)
   - Fase 2: Reestructuración (~12 segundos en paralelo)
   - Fase 3: Validación (~80 segundos con build)
   - Total: ~2 minutos

3. **Presentación de Resultados**
   - Resumen ejecutivo completo
   - Métricas detalladas
   - Score de calidad
   - Estructura antes/después

4. **Aprobación**
   - Se te pedirá aprobación explícita
   - Escribe "APROBAR" para continuar
   - Escribe "CANCELAR" para abortar

5. **Commit**
   - Se crea el commit estructurado
   - **NO se hace push automático** (lo haces tú)
   - Recibes instrucciones de next steps

## Mejoras Conseguidas

### Después de ejecutar el sistema:

✅ **Arquitectura Modular**
- Todo el código en `src/`
- Estructura organizada por tipo

✅ **Documentación Organizada**
- `docs/deployment/` - Guías de despliegue
- `docs/development/` - Guías de desarrollo
- `docs/archive/` - Documentos históricos

✅ **Repositorio Limpio**
- Sin archivos HTML duplicados
- Sin data en git (logs, uploads, backups)
- .gitignore completo
- Reducción de tamaño > 10MB

✅ **Código Actualizado**
- Todos los imports actualizados
- Configuraciones ajustadas
- Build exitoso
- Tests pasando

## Métricas de Éxito

El sistema reportará métricas como:

- **Archivos movidos**: ~141
- **Archivos eliminados**: ~87
- **Imports actualizados**: ~523
- **Docs organizados**: ~11
- **Reducción de tamaño**: ~10.2MB (22.6%)
- **Score de calidad**: 98/100

## Seguridad

### Rollback Disponible

Si algo sale mal en cualquier momento:

1. **Automático**: El sistema detecta errores y se detiene
2. **Manual**: Puedes rollback en cualquier momento:
   ```bash
   git checkout main
   git branch -D feat/project-restructure-YYYY-MM-DD
   ```

### Backup Completo

Antes de cualquier cambio:
- Se crea backup del estado actual
- Se guarda en `.restructure-state.json`
- Se crea rama de trabajo dedicada
- Se registra commit hash original

## Estructura Resultante

### Antes
```
Osyris-Web/
├── app/
├── components/
├── contexts/
├── hooks/
├── lib/
├── styles/
├── 404/
├── calendario/
├── contacto/
├── logs/
├── uploads/
├── backups/
└── *.md (12 archivos)
```

### Después
```
Osyris-Web/
├── src/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   └── styles/
├── docs/
│   ├── deployment/
│   ├── development/
│   └── archive/
├── api-osyris/
├── public/
├── CLAUDE.md
└── README.md
```

## Configuraciones Actualizadas

El sistema actualiza automáticamente:

### tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### tailwind.config.ts
```typescript
{
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ]
}
```

### jest.config.js
```javascript
{
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  }
}
```

## Troubleshooting

### "Working directory not clean"
```bash
# Ver cambios pendientes
git status

# Commitear o descartar
git add . && git commit -m "temp"
# o
git reset --hard
```

### "Build failed"
- El sistema se detendrá automáticamente
- Revisa los logs del error
- Puedes hacer rollback y reintentar

### "Imports not updating"
- Verifica que estás usando alias `@/` en tus imports
- Imports relativos no se modifican (funcionan igual)

## Comandos Post-Reestructuración

Después del commit, ejecuta:

```bash
# 1. Revisar cambios
git show HEAD

# 2. Push a remoto
git push origin feat/project-restructure-YYYY-MM-DD

# 3. Crear Pull Request en GitHub

# 4. Mergear a main

# 5. Deploy se activará automáticamente
```

## Notas Importantes

### ⚠️ Antes de Ejecutar

1. **Commitea cambios pendientes** o guarda tu trabajo
2. **Asegúrate de estar en main/master**
3. **Verifica que tienes backup** (el sistema lo hace, pero por si acaso)

### ✅ Después de Ejecutar

1. **NO hagas push automáticamente** - Revisa primero
2. **Verifica que build funciona**: `npm run build`
3. **Verifica que dev funciona**: `npm run dev`
4. **Revisa el commit message** - es muy detallado

## Información Técnica

### Agentes por Categoría

- **Infrastructure**: 5 agentes (backup, gitignore, cleanup, restructure, orchestrator)
- **Universal**: 2 agentes (docs, imports)
- **Testing**: 1 agente (testing)
- **Total**: 8 agentes + 1 orquestador

### Dependencias entre Agentes

- **backup-agent**: No tiene dependencias (se ejecuta primero)
- **gitignore-agent**: Depende de backup-agent
- **cleanup-agent**: Depende de backup-agent, gitignore-agent
- **restructure-agent**: Depende de backup-agent, gitignore-agent, cleanup-agent
- **docs-agent**: Depende de backup-agent, gitignore-agent, cleanup-agent (paralelo con restructure)
- **imports-agent**: Depende de backup-agent, restructure-agent, docs-agent
- **testing-agent**: Depende de backup-agent, restructure-agent, docs-agent, imports-agent
- **deploy-agent**: Depende de testing-agent

### Tiempos Estimados

- Backup: ~5s
- Gitignore: ~3s
- Cleanup: ~8s
- Restructure: ~12s (paralelo)
- Docs: ~10s (paralelo)
- Imports: ~15s
- Testing: ~65s (incluye build)
- **Total: ~2 minutos**

## Soporte

Si encuentras problemas:

1. Revisa este documento
2. Consulta `CLAUDE.md` para contexto del proyecto
3. Revisa los logs de cada agente
4. Haz rollback si es necesario
5. Contacta al equipo si persiste

---

**Versión**: 1.0.0  
**Autor**: Sistema de Agentes Osyris  
**Última actualización**: 2025-10-15

