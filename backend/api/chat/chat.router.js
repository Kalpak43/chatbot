const express = require("express");
const { streamResponse, getTitle } = require("./chat.controller");

const router = express.Router();

router.post("/", streamResponse);
router.post("/generate-title", getTitle);

module.exports = router;
