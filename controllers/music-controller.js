const musicMetadata = require("music-metadata");
const trackModel = require("../models/track-model");

const getUploadPage = (req, res) => {
  res.render("upload");
};

const postUploadTrack = async (req, res) => {
  try {
    const trackUrl = req.file.path;
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
      // res.send(`<img src="${}" alt="Album Art">`);
    }

    const newTrack = await trackModel.create({
      title: metadata.common.title,
      artist: metadata.common.artist,
      year: metadata.common.year,
      duration: metadata.format.duration,
      url: trackUrl,
      poster: posterData,
    });
    console.log(newTrack);

    // await newTrack.save();
    // console.log("saved");

    res
      .status(201)
      .json({ message: "Track uploaded successfully", track: newTrack });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error uploading track" });
  }
};

module.exports = { getUploadPage, postUploadTrack };
