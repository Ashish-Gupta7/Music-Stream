const musicMetadata = require("music-metadata");
const trackModel = require("../models/track-model");
const playlistModel = require("../models/playlist-model");
const dbgr = require("debug")("development:musicController");
const path = require("path");
const fs = require("fs");

const getUploadPage = (req, res) => {
  try {
    res.status(200).render("upload");
  } catch (err) {
    dbgr(`Error in getUploadPage: ${err.message}`);
    res
      .status(500)
      .render("error", { err: "Internal Server Error", status: 500 });
  }
};

const postUploadTrack = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .render("error", { err: "No Files Uploaded!", status: 400 });
    }

    const trackDataPromises = files.track.map(async (file) => {
      const relativeTrackUrl = `/music/${file.filename}`;
      const trackUrl = path.join(__dirname, "../public/music", file.filename);
      const metadata = await musicMetadata.parseFile(trackUrl);
      let posterData = "";

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const imageBuffer = picture.data;
        const imageMime = picture.format;
        const base64Image = `data:${imageMime};base64,${imageBuffer.toString(
          "base64"
        )}`;
        posterData = base64Image;
      }

      let existingTrack = await trackModel.findOne({
        title: metadata.common.title,
      });
      if (existingTrack) {
        fs.unlinkSync(trackUrl);
        return { skip: true, title: metadata.common.title };
      }

      let duration = `${Math.floor(metadata.format.duration / 60)}:${Math.floor(
        metadata.format.duration % 60
      )
        .toString()
        .padStart(2, "0")}`;

      return {
        title: metadata.common.title,
        artist: metadata.common.artist,
        year: metadata.common.year,
        duration: duration,
        url: relativeTrackUrl,
        poster: posterData,
        album: metadata.common.album,
        allArtists: metadata.common.artists,
      };
    });

    const tracks = await Promise.all(trackDataPromises);
    const tracksToInsert = tracks.filter((track) => !track.skip);
    if (tracksToInsert.length > 0) {
      await trackModel.insertMany(tracksToInsert);
    }

    const skippedTracks = tracks.filter((track) => track.skip);
    if (skippedTracks.length > 0) {
      return res.status(200).render("skip", { skippedTracks });
    }

    return res.status(201).redirect("/");
  } catch (err) {
    dbgr(`Error During postUploadTrack: ${err.message}`);
    res
      .status(500)
      .render("error", { err: "Error Uploading Tracks", status: 500 });
  }
};

const showAllSongs = async (req, res) => {
  try {
    let songs = await trackModel.find();
    res.status(200).render("songs", { songs });
  } catch (err) {
    dbgr(`Error in showAllSongs: ${err.message}`);
    res
      .status(500)
      .render("error", { err: "Internal Server Error", status: 500 });
  }
};

const addOtherSongs = async (req, res) => {
  try {
    let playlistId = req.params.playlistId;
    let playlist = await playlistModel.findOne({ _id: playlistId });
    if (!playlist) {
      return res
        .status(404)
        .render("error", { err: "Playlist Not Found", status: 404 });
    }

    let tracks = playlist.tracks;
    if (tracks.length === 0) {
      let songs = await trackModel.find();
      res.status(200).render("songs", { songs, playlistId: playlist._id });
    } else if (tracks.length > 0) {
      let playlistTracks = await playlistModel
        .findOne({ _id: playlistId })
        .populate("tracks");
      let existingTrackIds = playlistTracks.tracks.map((track) => track._id);
      let availableTracks = await trackModel.find({
        _id: { $nin: existingTrackIds },
      });
      res.status(200).render("songs", { songs: availableTracks, playlistId });
    }

    res.send("play");
  } catch (err) {
    dbgr(`Error in addOtherSongs: ${err.message}`);
    res
      .status(500)
      .render("error", { err: "Internal Server Error", status: 500 });
  }
};

module.exports = {
  getUploadPage,
  postUploadTrack,
  showAllSongs,
  addOtherSongs,
};
