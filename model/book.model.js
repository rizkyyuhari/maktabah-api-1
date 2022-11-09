const db = require("../dbConnection");
const { idGenerator, capitalChange, subCategoryIdGen } = require("../utils");

//ADD CATEGORY BOOK
const addCategory = async (category_name, res) => {
  console.log(category_name);
  try {
    const { rows } = await db.query(
      `insert into tblBookCategories (PK_CategoryID,category_name) VALUES($1,$2)`,
      [idGenerator(category_name), capitalChange(category_name)]
    );
    res.send({ message: "Sukses menambahkan Kategori Buku baru" });
  } catch (error) {
    res.status(409).send({
      message: "Kategori Yang Anda Masukkan sudah ada dalam Database!",
    });
  }
};

// ADDING SUB CATEGORIES
const addSubCategories = async (data, res) => {
  try {
    const { rows } = await db.query(
      `insert into tblbooksubcategories values($1,$2,$3)`,
      [
        subCategoryIdGen(data.sub_name),
        capitalChange(data.sub_name),
        data.idCate,
      ]
    );
    res.send({ message: "Sukses menambahkan Sub Kategori Baru" });
  } catch (error) {
    console.log(error);
    res.status(409).send({ message: "Gagal, Sub Kategori sudah ada!" });
  }
};

// ADDING BOOK DETAIL

const addBookDetail = async (
  {
    title,
    author,
    publish,
    pages,
    price,
    source,
    description,
    pk_categoryid,
    pk_subcategoryid,
  },
  res
) => {
  try {
    await db.query(
      `insert into tblBookDetail values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        idGenerator(title),
        capitalChange(title),
        author,
        publish,
        pages,
        price,
        source,
        description,
        true,
        pk_categoryid,
        pk_subcategoryid === "" ? null : pk_subcategoryid,
      ]
    );
    res.send({ message: "Berhasil menambahkan buku baru" });
  } catch (err) {
    console.log(err);
    res.status(409).send({ message: "Judul Buku Sudah ada!" });
  }
};

// GET CATEGORIES AND SUB CATEGORIES
const getCategories = async (_, res) => {
  try {
    const results = await db.query(
      `select c.pk_categoryid , c.category_name, coalesce(
       (select array_to_json(array_agg(row_to_json(x)))
       from (select sc.sub_category_name, sc.pk_subcategoryid
            from tblBookCategories bc
            join tblbooksubcategories as sc using(pk_categoryid)
            where bc.pk_categoryid = c.pk_categoryid) x),'[]') as sub_categories
       from tblbookcategories c;
     `
    );
    res.send(results.rows);
  } catch (e) {
    res.status(404).send({ message: error });
  }
};

//GET BOOK DETAIL
const getBookDetail = async (req, res) => {
  try {
    const result = await db.query("select * from tblbookdetail");
    res.send(result.rows);
  } catch (error) {}
};

const addBookContent = async (data, res) => {
  const result = await db.query(
    "select * from tblbookcontent where page = $1 and pk_bookdetail = $2",
    [data.page, data.idBook]
  );
  console.log(result.rows.length);
  if (!result.rows.length) {
    const result2 = await db
      .query("insert into tblbookcontent values($1,$2,$3);", [
        data.page,
        data.content,
        data.idBook,
      ])
      .then((response) => {
        res.send({ message: "berhasil" });
      })
      .catch((error) => {
        console.log(error.message);
        let message = "";
        if (
          error.message ===
          `null value in column "page" of relation "tblbookcontent" violates not-null constraint`
        ) {
          message = "Page Tidak Boleh Kosong!";
        }
        if (
          error.message ===
          `null value in column "pk_bookdetail" of relation "tblbookcontent" violates not-null constraint`
        ) {
          message =
            "Gagal menambahkan Konten! Mohon Pilih Buku terlebih dahulu ";
        }

        return res.status(400).send({ message: message });
      });
  } else {
    res.status(409).send({
      message: `Gagal menambahkan Konten Buku! Page ${data.page} sudah disimpan sebelumnya`,
    });
  }
};

const getBookContent = async (pk_bookdetail, res) => {
  try {
    const result = await db.query(
      `
    select bd.*, COALESCE((select array_to_json(array_agg(row_to_json(x))) 
    from 
    (select bc.page,bc.book_content as "text"
      from tblbookdetail bdd join tblbookcontent as bc using(pk_bookdetail) 
      where bdd.pk_bookdetail = bd.pk_bookdetail order by page) x),'[]') as content
      from tblbookdetail bd where waqf_status = true`
    );
    res.send(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const getBookPagination = async ({ page, limit, offset, search }, res) => {
  const query = `
      select * 
      from  tblbookcategories
      where category_name  ILIKE '%'|| $3||'%'
      order by category_name 
      limit $1
      offset $2
    `;
  const query1 = `
    select count(category_name)
    from  tblbookcategories
    where category_name ILIKE '%'|| $1 ||'%'
  `;
  const { rows } = await db.query(query1, [search]);
  const totalRows = rows[0].count;
  try {
    const { rows } = await db.query(query, [limit, offset, search]);
    res.send({
      result: rows,
      page,
      limit,
      totalRows,
      totalPage: Math.ceil(totalRows / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error,
    });
  }
};
const deleteCategories = async (id, res) => {
  const result = await db.query(
    `delete from tblbookcategories where pk_categoryid = $1`,
    [id]
  );

  res.send({
    result,
  });
};
module.exports = {
  addCategory,
  getCategories,
  addSubCategories,
  addBookDetail,
  getBookDetail,
  addBookContent,
  getBookContent,
  getBookPagination,
  deleteCategories,
};
