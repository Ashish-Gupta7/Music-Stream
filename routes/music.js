const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/login-middleware");
const upload = require("../utils/multer-utils");

const {
  getUploadPage,
  postUploadTrack,
} = require("../controllers/music-controller");

router.get("/upload", isLoggedIn, getUploadPage);

router.post("/upload", isLoggedIn, upload.single("track"), postUploadTrack);

module.exports = router;
