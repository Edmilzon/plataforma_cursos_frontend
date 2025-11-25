import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.NEXT_PUBLIC_DB_HOST || 'localhost',
  user: process.env.NEXT_PUBLIC_DB_USER || 'root',
  password: process.env.NEXT_PUBLIC_DB_PASSWORD || 'rootCONALE47347',
  database: process.env.NEXT_PUBLIC_DB_NAME || 'polimathia',
});
