#!/bin/bash
# ================================================================
# IAM Migration Script - Actualiza roles en todas las rutas
# Ejecutar desde la raíz del repo Osyris-Web:
#   bash /tmp/osyris-iam/migrate-routes.sh
# ================================================================

ROUTES_DIR="api-osyris/src/routes"

echo "🔐 IAM: Migrando roles en rutas del backend..."

# Lista de archivos de rutas que necesitan actualización de roles
# (excluyendo admin.routes.js y notificaciones-scouter.routes.js
#  que ya tienen versiones completas en /tmp/osyris-iam)
ROUTE_FILES=(
  "actividades.routes.js"
  "asistencia-actividad.routes.js"
  "confirmaciones.routes.js"
  "dashboard-comite.routes.js"
  "dashboard-scouter.routes.js"
  "documentos_familia.routes.js"
  "documentos-resubida.routes.js"
  "educandos.routes.js"
  "familia.routes.js"
  "familiares.routes.js"
  "galeria_privada.routes.js"
  "google-drive.routes.js"
  "inscripciones-campamento.routes.js"
  "mensajes.routes.js"
  "mensajes-scouter.routes.js"
  "notificaciones_familia.routes.js"
  "ronda.routes.js"
  "secciones.routes.js"
  "solicitudes-desbloqueo.routes.js"
  "upload.routes.js"
  "usuarios.routes.js"
)

for FILE in "${ROUTE_FILES[@]}"; do
  FILEPATH="${ROUTES_DIR}/${FILE}"
  if [ -f "$FILEPATH" ]; then
    # Reemplazo de roles: 'admin' → 'superadmin', 'scouter' → 'kraal', 'editor' → 'kraal', 'coordinador' → 'jefe_seccion'
    # Solo dentro de checkRole/requireRole arrays, no en strings SQL
    
    # admin → superadmin (en contexto de checkRole/requireRole)
    sed -i "s/checkRole(\['\(.*\)'admin'\(.*\)'\])/checkRole(['\1'superadmin'\2'])/g" "$FILEPATH" 2>/dev/null
    
    # Más preciso: reemplazo palabra por palabra en arrays de roles
    sed -i "s/'admin'/'superadmin'/g; s/'scouter'/'kraal'/g; s/'editor'/'kraal'/g; s/'coordinador'/'jefe_seccion'/g; s/'monitor'/'kraal'/g; s/'super_admin'/'superadmin'/g" "$FILEPATH"
    
    echo "  ✅ ${FILE}"
  else
    echo "  ⚠️ ${FILE} no encontrado"
  fi
done

# Ahora añadir checkPermiso en rutas de aprobación de documentos
echo ""
echo "🔐 IAM: Añadiendo checkPermiso en rutas de aprobación..."

# documentos_familia.routes.js - añadir import de checkPermiso y usarlo en aprobar/rechazar
DOCFAM="${ROUTES_DIR}/documentos_familia.routes.js"
if [ -f "$DOCFAM" ]; then
  # Actualizar import para incluir checkPermiso
  sed -i "s/const { verifyToken, checkRole } = require('..\/middleware\/auth.middleware');/const { verifyToken, checkRole, checkPermiso } = require('..\/middleware\/auth.middleware');/" "$DOCFAM"
  
  # Añadir checkPermiso en rutas de aprobar/rechazar documentos
  # PUT /:id/aprobar
  sed -i "s/router.put('\/:id\/aprobar', verifyToken, checkRole(\[.*\]), /router.put('\/:id\/aprobar', verifyToken, checkRole(['superadmin', 'kraal']), checkPermiso('aprobar_documentos'), /" "$DOCFAM"
  # PUT /:id/rechazar
  sed -i "s/router.put('\/:id\/rechazar', verifyToken, checkRole(\[.*\]), /router.put('\/:id\/rechazar', verifyToken, checkRole(['superadmin', 'kraal']), checkPermiso('aprobar_documentos'), /" "$DOCFAM"
  
  echo "  ✅ documentos_familia.routes.js (checkPermiso añadido)"
fi

# google-drive.routes.js - añadir checkPermiso en aprobar/rechazar
GDRIVE="${ROUTES_DIR}/google-drive.routes.js"
if [ -f "$GDRIVE" ]; then
  sed -i "s/const { verifyToken, requireRole } = require('..\/middleware\/auth.middleware');/const { verifyToken, requireRole, checkPermiso } = require('..\/middleware\/auth.middleware');/" "$GDRIVE"
  
  # aprobar documento
  sed -i "s/router.put('\/documento\/:documentoId\/aprobar', verifyToken, requireRole(\[.*\]), /router.put('\/documento\/:documentoId\/aprobar', verifyToken, requireRole(['kraal', 'superadmin']), checkPermiso('aprobar_documentos'), /" "$GDRIVE"
  # rechazar documento
  sed -i "s/router.put('\/documento\/:documentoId\/rechazar', verifyToken, requireRole(\[.*\]), /router.put('\/documento\/:documentoId\/rechazar', verifyToken, requireRole(['kraal', 'superadmin']), checkPermiso('aprobar_documentos'), /" "$GDRIVE"
  
  echo "  ✅ google-drive.routes.js (checkPermiso añadido)"
fi

# solicitudes-desbloqueo.routes.js - añadir checkPermiso en aprobar/rechazar
SOLIC="${ROUTES_DIR}/solicitudes-desbloqueo.routes.js"
if [ -f "$SOLIC" ]; then
  sed -i "s/const { verifyToken, requireRole } = require('..\/middleware\/auth.middleware');/const { verifyToken, requireRole, checkPermiso } = require('..\/middleware\/auth.middleware');/" "$SOLIC"
  
  # aprobar solicitud
  sed -i "s/router.put('\/:id\/aprobar', requireRole(\[.*\]), /router.put('\/:id\/aprobar', requireRole(['kraal', 'superadmin']), checkPermiso('aprobar_documentos'), /" "$SOLIC"
  # rechazar solicitud
  sed -i "s/router.put('\/:id\/rechazar', requireRole(\[.*\]), /router.put('\/:id\/rechazar', requireRole(['kraal', 'superadmin']), checkPermiso('aprobar_documentos'), /" "$SOLIC"
  
  echo "  ✅ solicitudes-desbloqueo.routes.js (checkPermiso añadido)"
fi

echo ""
echo "✅ IAM: Migración de rutas completada"
echo ""
echo "Archivos con versiones completas nuevas (copiar manualmente):"
echo "  /tmp/osyris-iam/api-osyris/src/config/db.config.js"
echo "  /tmp/osyris-iam/api-osyris/src/middleware/auth.middleware.js"
echo "  /tmp/osyris-iam/api-osyris/src/routes/admin.routes.js"
echo "  /tmp/osyris-iam/api-osyris/src/routes/notificaciones-scouter.routes.js"
echo "  /tmp/osyris-iam/api-osyris/src/routes/permisos.routes.js (NUEVO)"
echo "  /tmp/osyris-iam/api-osyris/src/index.js"
