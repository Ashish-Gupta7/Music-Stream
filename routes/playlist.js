const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/login-middleware");

const {
  getCreatePlaylist,
  postCreatePlaylist,
  showPlaylist,
  showAllPlaylistSongs,
  playlistAddTrack,
  playlistRemoveTrack,
} = require("../controllers/playlist-controller");

router.get("/", isLoggedIn, getCreatePlaylist);

router.post("/create", isLoggedIn, postCreatePlaylist);

router.get("/show", isLoggedIn, showPlaylist);

router.get("/songs/:playlistId", isLoggedIn, showAllPlaylistSongs);

router.post("/:playlistId/:songId", isLoggedIn, playlistAddTrack);

router.post("/remove/:playlistId/:songId", isLoggedIn, playlistRemoveTrack);

module.exports = router;
