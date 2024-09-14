const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    album: {
      type: String,
    },
    url: {
      type: String,
      required: true,
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
