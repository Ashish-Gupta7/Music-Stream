const playlistModel = require("../models/playlist-model");
const trackModel = require("../models/track-model");
const { userModel } = require("../models/user-model");
const dbgr = require("debug")("development:playlistController");
const upload = require("../config/multer-config");
const fs = require("fs");
const path = require("path");
const { log } = require("console");

const getCreatePlaylist = (req, res) => {
  res.status(200).render("playlist");
};

const postCreatePlaylist = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      let user = req.user;
      let { name } = req.body;

      let image = req.files["image"] ? req.files["image"][0].filename : null;

      let newPlaylist = await playlistModel.create({
        name,
        poster: image,
        user: user._id,
      });

      await userModel.findOneAndUpdate(
        { _id: user._id },
        {
          $push: {
            playlists: newPlaylist._id,
          },
        },
        { new: true }
      );

      return res.status(201).redirect("/");
    } catch (err) {
      dbgr(`Error during playlist creation: ${err.message}`);
      return res.status(500).render("error", {
        err: "Failed to create playlist. Please try again later.",
        status: 500,
      });
    }
  });
};

const postUpdatePlaylist = (req, res) => {
  const action = req.body.action;

  if (action === "change" && req.files) {
    // Handling image change
    const newImage = req.files["image"][0];
    const imagePath = path.join(
      __dirname,
      "../public/image/picture",
      "profile.jpg"
    );

    // Delete existing image
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Save new image
    fs.renameSync(newImage.path, imagePath);
    return res.json({ success: true, message: "Image updated successfully." });
  } else if (action === "delete") {
    // Handling image delete
    const imagePath = path.join(
      __dirname,
      "../public/image/picture",
      "profile.jpg"
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return res.json({
        success: true,
        message: "Image deleted successfully.",
      });
    }
    return res.json({ success: false, message: "No image to delete." });
  }

  return res.json({ success: false, message: "Invalid action." });
};

const showPlaylist = async (req, res) => {
  try {
    let playlistIds = req.user.playlists;
    let context = "edit-playlist"; // dynamically rendering createPlaylist page

    // Use Promise.all to handle multiple asynchronous operations

    // hum async-await ka use kar sakte hain, lekin jab aapko multiple asynchronous operations ek array ya list me handle karne hote hain, to har operation ko individually await karna inefficient hota hai. Is situation me Promise.all ko use karna zyada effective hota hai.

    // Agar aap async-await ka use karte hain bina Promise.all ke, to har operation ek ke baad ek execute hoga, jo ki slow ho sakta hai. Promise.all parallel me sari promises ko execute karta hai, jo time-efficient hota hai.

    let playlists = await Promise.all(
      playlistIds.map(async (findId) => {
        try {
          let playlist = await playlistModel.findById(findId);
          return playlist;
        } catch (err) {
          console.error(err);
          return null;
        }
      })
    );

    playlists = playlists.filter((elm) => elm !== null);

    let user = req.user;
    res.status(200).render("showPlaylist", { playlists, user, context });
  } catch (err) {
    dbgr(`Error during fetching playlists: ${err.message}`);
    return res.status(500).render("error", {
      err: "Failed to load playlists. Please try again later.",
      status: 500,
    });
  }
};

const returnIndexData = (req, res) => {
  try {
    let useIndex = req.body.useIndex;
    console.log(useIndex);

    res.json({ data: useIndex });
  } catch (err) {
    console.log(err);
  }
};

const showAllPlaylistSongs = async (req, res) => {
  try {
    let user = req.user;
    let playlistId = req.params.playlistId;
    let playlist = await playlistModel.findOne({ _id: playlistId });

    if (!playlist) {
      return res
        .status(404)
        .render("error", { err: "Playlist not found.", status: 404 });
    }

    let songIds = playlist.tracks;
    let songs = await Promise.all(
      songIds.map(async (songId) => {
        return await trackModel.findOne({ _id: songId });
      })
    );

    res.status(200).render("songs", {
      username: user.username,
      songs,
      playlistName: playlist.name,
      removePl: playlistId,
    });
  } catch (err) {
    dbgr(`Error during fetching playlist songs: ${err.message}`);
    return res.status(500).render("error", {
      err: "Failed to load songs. Please try again later.",
      status: 500,
    });
  }
};

const playlistAddTrack = async (req, res) => {
  try {
    let playlistId = req.params.playlistId;
    let songId = req.params.songId;

    let playlist = await playlistModel.findOne({ _id: playlistId });

    if (!playlist) {
      return res
        .status(404)
        .render("error", { err: "Playlist not found.", status: 404 });
    }

    if (!playlist.tracks.includes(songId)) {
      playlist.tracks.push(songId);
      await playlist.save();
    }

    res.status(200).redirect(`/music/allsongs/${playlistId}`);
  } catch (err) {
    dbgr(`Error during adding track to playlist: ${err.message}`);
    return res.status(500).render("error", {
      err: "Failed to add track to playlist. Please try again later.",
      status: 500,
    });
  }
};

const playlistRemoveTrack = async (req, res) => {
  try {
    let playlistId = req.params.playlistId;
    let songId = req.params.songId;

    let playlist = await playlistModel.findOne({ _id: playlistId });

    if (!playlist) {
      return res
        .status(404)
        .render("error", { err: "Playlist not found.", status: 404 });
    }

    if (playlist.tracks.includes(songId)) {
      playlist.tracks = playlist.tracks.filter((track) => track != songId);
      await playlist.save();
    }

    res.status(200).redirect(`/playlist/songs/${playlistId}`);
  } catch (err) {
    dbgr(`Error during removing track from playlist: ${err.message}`);
    return res.status(500).render("error", {
      err: "Failed to remove track from playlist. Please try again later.",
      status: 500,
    });
  }
};

module.exports = {
  getCreatePlaylist,
  postCreatePlaylist,
  postUpdatePlaylist,
  showPlaylist,
  showAllPlaylistSongs,
  playlistAddTrack,
  playlistRemoveTrack,
  returnIndexData,
};
