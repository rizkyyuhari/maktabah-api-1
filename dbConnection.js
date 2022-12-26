const { Pool } = require("pg");
const { Sequelize, DataTypes } = require("sequelize");
const pool = new Pool({
  host: "localhost",
  database: "maktabahDb",
  password: "260999",
  user: "postgres",
});

const sequelize = new Sequelize("maktabahDb", "postgres", "260999", {
  host: "localhost",
  dialect: "postgres",
});

const Coba = sequelize.define(
  "datas",
  {
    nama: { type: DataTypes.STRING },
    age: { type: DataTypes.STRING },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = {
  query: (text, param) => pool.query(text, param),
  Coba,
};
