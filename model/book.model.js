const res = require("express/lib/response");
const { Coba } = require("../dbConnection");
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
    subject,
    creator,
    description,
    publisher,
    contributor,
    tanggal_terbit,
    resource_identifier,
    source,
    rights,
    pages,
    pk_categoryid,
    pk_subcategoryid,
  },
  res
) => {
  try {
    await db.query(
      `insert into tblBookDetail values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        idGenerator(title),
        capitalChange(title),
        creator,
        subject,
        description,
        publisher,
        contributor,
        tanggal_terbit,
        resource_identifier,
        source,
        rights,
        pages,
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
const getCategories = async ({ page, limit, offset, search }, res) => {
  const query = `
    select c.pk_categoryid , c.category_name, coalesce(
    (select array_to_json(array_agg(row_to_json(x)))
    from (select sc.sub_category_name, sc.pk_subcategoryid
    from tblBookCategories bc
    join tblbooksubcategories as sc using(pk_categoryid)
    where bc.pk_categoryid = c.pk_categoryid) x),'[]') as sub_categories
    from tblbookcategories c
    where category_name  ILIKE '%'|| $3||'%'
    order by category_name 
    limit $1
    offset $2
    ;`;
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

//GET BOOK DETAIL
const getBookDetail = async (req, res) => {
  try {
    const result = await db.query("select * from tblbookdetail");
    res.send(result.rows);
  } catch (error) {}
};

const getSubCategories = async ({ page, limit, offset, search }, res) => {
  const query1 = `select count(sub_category_name) from tblbooksubcategories where sub_category_name ILIKE '%'|| $1 ||'%'`;
  const query = `
      select s.pk_subcategoryid , s.sub_category_name , c.category_name 
      from tblbooksubcategories s 
      inner join tblbookcategories c on c.pk_categoryid = s.pk_categoryid
      where sub_category_name ilike '%'|| $3||'%' 
      order by sub_category_name
      limit $1
      offset $2
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
    res.send(error);
  }
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
      from tblbookdetail bd where rights = true and bd.pk_bookdetail = $1`,
      [pk_bookdetail]
    );
    const tblofcontent = await db.query(
      `
    select * from tblofcontent where pk_bookdetail = $1 order by page 
    `,
      [pk_bookdetail]
    );
    const parsingTblOfContent = tblofcontent.rows.map((tbl) => ({
      pk_bookdetail: tbl.pk_bookdetail,
      pk_tblofcontent: tbl.pk_tblofcontent,
      text: tbl.text,
      page: tbl.page,
      sub: JSON.parse(tbl.sub),
    }));

    res.send({
      pk_bookdetail: result.rows[0].pk_bookdetail,
      title: result.rows[0].title,
      creator: result.rows[0].creator,
      subject: result.rows[0].subject,
      description: result.rows[0].description,
      publisher: result.rows[0].publisher,
      contributor: result.rows[0].contributor,
      tanggal_terbit: result.rows[0].tanggal_terbit,
      resource_identifier: result.rows[0].resource_identifier,
      source: result.rows[0].source,
      rights: result.rows[0].rights,
      pages: result.rows[0].pages,
      pk_categoryid: result.rows[0].pk_categoryid,
      pk_subcategoryid: result.rows[0].pk_subcategoryid,
      tableofcontent: parsingTblOfContent,
      content: result.rows[0].content,
    });
  } catch (error) {
    console.log(error);
  }
};
const getBookDetailPagination = async (
  { page, limit, offset, search },
  res
) => {
  const query1 = `select count(title) from tblbookdetail where title ILIKE '%'|| $1 ||'%'`;
  const query = `
    select bd.* from tblbookdetail bd
    where title ilike '%'|| $3||'%'
    order by bd.title
    LIMIT $1
    offset $2
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
    res.send(error);
  }
};

