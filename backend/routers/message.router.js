const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const messageController = require("../controllers/message.controller");

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Extract the original file extension
    const fileExtension = path.extname(file.originalname);
    // Generate a unique filename
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Save the file with the original extension
    cb(null, uniqueName + fileExtension);
  },
});

const upload = multer({ storage: storage });

// Define article routes
router.post("/", upload.single("file"), messageController.summarize);

module.exports = router;
