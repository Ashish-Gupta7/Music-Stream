const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/login-middleware");

const {
  getCreatePlaylist,
  postCreatePlaylist,
  showPlaylist,
  showAllPlaylistSongs,
} = require("../controllers/playlist-controller");

router.get("/", isLoggedIn, getCreatePlaylist);

router.post("/create", isLoggedIn, postCreatePlaylist);

router.get("/show", isLoggedIn, showPlaylist);

router.get("/songs/:playlistId", isLoggedIn, showAllPlaylistSongs);

module.exports = router;
