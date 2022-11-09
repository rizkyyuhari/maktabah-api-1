module.exports = {
  idGenerator: (kategori) =>
    kategori.substring(0, 4) + Math.floor(Math.random() * 1000),
  capitalChange: (str) =>
    str
      .split(" ")
      .map((word) => word.toLocaleLowerCase())
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join(" "),
  subCategoryIdGen: (sub_name) =>
    "sub" + sub_name.substring(0, 4) + Math.floor(Math.random() * 1000),
};
