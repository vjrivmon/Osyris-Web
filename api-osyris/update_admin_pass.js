const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'osyris_user',
  password: 'osyris_password',
  database: 'osyris_db',
});

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123#', 10);

    const result = await pool.query(
      'UPDATE usuarios SET contraseña = $1 WHERE email = $2 RETURNING id, nombre, email, rol',
      [hashedPassword, 'web.osyris@gmail.com']
    );

    console.log('✅ Contraseña actualizada');
    console.log('📧 Email: web.osyris@gmail.com');
    console.log('🔑 Password: Admin123#');
    console.log('👤 Usuario:', result.rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
