#!/bin/bash
# ================================================================
# IAM Track 1 - Script de aplicación
# Ejecutar desde la raíz del repo Osyris-Web:
#   sudo bash /tmp/osyris-iam/apply.sh
# ================================================================

REPO="/root/.openclaw/workspace/Osyris-Web"
IAM="/tmp/osyris-iam"

echo "🔐 IAM Track 1: Aplicando cambios..."
echo ""

# 1. Backend: Copiar archivos con versiones completas
echo "📁 Copiando archivos backend..."
cp "$IAM/api-osyris/src/config/db.config.js" "$REPO/api-osyris/src/config/db.config.js"
cp "$IAM/api-osyris/src/middleware/auth.middleware.js" "$REPO/api-osyris/src/middleware/auth.middleware.js"
cp "$IAM/api-osyris/src/routes/admin.routes.js" "$REPO/api-osyris/src/routes/admin.routes.js"
cp "$IAM/api-osyris/src/routes/notificaciones-scouter.routes.js" "$REPO/api-osyris/src/routes/notificaciones-scouter.routes.js"
cp "$IAM/api-osyris/src/routes/permisos.routes.js" "$REPO/api-osyris/src/routes/permisos.routes.js"
cp "$IAM/api-osyris/src/index.js" "$REPO/api-osyris/src/index.js"
echo "  ✅ Backend files copiados"

# 2. Ejecutar migración de roles en archivos restantes
echo ""
echo "📁 Migrando roles en archivos de rutas restantes..."
cd "$REPO"
bash "$IAM/migrate-routes.sh"

# 3. Frontend: Copiar archivos
echo ""
echo "📁 Copiando archivos frontend..."
cp "$IAM/src/contexts/AuthContext.tsx" "$REPO/src/contexts/AuthContext.tsx"
cp "$IAM/src/components/auth/protected-route.tsx" "$REPO/src/components/auth/protected-route.tsx"
cp "$IAM/src/app/admin/layout.tsx" "$REPO/src/app/admin/layout.tsx"
mkdir -p "$REPO/src/app/admin/roles"
cp "$IAM/src/app/admin/roles/page.tsx" "$REPO/src/app/admin/roles/page.tsx"
echo "  ✅ Frontend files copiados"

echo ""
echo "======================================"
echo "✅ IAM Track 1 aplicado correctamente"
echo "======================================"
echo ""
echo "Resumen de cambios:"
echo "  Backend:"
echo "    - db.config.js: migración idempotente roles + tabla permisos_usuario"
echo "    - auth.middleware.js: checkPermiso() + superadmin bypass"
echo "    - admin.routes.js: métricas solo superadmin"
echo "    - permisos.routes.js: CRUD permisos (NUEVO)"
echo "    - index.js: ruta /api/permisos registrada"
echo "    - Todas las rutas: admin→superadmin, scouter→kraal, coordinador→jefe_seccion"
echo "    - Rutas aprobación docs: checkPermiso('aprobar_documentos')"
echo "  Frontend:"
echo "    - AuthContext.tsx: nuevos roles en tipo User"
echo "    - protected-route.tsx: allowedRoles[] + superadmin bypass"
echo "    - admin/layout.tsx: superadmin, kraal, jefe_seccion"
echo "    - admin/roles/page.tsx: panel de gestión permisos (NUEVO)"
