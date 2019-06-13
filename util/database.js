const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'new-complete',
  password: 'al1120'
})


module.exports = pool.promise();