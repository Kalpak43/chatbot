const express = require("express");
const {
  streamResponse,
  getTitle,
  sync,
  syncChat,
  getChats,
  // getSyncTime,
} = require("./chat.controller");
const { checkLoggedin } = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.post("/", streamResponse);
router.post("/generate-title", getTitle);
router.post("/sync", checkLoggedin, sync);
router.post("/sync-chat", checkLoggedin, syncChat);
router.get("/get-chats", checkLoggedin, getChats);
// router.post("/get-sync-time", getSyncTime);

module.exports = router;
