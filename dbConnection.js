const { Pool } = require("pg");
const pool = new Pool({
  host: "localhost",
  database: "maktabahDb",
  password: "260999",
  user: "postgres",
});
module.exports = {
  query: (text, param) => pool.query(text, param),
};


