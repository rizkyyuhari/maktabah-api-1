const express = require("express");
const server = express();
const helmet = require("helmet");
const { db, pool } = require("./dbConnection");
const cors = require("cors");
const book_router = require("./controller/book.controller");
const session = require("express-session");
const UserRouter = require("./routes/UserRoute");
const AuthRoute = require("./routes/AuthRoute");
const SequelizeStore = require("connect-session-sequelize");
const dotenv = require("dotenv");

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

server.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    store: store,
    saveUninitialized: true,
    cookie: {
      secure: "auto", // nilai ada true, false, dan auto jika pilih true maka untuk https dan false untuk http jika dideteksi secara auto otomatis
    },
  })
);

server.use(express.json());
server.use(
  cors({
    credentials: true, // berfungsi agar fe bisa mengirimkan request beserta cookie dengan credential-nya
    origin: [
      "http://localhost:3000",
      "https://9307-139-255-58-226.ap.ngrok.io",
    ],
  })
);

server.use(helmet());
server.use("/api/v1/book/", book_router);
server.use("/api/v1/book/", UserRouter);
server.use("/api/v1/book/", AuthRoute);
server.get("/mantap", async (req, res) => {
  const query = "select * from tblbookcategories";
  const response = await pool.query(query);
  res.send({
    result: response.rows,
  });
});

server.listen(8000, console.log("Connection Succesfull"));
