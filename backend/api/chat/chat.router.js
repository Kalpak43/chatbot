const express = require("express");
const { streamResponse, getTitle, syncChat } = require("./chat.controller");
const { checkLoggedin } = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.post("/", streamResponse);
router.post("/generate-title", getTitle);
router.post("/sync-chat", syncChat);

module.exports = router;
