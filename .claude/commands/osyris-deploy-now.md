# /osyris-deploy-now

Ejecuta un deploy completo a producción con todas las verificaciones previas. Ideal para usar después de completar un fix o feature.

## Uso

```
/osyris-deploy-now [--skip-tests] [--skip-e2e] [--dry-run]
```

## Opciones

- **--skip-tests**: Salta los tests unitarios (no recomendado)
- **--skip-e2e**: Salta Playwright E2E (útil si no hay tests E2E)
- **--dry-run**: Ejecuta todo excepto el push real

## Flujo de Ejecución

### Paso 1: Verificar Estado

```bash
# Verificar rama actual
BRANCH=$(git branch --show-current)

# Verificar que no hay cambios sin commit
git status --porcelain
```

Si hay cambios pendientes:
```
❌ Hay cambios sin commit
Ejecuta: git add . && git commit -m "mensaje"
```

### Paso 2: Build

```bash
npm run build
```

Si falla:
```
❌ Build falló
Ver errores arriba y corregir antes de desplegar
```

### Paso 3: Tests (si no --skip-tests)

```bash
npm run test
```

Si fallan algunos tests:
```
⚠️ Algunos tests fallaron
¿Continuar de todos modos? (y/N)
```

### Paso 4: Playwright E2E (si no --skip-e2e)

```bash
npx playwright test --reporter=dot
```

Si fallan:
```
❌ Playwright E2E falló
Ver: npx playwright show-report
```

### Paso 5: Merge a Main (si no estamos en main)

```bash
git checkout main
git pull origin main
git merge $BRANCH --no-ff -m "Merge $BRANCH into main"
```

### Paso 6: Push a GitHub

```bash
git push origin main
```

Esto dispara GitHub Actions automáticamente.

### Paso 7: Esperar GitHub Actions

Monitoriza el workflow:
```bash
gh run list --branch main --limit 1
```

Espera hasta `completed` (máximo 10 minutos).

### Paso 8: Verificar Producción

```bash
# Página principal
curl -s -o /dev/null -w "%{http_code}" https://gruposcoutosyris.es

# API health
curl -s -o /dev/null -w "%{http_code}" https://gruposcoutosyris.es/api/health
```

## Ejemplo de Ejecución

```
/osyris-deploy-now
```

Salida:
```
═══════════════════════════════════════════════════════════
            OSYRIS WEB - AUTO DEPLOY A PRODUCCIÓN
═══════════════════════════════════════════════════════════

ℹ️  Rama actual: fix/CRIT-001
ℹ️  En rama de feature - se hará merge a main primero

ℹ️  Paso 1/6: Ejecutando build...
   ▶ Building...
   ✓ Compiled successfully
✅ Build exitoso

ℹ️  Paso 2/6: Ejecutando tests...
   Test Suites: 15 passed, 15 total
   Tests: 47 passed, 47 total
✅ Tests pasaron

ℹ️  Paso 3/6: Ejecutando Playwright E2E...
   Running 12 tests using 4 workers
   12 passed (45.2s)
✅ Playwright E2E pasó

ℹ️  Paso 4/6: Merge a main...
   Merge made by the 'ort' strategy.
✅ Merge completado

ℹ️  Paso 5/6: Push a GitHub...
   To github.com:user/Osyris-Web.git
   abc1234..def5678  main -> main
✅ Push completado - GitHub Actions iniciará el deploy

ℹ️  Paso 6/6: Esperando GitHub Actions...
   ⏳ Esperando... (1/40) Estado: in_progress
   ⏳ Esperando... (2/40) Estado: in_progress
   ⏳ Esperando... (3/40) Estado: completed
✅ GitHub Actions completado exitosamente!

ℹ️  Verificando producción...
✅ Página principal responde: HTTP 200
✅ API health responde: HTTP 200

═══════════════════════════════════════════════════════════
              🚀 DEPLOY COMPLETADO EXITOSAMENTE
═══════════════════════════════════════════════════════════

📍 Producción: https://gruposcoutosyris.es
📍 API: https://gruposcoutosyris.es/api/health

🔍 Verifica manualmente:
   - Login funciona correctamente
   - Las funcionalidades críticas operan
   - No hay errores en consola del navegador

ℹ️  Log guardado: .claude/logs/deploy-20260122-163500.md
```

## Estados Posibles

### ✅ Deploy Exitoso
```
🚀 DEPLOY COMPLETADO EXITOSAMENTE

📍 Producción: https://gruposcoutosyris.es
📊 Verificación: HTTP 200 OK
```

### ⚠️ Deploy con Advertencias
```
⚠️ DEPLOY COMPLETADO CON ADVERTENCIAS

- Build: ✅
- Tests: ⚠️ (3 skipped)
- E2E: ✅
- Producción: ✅

Revisar tests skipped antes del próximo deploy
```

### ❌ Deploy Fallido
```
❌ DEPLOY FALLIDO

Fase que falló: GitHub Actions
Razón: Build failed on server

Ver logs: gh run view 123456789 --log
Rollback: ./scripts/emergency-rollback.sh
```

## Integración con Ralph Loop

Si vienes de un Ralph Loop exitoso:

```
.claude/RALPH_SUCCESS existe → Deploy recomendado
```

El deploy automático limpiará los archivos de Ralph:
- `.claude/RALPH_SUCCESS`
- `.claude/ralph-active`
- `.claude/PROMPT.md`

## Rollback de Emergencia

Si algo sale mal en producción:

```bash
./scripts/emergency-rollback.sh
```

Esto:
1. Revierte al commit anterior en el servidor
2. Reinicia los servicios PM2
3. Verifica que la versión anterior funciona

## Logs y Evidencia

Cada deploy genera:
- `.claude/logs/deploy-YYYYMMDD-HHMMSS.md` - Log completo
- Referencia al run de GitHub Actions
- Códigos HTTP de verificación

## Comandos Relacionados

- **/osyris-fix-issue**: Arreglar issue específico
- **/ralph-loop**: Verificación iterativa
- **/coordinator-status**: Estado del sistema

## Tips

### Deploy rápido tras fix simple
```
/osyris-deploy-now --skip-e2e
```

### Verificar sin desplegar
```
/osyris-deploy-now --dry-run
```

### Forzar deploy (usar con precaución)
```
/osyris-deploy-now --skip-tests --skip-e2e
```

---

*Comando de deploy automatizado con verificación completa.*
