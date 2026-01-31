const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'osyris_user',
  password: process.env.DB_PASSWORD || 'osyris_password',
  database: process.env.DB_NAME || 'osyris_db',
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    console.log(`📁 Base de datos: ${process.env.DB_NAME}`);
    client.release();
    return pool;
  } catch (err) {
    console.error('❌ Error al conectar con PostgreSQL:', err);
    throw err;
  }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    const sqlUpper = sql.trim().toUpperCase();

    // Para compatibilidad con SQLite, pero respetando RETURNING de PostgreSQL
    if (sqlUpper.startsWith('SELECT') || sqlUpper.includes('RETURNING')) {
      return result.rows;
    } else {
      return {
        insertId: result.rows[0]?.id || null,
        changes: result.rowCount,
        affectedRows: result.rowCount
      };
    }
  } catch (err) {
    console.error('Error en query:', err);
    throw err;
  }
}

// Función para obtener conexión
async function getConnection() {
  const client = await pool.connect();
  return {
    query: async (sql, params) => {
      try {
        const result = await client.query(sql, params);
        const sqlUpper = sql.trim().toUpperCase();
        if (sqlUpper.startsWith('SELECT') || sqlUpper.includes('RETURNING')) {
          return result.rows;
        } else {
          return {
            insertId: result.rows[0]?.id || null,
            changes: result.rowCount,
            affectedRows: result.rowCount
          };
        }
      } catch (err) {
        throw err;
      }
    },
    release: () => client.release()
  };
}

// Función para cerrar el pool
async function closeDatabase() {
  try {
    await pool.end();
    console.log('✅ Pool de PostgreSQL cerrado');
  } catch (err) {
    console.error('Error al cerrar pool:', err);
  }
}

// Funciones helper para usuarios (compatibilidad con auth.controller)
async function getUserByEmail(email) {
  const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result[0] || null;
}

async function getUserById(id) {
  const result = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return result[0] || null;
}

async function getUserByInvitationToken(token) {
  const result = await query('SELECT * FROM usuarios WHERE invitation_token = $1', [token]);
  return result[0] || null;
}

async function updateUser(id, updates) {
  const keys = Object.keys(updates);
  const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
  const values = [id, ...keys.map(key => updates[key])];
  
  const sql = `UPDATE usuarios SET ${setClause} WHERE id = $1 RETURNING *`;
  const result = await pool.query(sql, values);
  return result.rows[0] || null;
}

// Función helper para páginas estáticas
async function getAllPages(filters = {}) {
  let sql = 'SELECT * FROM paginas WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.visible !== undefined) {
    sql += ` AND visible = $${paramIndex}`;
    params.push(filters.visible);
    paramIndex++;
  }

  if (filters.seccion) {
    sql += ` AND seccion = $${paramIndex}`;
    params.push(filters.seccion);
    paramIndex++;
  }

  if (filters.categoria) {
    sql += ` AND categoria = $${paramIndex}`;
    params.push(filters.categoria);
    paramIndex++;
  }

  sql += ' ORDER BY orden ASC, id ASC';

  const result = await query(sql, params);
  return result;
}

// Funciones helper para roles de usuario (sistema multi-rol)
async function getUserRoles(usuarioId) {
  const result = await query(
    'SELECT rol, es_principal FROM usuario_roles WHERE usuario_id = $1 ORDER BY es_principal DESC',
    [usuarioId]
  );
  return result;
}

async function addUserRole(usuarioId, rol, esPrincipal = false) {
  const result = await query(
    'INSERT INTO usuario_roles (usuario_id, rol, es_principal) VALUES ($1, $2, $3) ON CONFLICT (usuario_id, rol) DO NOTHING RETURNING *',
    [usuarioId, rol, esPrincipal]
  );
  return result[0];
}

module.exports = {
  initializeDatabase,
  query,
  getConnection,
  closeDatabase,
  pool,
  getUserByEmail,
  getUserById,
  getUserByInvitationToken,
  updateUser,
  getAllPages,
  getUserRoles,
  addUserRole
};
