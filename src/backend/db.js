import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.VITE_API__DB_HOST,
  user: process.env.VITE_API_DB_USER,
  password: process.env.VITE_API_DB_PASSWORD,
  database: process.env.VITE_API_DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

export default connection;
