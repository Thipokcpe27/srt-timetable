import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'RailwayManagement',
  // Use SQL Server Authentication for now (easier for development)
  user: process.env.DB_USER || 'railway_app',
  password: process.env.DB_PASSWORD || 'railway123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    useUTC: false,
  },
  // Enable Unicode support for Thai characters
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    pool = null;
    throw error;
  }
}

export { sql };
