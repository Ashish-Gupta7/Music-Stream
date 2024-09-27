const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isUploader: {
      type: Boolean,
      default: false,
    },
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "track",
      },
    ],
    playlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "playlist",
      },
    ],
    profileImage: {
      type: String,
      default: "defaultProfile.jpg",
    },
  },
  { timestamps: true }
);

function userValidate(data) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(20).trim().required(),
    password: Joi.string().min(4).required(),
    email: Joi.string().email().lowercase().trim().required(),
  });

  const { error } = schema.validate(data);
  return error;
}

const userModel = mongoose.model("user", userSchema);
module.exports = { userModel, userValidate };
