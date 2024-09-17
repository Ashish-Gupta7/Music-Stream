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

  let saveUserPlaylist = await userModel.findOneAndUpdate(
    { _id: user._id },
    {
      $push: {
        playlists: newPlaylist._id,
      },
    },
    { new: true }
  );

  // await saveUserPlaylist.save();
  console.log(saveUserPlaylist);
  console.log(saveUserPlaylist.playlists);

  // let allPlaylists = await userModel.find({ _id: user._id });
  // console.log(allPlaylists);
};

module.exports = { getCreatePlaylist, postCreatePlaylist };
