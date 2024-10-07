const express = require("express");
// const { login } = require("../handler.js");
const { userLogin, storeAuthUser } = require("../handler.js");
const router = express.Router();

router.post("/login", userLogin);
router.post("/", storeAuthUser);

module.exports =  router
