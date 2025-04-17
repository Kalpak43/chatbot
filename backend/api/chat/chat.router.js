const express = require("express");
const {
  streamResponse,
  getTitle,
  syncChat,
  getSyncTime,
} = require("./chat.controller");
const { checkLoggedin } = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.post("/", streamResponse);
router.post("/generate-title", getTitle);
router.post("/sync-chat", syncChat);
router.post("/get-sync-time", getSyncTime);

module.exports = router;
