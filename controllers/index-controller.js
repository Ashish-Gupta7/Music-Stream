const bcrypt = require("bcrypt");
const dbgr = require("debug")("development:auth");

const { userValidate, userModel } = require("../models/user-model");
const { generateToken } = require("../utils/index-token-utils");
const trackModel = require("../models/track-model");

const getLoginController = (req, res) => {
  res.render("login");
};

const getRegisterController = (req, res) => {
  res.render("register");
};

const postRegisterController = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (user) {
      return res.status(409).render("error", {
        err: "User with this email already exists.",
        status: 409,
      });
    }

    let err = userValidate({ username, email, password });
    if (err) {
      return res.status(400).render("error", { err: err.message, status: 400 });
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        dbgr(`Error during genSalt: ${err.message}`);
        return res.status(500).render("error", {
          err: "An error occurred on the server. Please try again later.",
          status: 500,
        });
      }

      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          dbgr(`Error during password hashing: ${err.message}`);
          return res.status(500).render("error", {
            err: "An error occurred on the server. Please try again later.",
            status: 500,
          });
        }

        try {
          const newUser = await userModel.create({
            username,
            email,
            password: hash,
          });
          const token = generateToken(newUser);
          res.cookie("token", token, {
            httpOnly: true,
          });
          res.status(201).redirect("/");
        } catch (err) {
          dbgr(`Error during user creation: ${err.message}`);
          return res.status(500).render("error", {
            err: "An error occurred on the server. Please try again later.",
            status: 500,
          });
        }
      });
    });
  } catch (err) {
    dbgr(`Error during registration: ${err}`);
    return res
      .status(500)
      .render("error", { err: "Internal server error.", status: 500 });
  }
};

const postLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).render("error", {
        err: "Incorrect email or password.",
        status: 401,
      });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        dbgr(`Error comparing passwords: ${err.message}`);
        return res.status(500).render("error", {
          err: "An error occurred on the server. Please try again later.",
          status: 500,
        });
      }
      if (result) {
        const token = generateToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        res.status(200).redirect("/");
      } else {
        res.status(401).render("error", {
          err: "Incorrect email or password.",
          status: 401,
        });
      }
    });
  } catch (err) {
    dbgr(`Error during login: ${err.message}`);
    return res
      .status(500)
      .render("error", { err: "Internal server error.", status: 500 });
  }
};

const logoutController = (req, res) => {
  try {
    res.cookie("token", "");
    res.status(200).redirect("/");
  } catch (err) {
    dbgr(`Error during logout: ${err.message}`);
    res.status(500).render("error", {
      err: "Internal server error. Please try again later.",
      status: 500,
    });
  }
};

const homeController = async (req, res) => {
  try {
    res.status(200).redirect("/home");
  } catch (err) {
    dbgr(`Error redirecting to home: ${err.message}`);
    res.status(500).render("error", {
      err: "Internal server error. Please try again later.",
      status: 500,
    });
  }
};

const showHomePageController = async (req, res) => {
  try {
    let songs = await trackModel.find();
    let user = await userModel.findOne({ _id: req.user.id });
    let context = "create-playlist"; // dynamically rendering createPlaylist page

    res.status(200).render("home", {
      isUploader: req.user.isUploader,
      username: req.user.username,
      songs,
      user,
      context,
    });
  } catch (err) {
    dbgr(`Error rendering homepage: ${err.message}`);
    res.status(500).render("error", {
      err: "Unable to load the homepage. Please try again later.",
      status: 500,
    });
  }
};

const showHomeAfterSearch = async (req, res) => {
  try {
    let songs = await trackModel.find();
    let searchQuery = req.query.search.toLowerCase();
    let searchedSong = songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery)
    );
    let remainingSongs = songs.filter(
      (song) => !song.title.toLowerCase().includes(searchQuery)
    );
    let updatedSongs = [...searchedSong, ...remainingSongs];

    let user = await userModel.findOne({ _id: req.user.id });

    res.status(200).render("home", {
      isUploader: req.user.isUploader,
      username: req.user.username,
      songs: updatedSongs,
      user,
    });
  } catch (err) {
    dbgr(`Error processing search: ${err.message}`);
    res.status(500).render("error", {
      err: "Internal server error while searching. Please try again later.",
      status: 500,
    });
  }
};

const uploaderHomeUpdate = async (req, res) => {
  try {
    let user = req.user;
    let { uploader } = req.body;

    uploader = uploader === "on" ? true : false;

    if (uploader) {
      await userModel.findOneAndUpdate(
        { _id: user._id },
        {
          isUploader: uploader,
        }
      );
      return res.status(200).redirect("/");
    }
  } catch (err) {
    dbgr(`Error during uploaderHomeUpdate: ${err.message}`);
    return res
      .status(500)
      .render("error", { err: "Internal Server Error", status: 500 });
  }
};

const addFavouriteSong = async (req, res) => {
  try {
    const { songId, isFav } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const songIndex = user.favourites.indexOf(songId);

    if (isFav && songIndex === -1) {
      user.favourites.push(songId);
    } else if (!isFav && songIndex !== -1) {
      user.favourites.splice(songIndex, 1);
    }

    await user.save();
    res.status(200).json({ message: "Favourite status updated successfully!" });
  } catch (error) {
    dbgr(`Error updating favourite status: ${err.message}`);
    res.status(500).json({ message: "Failed to update favourite status" });
  }
};

module.exports = {
  getLoginController,
  getRegisterController,
  postRegisterController,
  postLoginController,
  logoutController,
  homeController,
  uploaderHomeUpdate,
  showHomePageController,
  showHomeAfterSearch,
  addFavouriteSong,
};
