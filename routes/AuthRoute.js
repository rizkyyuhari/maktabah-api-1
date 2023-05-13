const express = require("express");
const { Login, Me, Logout } = require("../controller/Auth");
const router = express.Router();

router.get("/me", Me);

router.post("/login", Login);

router.delete("/logout", Logout);

module.exports = router;
