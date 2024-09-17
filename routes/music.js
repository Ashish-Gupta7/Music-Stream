const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/login-middleware");
const uploaderMiddleware = require("../middlewares/uploader-middleware");
const upload = require("../utils/multer-utils");

const {
  getUploadPage,
  postUploadTrack,
} = require("../controllers/music-controller");

router.get("/upload", isLoggedIn, uploaderMiddleware, getUploadPage);

router.post("/upload", isLoggedIn, uploaderMiddleware, upload, postUploadTrack);

module.exports = router;
