const express = require("express");
const {
  streamResponse,
  getTitle,
  sync,
  syncChat,
  getChats,
  syncMessage,
  getMessages,
  // getSyncTime,
} = require("./chat.controller");
const { checkLoggedin } = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.post("/", streamResponse);
router.post("/generate-title", getTitle);
router.post("/sync", checkLoggedin, sync);
router.post("/sync-chat", checkLoggedin, syncChat);
router.get("/get-chats", checkLoggedin, getChats);
router.post("/sync-message", checkLoggedin, syncMessage);
router.get("/get-messages", checkLoggedin, getMessages);
// router.post("/get-sync-time", getSyncTime);

module.exports = router;
