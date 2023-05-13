const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controller/Users");
const { verifyUser, superAdminOnly } = require("../middleware/AuthUser");

const router = express.Router();

router.get("/users", verifyUser, superAdminOnly, getUsers);
router.post("/users", verifyUser, superAdminOnly, createUser);
router.patch("/users/:id", verifyUser, superAdminOnly, updateUser);
router.delete("/users/:id", verifyUser, superAdminOnly, deleteUser);

module.exports = router;
