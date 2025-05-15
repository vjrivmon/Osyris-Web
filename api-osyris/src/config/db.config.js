const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de la conexión a MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'osyris_db',
  connectionLimit: 10,
  connectTimeout: 10000
});

// Función para obtener una conexión del pool
async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida');
    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

// Función para ejecutar consultas SQL
async function query(sql, params) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.query(sql, params);
    return result;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Función para inicializar la base de datos
async function initializeDatabase() {
  let connection;
  try {
    connection = await getConnection();
    
    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'osyris_db'}`);
    
    // Usar la base de datos
    await connection.query(`USE ${process.env.DB_NAME || 'osyris_db'}`);
    
    console.log('Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  getConnection,
  query,
  initializeDatabase
}; 