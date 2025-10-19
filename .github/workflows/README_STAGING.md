# ⚠️ Nota sobre Deploy a Staging

## Problema Actual

El workflow `deploy-to-staging.yml` tiene problemas con npm en el servidor:
- Tarballs corruptos durante descarga
- Caché de npm regenerándose corrupta
- Múltiples intentos fallidos (Run #1-4)

## ✅ Solución Recomendada

**Usar los scripts locales que funcionan correctamente:**

\`\`\`bash
# Deploy a staging desde tu máquina local:
./scripts/deploy-to-staging.sh

# O actualización rápida de archivos específicos:
./scripts/update-staging-files.sh src/app/page.tsx
\`\`\`

## 🚀 Workflow de Deploy Recomendado

### Para Staging (Testing):
\`\`\`bash
# 1. Hacer cambios en develop
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Deploy a staging con script local
./scripts/deploy-to-staging.sh

# 3. Verificar en staging
curl http://116.203.98.142:3001
\`\`\`

### Para Producción (cuando staging OK):
\`\`\`bash
# 1. Merge a main
git checkout main
git merge develop
git push origin main

# 2. GitHub Action automático despliega a producción
# → deploy-hetzner.yml se ejecuta automáticamente
\`\`\`

## 📊 Workflows Disponibles

| Workflow | Estado | Uso |
|----------|--------|-----|
| \`deploy-to-staging.yml\` | ⚠️ Deshabilitado (problemas npm) | NO usar |
| \`deploy-hetzner.yml\` | ✅ Funcional | main → producción |
| \`deploy-develop.yml\` | ✅ Funcional | develop → producción (directo) |

## 🛠️ Scripts Locales (Funcionan)

| Script | Función | Tiempo |
|--------|---------|--------|
| \`deploy-to-staging.sh\` | Deploy completo a staging | ~5 min |
| \`update-staging-files.sh\` | Actualización rápida | ~30s |
| \`start-staging-server.sh\` | Iniciar servicios | ~10s |
| \`deploy-to-production-from-staging.sh\` | Staging → Producción | ~3 min |

## 💡 Por Qué Usar Scripts Locales

1. ✅ **Funcionan** - Ya probados y estables
2. ✅ **Más rápidos** - Sin queue de GitHub Actions
3. ✅ **Más control** - Ves logs en tiempo real
4. ✅ **Sin límites** - No consumes minutos de GitHub Actions
5. ✅ **Debugging fácil** - Puedes SSH inmediatamente si falla

## 🔄 Flujo Híbrido (Mejor de Ambos Mundos)

\`\`\`
┌─────────────────┐
│  DESARROLLO     │
│  (local)        │
└────────┬────────┘
         │
         │ ./scripts/deploy-to-staging.sh
         ▼
┌─────────────────┐
│  STAGING        │
│  (manual)       │
│  116.203.98... │
└────────┬────────┘
         │
         │ Testing + Validación
         │ git push origin main
         ▼
┌─────────────────┐
│  PRODUCCIÓN     │
│  (GitHub Action)│
│  gruposcout...  │
└─────────────────┘
\`\`\`

## 🎯 Recomendación Final

**Mantener:**
- ✅ GitHub Actions para producción (main)
- ✅ Scripts locales para staging (develop)

**Resultado:**
- Staging: Rápido, confiable, sin colas
- Producción: Automatizado, auditable, con historial

---

*Nota: El problema de npm en el servidor puede ser investigado más adelante.
Por ahora, los scripts locales son la solución más pragmática.*
