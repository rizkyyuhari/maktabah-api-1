const express = require("express");
const server = express();
const helmet = require("helmet");
const db = require("./dbConnection");
const cors = require("cors");
const book_router = require("./controller/book.controller");

server.use(express.json());
server.use(cors());

server.use(helmet());
server.use("/api/v1/book/", book_router);

server.listen(8080, console.log("Connection Succesfull"));
