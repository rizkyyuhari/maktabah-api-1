require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  host: "localhost",
  database: "maktabahDb",
  password: "260999",
  user: "postgres",
});

const { Sequelize } = require("sequelize");
const db = new Sequelize("maktabahDb", "postgres", "260999", {
  host: "localhost",
  dialect: "postgres",
});

module.exports = {
  query: (text, param) => pool.query(text, param),
  db,
  pool,
};
