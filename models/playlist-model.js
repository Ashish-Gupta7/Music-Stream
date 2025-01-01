const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      default: "default-image.webp",
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "track",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const playlistModel = mongoose.model("playlist", playlistSchema);
module.exports = playlistModel;
