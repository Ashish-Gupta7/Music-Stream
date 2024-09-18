const playlistModel = require("../models/playlist-model");
const { userModel } = require("../models/user-model");

const getCreatePlaylist = (req, res) => {
  res.render("playlist");
};

const postCreatePlaylist = async (req, res) => {
  let user = req.user;
  let { name } = req.body;

  let newPlaylist = await playlistModel.create({
    name,
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
};

const showPlaylist = async (req, res) => {
  let user = req.user;
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
        console.error(err);
        return null;
      }
    })
  );

  res.render("showPlaylist", { playlists });
};

module.exports = { getCreatePlaylist, postCreatePlaylist, showPlaylist };
