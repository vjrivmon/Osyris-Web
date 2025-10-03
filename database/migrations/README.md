# 🔄 Sistema de Migraciones Automáticas

## 📋 Descripción

Este sistema permite actualizar la base de datos de producción automáticamente cuando haces deploy con `/safe-deploy`.

## 🚀 Cómo Funciona

### Flujo Automático
```
1. Desarrollas en local con datos de producción (/sync-prod-db)
2. Modificas la estructura de BD (añadir columnas, tablas, etc.)
3. Creas archivo de migración en database/migrations/
4. Ejecutas /safe-deploy
5. GitHub Actions:
   ✅ Hace backup de BD producción
   ✅ Aplica tus migraciones automáticamente
   ✅ Reinicia servicios
   ✅ Verifica que todo funciona
```

## 📝 Crear Migraciones

### Opción 1: Archivo SQL (Recomendado para cambios simples)

Crear archivo: `database/migrations/YYYYMMDD_descripcion.sql`

```sql
-- Ejemplo: 20251003_add_telefono_to_usuarios.sql

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Añadir datos iniciales si es necesario
INSERT INTO configuracion (clave, valor) VALUES
  ('version', '1.1.0'),
  ('ultima_migracion', CURRENT_TIMESTAMP)
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;
```

### Opción 2: Script Node.js (Para lógica compleja)

Crear archivo: `database/migrations/YYYYMMDD_script.js`

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Tu lógica de migración
    await client.query(`
      ALTER TABLE documentos
      ADD COLUMN IF NOT EXISTS categoria VARCHAR(100)
    `);

    // Migrar datos existentes
    const result = await client.query('SELECT id FROM documentos WHERE categoria IS NULL');
    for (const row of result.rows) {
      await client.query(
        'UPDATE documentos SET categoria = $1 WHERE id = $2',
        ['general', row.id]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Migración completada');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
```

## 📂 Estructura de Archivos

```
database/migrations/
├── README.md                           # Esta guía
├── 20251003_initial_setup.sql          # Migración inicial
├── 20251004_add_telefono_usuarios.sql  # Añadir teléfono
├── 20251005_create_actividades.sql     # Nueva tabla
└── 20251006_update_permissions.js      # Script complejo
```

## ✅ Convenciones de Nomenclatura

### Formato de Nombres
```
YYYYMMDD_descripcion_corta.sql
YYYYMMDD_descripcion_corta.js
```

### Ejemplos Buenos ✅
- `20251003_add_telefono_to_usuarios.sql`
- `20251004_create_table_actividades.sql`
- `20251005_migrate_old_data.js`
- `20251006_add_indexes.sql`

### Ejemplos Malos ❌
- `migration.sql` (sin fecha)
- `new-feature.sql` (sin fecha, con guiones)
- `20251003.sql` (sin descripción)

## 🔄 Workflow Completo

### 1. Desarrollo Local
```bash
# Sincronizar BD de producción a local
/sync-prod-db

# Ahora tienes los datos reales para desarrollar
```

### 2. Modificar BD Local (Para Testing)
```bash
# Conectar a PostgreSQL local
docker exec -it osyris-postgres-local psql -U osyris_user -d osyris_db

# Hacer cambios (testing)
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);
\q
```

### 3. Crear Migración
```bash
# Crear archivo de migración
nano database/migrations/20251003_add_telefono.sql

# Contenido:
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
```

### 4. Deploy a Producción
```bash
# Verificar sistema local
/check-health

# Deploy automático (aplicará migraciones)
/safe-deploy
```

## 🛡️ Seguridad y Backups

### Backups Automáticos
Antes de cada deploy, GitHub Actions:
1. ✅ Hace backup completo de la BD
2. ✅ Guarda como `backup_db_YYYYMMDD_HHMMSS.sql.gz`
3. ✅ Mantiene últimos 10 backups

### Recuperación en Caso de Error
```bash
# SSH al servidor
ssh root@116.203.98.142

# Listar backups disponibles
ls -lh backup_db_*.sql.gz

# Restaurar backup
gunzip < backup_db_20251003_120000.sql.gz | docker exec -i osyris-db psql -U osyris_user -d osyris_db
```

## ⚠️ Buenas Prácticas

### ✅ SÍ Hacer
- Usar `IF NOT EXISTS` en CREATE TABLE
- Usar `IF NOT EXISTS` en ALTER TABLE ADD COLUMN
- Añadir `ON CONFLICT DO NOTHING` en INSERT
- Probar migración en local ANTES de deploy
- Usar transacciones en scripts JS
- Documentar cambios complejos

### ❌ NO Hacer
- DROP TABLE sin backup
- ALTER TABLE DELETE COLUMN sin confirmar
- Migraciones sin probar en local
- Cambiar tipos de datos destructivamente
- Migraciones sin rollback plan

## 🧪 Testing de Migraciones

### Probar Localmente Antes de Deploy
```bash
# 1. Sincronizar BD producción
/sync-prod-db

# 2. Aplicar migración en local
docker exec -i osyris-postgres-local psql -U osyris_user -d osyris_db < database/migrations/20251003_nueva.sql

# 3. Verificar que funciona
docker exec osyris-postgres-local psql -U osyris_user -d osyris_db -c "\d usuarios"

# 4. Si todo OK, hacer deploy
/safe-deploy
```

## 📊 Monitoreo de Migraciones

### Ver Migraciones Aplicadas en Producción
```bash
ssh root@116.203.98.142 "docker exec osyris-db psql -U osyris_user -d osyris_db -c 'SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 10;'"
```

### Crear Tabla de Control (Opcional)
```sql
-- database/migrations/20251003_create_migrations_table.sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (version, description)
VALUES ('20251003', 'Initial migration tracking')
ON CONFLICT (version) DO NOTHING;
```

## 🔍 Debugging

### Ver Logs de Deploy
```bash
# GitHub Actions
https://github.com/tu-usuario/osyris/actions

# SSH al servidor
ssh root@116.203.98.142
pm2 logs osyris-backend --lines 100
```

### Verificar Estado BD
```bash
ssh root@116.203.98.142 "docker exec osyris-db psql -U osyris_user -d osyris_db -c '\dt'"
```

## 📞 Soporte

Si una migración falla:
1. Revisar logs en GitHub Actions
2. Verificar backup existe
3. Restaurar si es necesario
4. Corregir migración
5. Reintentar deploy

---

**🎯 Recuerda:** Siempre sincroniza producción a local (`/sync-prod-db`), desarrolla, crea migración, y deploy con `/safe-deploy`. ¡El sistema se encarga del resto!
