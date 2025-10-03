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
    
    // Para compatibilidad con SQLite
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
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
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
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

module.exports = {
  initializeDatabase,
  query,
  getConnection,
  closeDatabase,
  pool,
  getUserByEmail,
  getUserById
};
