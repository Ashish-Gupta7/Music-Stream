const musicMetadata = require("music-metadata");
const trackModel = require("../models/track-model");
const dbgr = require("debug")("development:musicController");
const path = require("path");
const fs = require("fs");

const getUploadPage = (req, res) => {
  res.render("upload");
};

const postUploadTrack = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .render("error", { err: "No Files Uploaded!", status: 400 });
    }

    const trackDataPromises = files.map(async (file) => {
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

      return {
        title: metadata.common.title,
        artist: metadata.common.artist,
        year: metadata.common.year,
        duration: metadata.format.duration,
        url: relativeTrackUrl,
        poster: posterData,
      };
    });

    const tracks = await Promise.all(trackDataPromises);
    const tracksToInsert = tracks.filter((track) => !track.skip);
    if (tracksToInsert.length > 0) {
      await trackModel.insertMany(tracksToInsert);
    }

    const skippedTracks = tracks.filter((track) => track.skip);
    if (skippedTracks.length > 0) {
      return res.render("skip", { skippedTracks });
    }

    return res.redirect("/");
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
    res.render("songs", { songs });
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = { getUploadPage, postUploadTrack, showAllSongs };
