const musicMetadata = require("music-metadata");
const trackModel = require("../models/track-model");
const dbgr = require("debug")("development:musicController");

const getUploadPage = (req, res) => {
  res.render("upload");
};

// const postUploadTrack = async (req, res) => {
//   try {
//     const trackUrl = req.file.path;
//     const metadata = await musicMetadata.parseFile(trackUrl);
//     let posterData = "";

//     if (metadata.common.picture && metadata.common.picture.length > 0) {
//       const picture = metadata.common.picture[0];
//       const imageBuffer = picture.data;
//       const imageMime = picture.format;
//       const base64Image = `data:${imageMime};base64,${imageBuffer.toString(
//         "base64"
//       )}`;
//       posterData = base64Image;
//     }

//     const newTrack = await trackModel.create({
//       title: metadata.common.title,
//       artist: metadata.common.artist,
//       year: metadata.common.year,
//       duration: metadata.format.duration,
//       url: trackUrl,
//       poster: posterData,
//     });

//     res
//       .status(201)
//       .json({ message: "Track uploaded successfully", track: newTrack });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({ error: "Error uploading track" });
//   }
// };

const postUploadTrack = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .render("error", { err: "No Files Uploaded!", status: 400 });
    }

    const trackDataPromises = files.map(async (file) => {
      const trackUrl = file.path;
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

      return {
        title: metadata.common.title,
        artist: metadata.common.artist,
        year: metadata.common.year,
        duration: metadata.format.duration,
        url: trackUrl,
        poster: posterData,
      };
    });

    const tracks = await Promise.all(trackDataPromises);
    await trackModel.insertMany(tracks);

    return res.redirect("/");
  } catch (err) {
    dbgr(`Error During postUploadTrack: ${err.message}`);
    res
      .status(500)
      .render("error", { err: "Error Uploading Tracks", status: 500 });
  }
};

module.exports = { getUploadPage, postUploadTrack };
