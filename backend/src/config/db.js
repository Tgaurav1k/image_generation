const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  max: 20,
});

module.exports = pool;
