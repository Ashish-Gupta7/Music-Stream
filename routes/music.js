const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/login-middleware");
const uploaderMiddleware = require("../middlewares/uploader-middleware");
const multerMiddleware = require("../middlewares/multer-middleware");

const {
  getUploadPage,
  postUploadTrack,
  showAllSongs,
  addOtherSongs,
} = require("../controllers/music-controller");

router.get("/upload", isLoggedIn, uploaderMiddleware, getUploadPage);

router.post(
  "/upload",
  isLoggedIn,
  uploaderMiddleware,
  multerMiddleware,
  postUploadTrack
);

router.get("/allsongs", isLoggedIn, showAllSongs);

router.get("/allsongs/:playlistId", isLoggedIn, addOtherSongs);

module.exports = router;
