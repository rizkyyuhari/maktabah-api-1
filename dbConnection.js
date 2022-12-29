const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
});

module.exports = {
  query: (text, param) => pool.query(text, param),
};
