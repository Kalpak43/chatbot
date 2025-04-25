const express = require("express");
const multer = require("multer");
const { uploadHandler } = require("./upload.controller");
require("dotenv").config();

const router = express.Router();

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post("/", upload.single("file"), uploadHandler);

module.exports = router;
