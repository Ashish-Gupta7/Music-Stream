const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/login-middleware");
const uploaderMiddleware = require("../middlewares/uploader-middleware");
const upload = require("../utils/multer-utils");

const {
  getUploadPage,
  postUploadTrack,
  showAllSongs,
} = require("../controllers/music-controller");

router.get("/upload", isLoggedIn, uploaderMiddleware, getUploadPage);

router.post("/upload", isLoggedIn, uploaderMiddleware, upload, postUploadTrack);

router.get("/allsongs", isLoggedIn, showAllSongs);

module.exports = router;
