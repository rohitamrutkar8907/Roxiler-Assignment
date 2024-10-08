const mysql = require('mysql2')
const config = require('./config')

// create a connection pool
// - pool: collection of connections which will be managed by mysql2
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port,
  password: config.password,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

module.exports = {
  query: (...args) => pool.query(...args), // this makes querying simpler
  pool,
};
