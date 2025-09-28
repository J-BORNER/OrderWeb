const { Pool } = require('pg');
require('dotenv').config();

console.log('Configurando conexión a BD...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Presente' : '❌ No encontrada');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Probar la conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  } else {
    console.log('✅ Conexión a BD exitosa:', res.rows[0]);
  }
});

module.exports = pool;