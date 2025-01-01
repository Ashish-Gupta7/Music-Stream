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
  postUpdatePlaylist,
  postDeletePlaylist,
  postDeleteImagePlaylist,
} = require("../controllers/playlist-controller");

router.get("/check", isLoggedIn, (req, res) => {
  res.render("checkPlaylist.ejs");
});

router.get("/", isLoggedIn, getCreatePlaylist);

router.post("/create", isLoggedIn, postCreatePlaylist);

router.post("/update/:playlistId", isLoggedIn, postUpdatePlaylist);

router.post("/delete/image", isLoggedIn, postDeleteImagePlaylist);

router.get("/show", isLoggedIn, showPlaylist);

router.get("/songs/:playlistId", isLoggedIn, showAllPlaylistSongs);

router.post("/:playlistId/:songId", isLoggedIn, playlistAddTrack);

router.post("/remove/:playlistId/:songId", isLoggedIn, playlistRemoveTrack);

router.post("/delete", isLoggedIn, postDeletePlaylist);

module.exports = router;
