const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'microservice_user',
  password: 'secure_password', // Replace with actual password if changed
  database: 'travel_payment_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
