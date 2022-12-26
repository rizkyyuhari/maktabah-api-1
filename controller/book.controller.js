const express = require("express");
const { json } = require("express/lib/response");
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
    creator: req.body.creator,
    subject: req.body.subject,
    description: req.body.description,
    publisher: req.body.publisher,
    contributor: req.body.contributor,
    tanggal_terbit: req.body.tanggal_terbit,
    resource_identifier: req.body.resource_identifier,
    source: req.body.source,
    rights: req.body.rights,
    pages: req.body.pages,
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

book_router.get("/sub-categories", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || null;
  const offset = page * limit;
  const search = req.query.search || "";
  BookModel.getSubCategories({ page, limit, offset, search }, res);
});

book_router.get("/book-detail-pagination", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || null;
  const offset = page * limit;
  const search = req.query.search || "";
  BookModel.getBookDetailPagination({ page, limit, offset, search }, res);
});

book_router.get("/book-content-pagination", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || null;
  const offset = page * limit;
  const search = req.query.search || "";
  BookModel.getBookContentPagination({ page, limit, offset, search }, res);
});

book_router.delete("/categories", (req, res) => {
  const id = req.query.id;
  BookModel.deleteCategories(id, res);
});

book_router.delete("/sub-categories", (req, res) => {
  const id = req.query.id;
  BookModel.deleteSubCategories(id, res);
});

book_router.delete("/book", (req, res) => {
  const id = req.query.id;
  BookModel.deleteBook(id, res);
});

book_router.delete("/book-content", (req, res) => {
  const id = req.query.id;
  const page = req.query.page;
  BookModel.deleteBookContent({ id, page }, res);
});

book_router.put("/categories", (req, res) => {
  const newCategoryName = req.body.newCategoryName;
  const id = req.body.id;
  BookModel.updateKategoriBook({ newCategoryName, id }, res);
});

book_router.put("/sub-categories", (req, res) => {
  const newPk = req.body.newPk;
  const newSubName = req.body.newSubName;
  const currentPkSub = req.body.currentPkSub;
  BookModel.updateSubKategori({ newPk, newSubName, currentPkSub }, res);
});
book_router.put("/book-detail", (req, res) => {
  const data = {
    title: req.body.title,
    creator: req.body.creator,
    subject: req.body.subject,
    description: req.body.description,
    publisher: req.body.publisher,
    contributor: req.body.contributor,
    tanggal_terbit: req.body.tanggal_terbit,
    resource_identifier: req.body.resource_identifier,
    source: req.body.source,
    rights: req.body.rights,
    pages: req.body.pages,
    pk_categoryid: req.body.pk_categoryid,
    pk_subcategoryid: req.body.pk_subcategoryid,
    pk_bookdetail: req.body.pk_bookdetail,
  };
  BookModel.updateBookDetail(data, res);
});

book_router.put("/konten-buku", (req, res) => {
  const data = {
    book_content: req.body.book_content,
    pk_bookdetail: req.body.pk_bookdetail,
    page: req.body.page,
  };
  BookModel.updateBookContent(data, res);
});

book_router.post("/coba", (req, res) => {
  BookModel.coba(res);
});

book_router.post("/tableofcontent", (req, res) => {
  const data = {
    pk_bookdetail: req.body.pk_bookdetail,
    pk_tblofcontent: req.body.pk_tblofcontent,
    text: req.body.text,
    page: req.body.page,
    sub: req.body.sub,
  };
  BookModel.addTableOfContent(data, res);
});

book_router.get("/tableofcontent", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || null;
  const offset = page * limit;
  BookModel.getTblOfcontent({ page, limit, offset }, res);
});

book_router.put("/tableofcontent", (req, res) => {
  const data = {
    pk_tblofcontent: req.body.pk_tblofcontent,
    page: req.body.page,
    text: req.body.text,
    sub: req.body.sub || JSON.stringify([]),
  };
  BookModel.updateTblContent(data, res);
});

book_router.delete("/tableofcontent", (req, res) => {
  const id = req.query.id;
  BookModel.deleteTblContent(id, res);
});

book_router.get("/coba", (req, res) => {
  const id = req.query.id;
  BookModel.getCoba(res, id);
});
module.exports = book_router;
