const express = require("express");
const {
  streamResponse,
  getTitle,
  sync,
  // getSyncTime,
} = require("./chat.controller");
const { checkLoggedin } = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.post("/", streamResponse);
router.post("/generate-title", getTitle);
router.post("/sync", checkLoggedin, sync);
// router.post("/get-sync-time", getSyncTime);

module.exports = router;
