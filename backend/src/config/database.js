const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000
  }
};

let pool;

const connectWithRetry = async (maxRetries = 10, delay = 5000) => {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`Intento de conexión ${i}/${maxRetries} a SQL Server...`);
      pool = await sql.connect(config);
      console.log('Conexión exitosa a SQL Server');
      return pool;
    } catch (err) {
      console.log(`❌ Error en intento ${i}: ${err.message}`);
      if (i === maxRetries) {
        console.error('No se pudo conectar a SQL Server');
        throw err;
      }
      console.log(`Reintentando en ${delay/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Pool de conexiones no inicializado');
  }
  return pool;
};

module.exports = {
  connectWithRetry,
  getPool,
  sql 
};