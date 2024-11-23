require('dotenv').config();
const mysql = require('mysql2/promise');
const db_host = process.env.DB_HOST_M;
const db_port = process.env.DB_PORT_M;
const db_user = process.env.DB_USER_M;
const db_password = process.env.DB_PASSWORD_M;
const db_database = process.env.DB_NAME_M;
const connection = mysql.createPool({
    host: db_host,
    port: db_port,
    user: db_user,
    password: db_password,
    database: db_database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
module.exports = connection;