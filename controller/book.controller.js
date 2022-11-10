const express = require("express");
const dbConnection = require("../dbConnection");
const book_router = express.Router();
const BookModel = require("../model/book.model");

book_router.post("/categories", async (req, res) => {
  const { category_name } = req.body;
  BookModel.addCategory(category_name, res);
});

book_router.get("/categories", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || null;
  const offset = page * limit;
  const search = req.query.search || "";

  BookModel.getCategories({ page, limit, offset, search }, res);
});

book_router.get("/book-detail", async (req, res) => {
  BookModel.getBookDetail(req, res);
});

book_router.post("/sub-categories", async (req, res) => {
  const data = {
    sub_name: req.body.sub_name,
    idCate: req.body.id_category_book,
  };
  BookModel.addSubCategories(data, res);
});

book_router.post("/book-detail", async (req, res) => {
  const data = {
    title: req.body.title,
    author: req.body.author,
    publish: req.body.publish,
    pages: req.body.pages,
    price: req.body.price,
    source: req.body.source,
    description: req.body.description,
    pk_categoryid: req.body.pk_categoryid,
    pk_subcategoryid: req.body.pk_subcategoryid,
  };
  BookModel.addBookDetail(data, res);
});

book_router.post("/book-content", async (req, res) => {
  const data = {
    idBook: req.body.idBook,
    content: req.body.content,
    page: req.body.page,
  };
  BookModel.addBookContent(data, res);
});

book_router.get("/book-content", (req, res) => {
  const pk_bookdetail = req.body.pk_bookdetail;
  BookModel.getBookContent(pk_bookdetail, res);
});

// book_router.get("/catepagi", (req, res) => {
// const page = parseInt(req.query.page) || 0;
// const limit = parseInt(req.query.limit) || null;
// const offset = page * limit;
// const search = req.query.search || "";

// BookModel.getBookPagination({ page, limit, offset, search }, res);
// });

book_router.delete("/categories", (req, res) => {
  const id = req.query.id;
  BookModel.deleteCategories(id, res);
});

module.exports = book_router;
