const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({
  host: "34.67.172.217",
  database: "postgres",
  password: "yuharirizk",
  user: "postgres",
});

pool.connect((err) => {
  if (err) throw err;
  console.log("connected");
});
