# Scripts de Inicialización - Osyris Scout Management

Este directorio contiene scripts para inicializar y gestionar la base de datos SQLite del proyecto Osyris Scout Management.

## 📁 Archivos incluidos

### 🚀 Scripts principales

1. **`init-database.js`** - Script principal de inicialización completa
2. **`init-admin-user.js`** - Inicialización específica del usuario administrador
3. **`password-utils.js`** - Utilidades para el manejo de contraseñas
4. **`reset-admin-password.js`** - Restablecimiento de contraseña del administrador

### 📖 Documentación

5. **`README.md`** - Este archivo de documentación

## 🎯 Uso rápido

### Inicialización completa (recomendado)
```bash
cd api-osyris
node scripts/init-database.js
```

### Solo crear usuario administrador
```bash
cd api-osyris
node scripts/init-admin-user.js
```

### Restablecer contraseña de administrador
```bash
cd api-osyris
node scripts/reset-admin-password.js [nueva_contraseña]
```

## 📋 Detalles de cada script

### 1. init-database.js

**Propósito**: Inicialización completa de la base de datos

**Lo que hace**:
- ✅ Crea el directorio de base de datos si no existe
- ✅ Inicializa la estructura de tablas SQLite
- ✅ Inserta datos básicos (secciones scout)
- ✅ Crea el usuario administrador inicial
- ✅ Proporciona verificación y feedback detallado

**Opciones**:
```bash
node scripts/init-database.js              # Inicialización normal
node scripts/init-database.js --check      # Solo verificar estado
node scripts/init-database.js --force      # Forzar reinicialización
node scripts/init-database.js --help       # Mostrar ayuda
```

**Credenciales creadas**:
- 📧 Email: `admin@osyris.com`
- 🔒 Contraseña: `admin123`
- 👤 Rol: `comite`

### 2. init-admin-user.js

**Propósito**: Crear específicamente el usuario administrador

**Lo que hace**:
- 🔐 Encripta la contraseña con bcryptjs (12 rounds)
- 👤 Crea el usuario admin si no existe
- ✅ Verifica la creación exitosa
- ⚠️ Evita duplicados (no sobrescribe usuarios existentes)

**Uso**:
```bash
node scripts/init-admin-user.js
```

### 3. password-utils.js

**Propósito**: Utilidades para el manejo de contraseñas

**Funciones disponibles**:
- 🔐 Encriptar contraseñas
- 🔍 Verificar contraseñas
- 🎲 Generar contraseñas aleatorias
- ℹ️ Información sobre hashes

**Uso como CLI**:
```bash
# Encriptar una contraseña
node scripts/password-utils.js hash mi_contraseña

# Verificar una contraseña
node scripts/password-utils.js verify mi_contraseña hash_bcrypt

# Generar contraseña aleatoria
node scripts/password-utils.js generate 16

# Información sobre un hash
node scripts/password-utils.js info hash_bcrypt
```

**Uso como módulo**:
```javascript
const { hashPassword, verifyPassword } = require('./scripts/password-utils');

const hash = await hashPassword('mi_contraseña');
const isValid = await verifyPassword('mi_contraseña', hash);
```

### 4. reset-admin-password.js

**Propósito**: Restablecer la contraseña del usuario administrador

**Lo que hace**:
- 🔍 Verifica que el usuario admin existe
- 🔐 Encripta la nueva contraseña
- 💾 Actualiza la contraseña en la base de datos
- ✅ Confirma el cambio exitoso

**Uso**:
```bash
# Restablecer a la contraseña por defecto (admin123)
node scripts/reset-admin-password.js

# Restablecer a una contraseña específica
node scripts/reset-admin-password.js mi_nueva_contraseña_123
```

## 🔧 Configuración técnica

### Ubicación de la base de datos
```
/home/vicente/RoadToDevOps/osyris/Osyris-Web/database/osyris.db
```

### Estructura de usuario administrador
```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol TEXT CHECK(rol IN ('comite', 'kraal', 'familia', 'educando')) NOT NULL,
  seccion_id INTEGER,
  fecha_nacimiento DATE,
  telefono VARCHAR(20),
  direccion TEXT,
  activo BOOLEAN DEFAULT 1,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME
);
```

### Configuración de bcrypt
- **Algoritmo**: bcrypt
- **Salt rounds**: 12 (alta seguridad)
- **Formato**: `$2b$12$...`

## 🔒 Seguridad

### Buenas prácticas implementadas
- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ Validación de entrada en todos los scripts
- ✅ Manejo de errores robusto
- ✅ No exposición de credenciales en logs (excepto en inicialización)
- ✅ Verificación de usuarios existentes antes de crear

### Recomendaciones de seguridad
- 🔄 **Cambiar la contraseña por defecto** después del primer login
- 🚫 **No usar las credenciales por defecto en producción**
- 🔐 **Usar contraseñas complejas** en entornos de producción
- 📝 **Revisar los logs** de autenticación regularmente

## 🧪 Testing

### Endpoint de verificación
El sistema incluye un endpoint para verificar la autenticación:

```
GET /api/auth/verify
Authorization: Bearer <token>
```

### Respuesta exitosa:
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "usuario": {
      "id": 1,
      "email": "admin@osyris.com",
      "nombre": "Administrador",
      "apellidos": "Sistema",
      "rol": "comite",
      "activo": true
    },
    "tokenInfo": {
      "issuedAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-02T00:00:00.000Z",
      "timeToExpire": 86400
    }
  }
}
```

## 🐛 Resolución de problemas

### Error: Base de datos no encontrada
```bash
# Verificar que el directorio existe
ls -la /home/vicente/RoadToDevOps/osyris/Osyris-Web/database/

# Reinicializar si es necesario
node scripts/init-database.js --force
```

### Error: Usuario ya existe
```bash
# Si necesitas restablecer el usuario admin
node scripts/reset-admin-password.js
```

### Error: Tablas no existen
```bash
# Reinicializar la base de datos completa
node scripts/init-database.js --force
```

### Error: Permisos de archivo
```bash
# Asegurar permisos de ejecución
chmod +x scripts/*.js

# Verificar permisos de directorio
ls -la database/
```

## 📞 Soporte

Si encuentras problemas con estos scripts, verifica:

1. **Node.js** está instalado (versión recomendada: 18+)
2. **Dependencias** están instaladas (`npm install`)
3. **Permisos** de escritura en el directorio `database/`
4. **SQLite3** está disponible como dependencia de Node.js

## 🔄 Versionado

- **v1.0**: Implementación inicial con funcionalidad completa
- Fecha: 2024-09-28
- Autor: Claude Code AI Assistant