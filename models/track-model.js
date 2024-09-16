const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    artist: {
      type: String,
    },
    year: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    album: {
      type: String,
    },
    url: {
      type: String,
    },
    poster: {
      type: String,
      default: "defaultPoster.jpg",
    },
  },
  { timestamps: true }
);

const trackModel = mongoose.model("track", trackSchema);
module.exports = trackModel;
