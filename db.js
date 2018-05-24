const mysql = require('mysql');
const connection = mysql.createConnection({
  host: '127.0.0.1',
  database: 'zombies',
  user: 'root',
  password: '123405',
  port: 3306,
  multipleStatements: true
});

connection.connect();

module.exports = connection;