const getBookContentPagination = async (
  { page, limit, offset, search },
  res
) => {
  const query1 = `select count(book_content) from tblbookcontent where book_content ILIKE '%'|| $1 ||'%'`;
  const query = `
  select bd.*, b.title from tblbookcontent bd
  inner join tblbookdetail b on b.pk_bookdetail = bd.pk_bookdetail
    where book_content ilike '%'|| $3||'%'
    order by b.title, bd.page
    LIMIT $1
    offset $2
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
    res.send(error);
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

const deleteSubCategories = async (id, res) => {
  const result = await db.query(
    `delete from tblbooksubcategories where pk_subcategoryid = $1`,
    [id]
  );

  res.send({
    result,
  });
};

const deleteBook = async (id, res) => {
  const result = await db.query(
    `delete from tblbookdetail where pk_bookdetail = $1`,
    [id]
  );

  const resf = await db.query(
    `delete from tblbookcontent where pk_bookdetail = $1`,
    [id]
  );

  res.send({
    result,
  });
};

const deleteBookContent = async ({ id, page }, res) => {
  const result = await db.query(
    `delete from tblbookcontent where pk_bookdetail = $1 and page = $2`,
    [id, page]
  );

  res.send({
    result,
  });
};

const updateKategoriBook = async ({ newCategoryName, id }, res) => {
  try {
    const result = await db.query(
      `
    update tblbookcategories
    set category_name = $1
    where pk_categoryid = $2
`,
      [capitalChange(newCategoryName), id]
    );
    res.send({
      result,
    });
  } catch (error) {
    if (error.code === "23505") {
      res.status(409).send({
        message: "Duplicate Kategori",
      });
    }
  }
};

const updateSubKategori = async ({ newPk, newSubName, currentPkSub }, res) => {
  console.log("trigger");
  const result = await db.query(
    `
      update tblbooksubcategories
      set pk_categoryid = $1 , sub_category_name = $2
      where pk_subcategoryid = $3
   `,
    [newPk, newSubName, currentPkSub]
  );

  res.send({
    result,
  });
};

const updateBookDetail = async (
  {
    title,
    subject,
    creator,
    description,
    publisher,
    contributor,
    tanggal_terbit,
    resource_identifier,
    source,
    rights,
    pages,
    pk_categoryid,
    pk_subcategoryid,
    pk_bookdetail,
  },
  res
) => {
  const result = await db.query(
    `update tblbookdetail
  set title = $1, creator = $2, subject = $3 , description =$4 , publisher =$5 , contributor =$6 , tanggal_terbit = $7, resource_identifier = $8, source = $9, rights = $10, pages =$11 , pk_categoryid = $12, pk_subcategoryid = $13
  where pk_bookdetail  = $14`,
    [
      title,
      subject,
      creator,
      description,
      publisher,
      contributor,
      tanggal_terbit,
      resource_identifier,
      source,
      rights,
      pages,
      pk_categoryid,
      pk_subcategoryid,
      pk_bookdetail,
    ]
  );
  res.send({
    result,
  });
};

const updateBookContent = async (
  { book_content, pk_bookdetail, page },
  res
) => {
  console.log("trigger");
  const result = await db.query(
    `
      update tblbookcontent
      set book_content = $1
      where pk_bookdetail = $2 and page = $3
    `,
    [book_content, pk_bookdetail, page]
  );

  res.send({
    result,
  });
};

const addTableOfContent = async (
  { pk_bookdetail, pk_tblofcontent, text, page, sub },
  res
) => {
  const result = db.query(`insert into tblofcontent values ($1,$2,$3,$4,$5)`, [
    pk_bookdetail,
    pk_tblofcontent,
    text,
    page,
    sub,
  ]);

  res.send({
    result,
  });
};

const getTblOfcontent = async ({ page, limit, offset }, res) => {
  const query1 = `select count(pk_tblofcontent) from tblofcontent`;
  const query = `
    select c.title, d.pk_bookdetail,d.pk_tblofcontent, d.page,d.text,d.sub   from tblofcontent d
    inner join tblbookdetail c on c.pk_bookdetail = d.pk_bookdetail
    order by title  ,page
    LIMIT $1
    offset $2
  `;
  const { rows } = await db.query(query1);
  const totalRows = rows[0].count;
  try {
    const { rows } = await db.query(query, [limit, offset]);
    const filteredRows = rows.map((row) => {
      return {
        title: row.title,
        pk_bookdetail: row.pk_bookdetail,
        pk_tblofcontent: row.pk_tblofcontent,
        text: row.text,
        page: row.page,
        sub: JSON.parse(row.sub),
      };
    });
    res.send({
      result: filteredRows,
      page,
      limit,
      totalRows,
      totalPage: Math.ceil(totalRows / limit),
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const updateTblContent = async ({ pk_tblofcontent, page, text, sub }, res) => {
  const result = await db.query(
    `
  update tblofcontent 
  set text = $1, page = $2, sub = $3 
  where pk_tblofcontent = $4 `,
    [text, page, sub, pk_tblofcontent]
  );
  return res.send(result);
};

const deleteTblContent = async (id, res) => {
  const query = `delete from tblofcontent where pk_tblofcontent = $1`;
  console.log("trigger delete tbl of content");
  try {
    const { rows } = await db.query(query, [id]);
    return res.send({
      message: "Berhasil Hapus Bab",
    });
  } catch (error) {
    console.log(error);
  }
};

const getCoba = async (res, id) => {
  const query = `select * from tblofcontent where pk_bookdetail = $1 order by page`;
  const { rows } = await db.query(query, [id]);
  const datas = rows.map((row) => {
    return {
      title: row.title,
      pk_bookdetail: row.pk_bookdetail,
      pk_tblofcontent: row.pk_tblofcontent,
      text: row.text,
      page: row.page,
      sub: JSON.parse(row.sub),
    };
  });

  const parent = datas.map((data) => {
    return {
      title: data.title,
      pk_bookdetail: data.pk_bookdetail,
      pk_tblofcontent: data.pk_tblofcontent,
      text: data.text,
      page: data.page,
    };
  });
  const anak = [];

  for (let index = 0; index < datas.length; index++) {
    anak.push(...datas[index].sub);
  }
  const cucu = [];

  for (let index = 0; index < anak.length; index++) {
    cucu.push(...anak[index].sub);
  }

  const temp = [...parent, ...anak, ...cucu];
  const filteredArr = temp.reduce((acc, current) => {
    const x = acc.find((item) => item.page == current.page);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  res.send(filteredArr);
};

module.exports = {
  getCoba,
  addCategory,
  getCategories,
  addSubCategories,
  addBookDetail,
  getBookDetail,
  addBookContent,
  getBookContent,
  getSubCategories,
  getBookDetailPagination,
  getBookContentPagination,
  deleteCategories,
  deleteSubCategories,
  deleteBook,
  deleteBookContent,
  updateKategoriBook,
  updateSubKategori,
  updateBookDetail,
  updateBookContent,
  addTableOfContent,
  getTblOfcontent,
  updateTblContent,
  deleteTblContent,
};
