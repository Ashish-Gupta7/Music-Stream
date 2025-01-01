const playlistModel = require("../models/playlist-model");
const trackModel = require("../models/track-model");
const { userModel } = require("../models/user-model");
const dbgr = require("debug")("development:playlistController");
const upload = require("../config/multer-config");
const fs = require("fs");

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

      return res.status(201).redirect("/playlist/show");
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
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      let { playlistId } = req.params;
      let { name } = req.body;

      let image = req.files["image"] ? req.files["image"][0].filename : null;

      let playlist = await playlistModel.findById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      let oldPoster = playlist.poster;

      if (image) {
        playlist.poster = image;
      }

      if (name) {
        playlist.name = name;
      }

      if (oldPoster === null) {
        dbgr("postUpdatePlaylist: We can't delete default-image.png file.");
      } else {
        fs.unlink(`./public/images/picture/${oldPoster}`, (err) => {
          if (err) {
            dbgr("Error deleting file (postUpdatePlaylist):", err);
          } else {
            dbgr("postUpdatePlaylist: File deleted successfully!");
          }
        });
      }

      await playlist.save();

      return res.status(200).redirect("/playlist/show");
    } catch (err) {
      dbgr(`Error during playlist update: ${err.message}`);
      return res.status(500).render("error", {
        err: "Failed to update playlist. Please try again later.",
        status: 500,
      });
    }
  });
};

const postDeleteImagePlaylist = async (req, res) => {
  try {
    let { playlistId } = req.body;

    let playlist = await playlistModel.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    let oldPoster = playlist.poster;

    if (oldPoster === null) {
      dbgr("postDeleteImagePlaylist: We can't delete default-image.png file.");
    } else {
      fs.unlink(`./public/images/picture/${oldPoster}`, (err) => {
        if (err) {
          dbgr("Error deleting file (postDeleteImagePlaylist):", err);
        } else {
          dbgr("postDeleteImagePlaylist: File deleted successfully!");
        }
      });
    }

    playlist.poster = null;

    await playlist.save();

    return res
      .status(200)
      .json({ message: "Playlist poster deleted successfully" });
  } catch (err) {
    dbgr(`Error during playlist poster delete: ${err.message}`);
    return res.status(500).render("error", {
      err: "Failed to delete playlist poster. Please try again later.",
      status: 500,
    });
  }
};

const showPlaylist = async (req, res) => {
  try {
    let playlistIds = req.user.playlists;

    // Use Promise.all to handle multiple asynchronous operations

    // hum async-await ka use kar sakte hain, lekin jab aapko multiple asynchronous operations ek array ya list me handle karne hote hain, to har operation ko individually await karna inefficient hota hai. Is situation me Promise.all ko use karna zyada effective hota hai.

    // Agar aap async-await ka use karte hain bina Promise.all ke, to har operation ek ke baad ek execute hoga, jo ki slow ho sakta hai. Promise.all parallel me sari promises ko execute karta hai, jo time-efficient hota hai.

    let playlists = await Promise.all(
      playlistIds.map(async (findId) => {
        try {
          let playlist = await playlistModel.findById(findId);
          return playlist;
        } catch (err) {
          dbgr("Error during showPlaylist: ", err);
          return null;
        }
      })
    );

    playlists = playlists.filter((elm) => elm !== null);

    let user = req.user;
    res.status(200).render("showPlaylist", { playlists, user });
  } catch (err) {
    dbgr(`Error during fetching playlists: ${err.message}`);
    return res.status(500).render("error", {
      err: "Failed to load playlists. Please try again later.",
      status: 500,
    });
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

const postDeletePlaylist = async (req, res) => {
  try {
    let { playlistId } = req.body;

    const playlist = await playlistModel.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const deletedPlaylist = await playlistModel.findByIdAndDelete(playlistId);

    let oldPoster = deletedPlaylist.poster;

    if (oldPoster === null) {
      dbgr("postDeletePlaylist: We can't delete default-image.png file.");
    } else {
      fs.unlink(`./public/images/picture/${oldPoster}`, (err) => {
        if (err) {
          dbgr("Error deleting file (postDeletePlaylist):", err);
        } else {
          dbgr("postDeletePlaylist: File deleted successfully!");
        }
      });
    }

    res.status(200).json({ message: "Playlist Deleted Successfully" });
  } catch (err) {
    dbgr(`Error during playlist delete: ${err.message}`);
    return res.status(500).render("error", {
      err: "Failed to delete playlist. Please try again later.",
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
  postDeletePlaylist,
  postDeleteImagePlaylist,
};
