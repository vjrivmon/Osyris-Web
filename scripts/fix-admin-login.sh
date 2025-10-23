#!/bin/bash

# 🔧 SCRIPT PARA ARREGLAR LOGIN DE ADMIN
# Genera hash bcrypt correcto y actualiza contraseña

SERVER_USER="root"
SERVER_IP="116.203.98.142"

echo "🔧 Arreglando login de admin..."

# Conectarse al servidor y generar hash usando el backend ya instalado
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/osyris/current/api-osyris

# Crear script temporal para generar hash
cat > generate_hash.js << 'SCRIPT'
const bcrypt = require('bcrypt');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
SCRIPT

# Generar el hash
NEW_HASH=$(node generate_hash.js)
echo "Hash generado: $NEW_HASH"

# Actualizar la contraseña en la base de datos
docker exec osyris-db psql -U osyris_user -d osyris_db -c "UPDATE usuarios SET contraseña = '$NEW_HASH' WHERE email = 'admin@grupoosyris.es';"

# Limpiar script temporal
rm generate_hash.js

echo "✅ Contraseña de admin actualizada"
EOF

echo "🎯 Login de admin arreglado. Ahora puedes usar:"
echo "   Email: admin@grupoosyris.es"
echo "   Password: admin123"