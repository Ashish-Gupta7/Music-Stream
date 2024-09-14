const bcrypt = require("bcrypt");
const dbgr = require("debug")("development:auth");

const { userValidate, userModel } = require("../models/user-model");

const { generateToken } = require("../utils/index-token-utils");

const getLoginController = (req, res) => {
  res.render("index");
};

const getRegisterController = (req, res) => {
  res.render("index");
};

const postRegisterController = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (user) {
      return res
        .status(409)
        .render("error", { err: "User already exists.", status: 409 });
    }

    let err = userValidate({ username, email, password });
    if (err) {
      return res.status(400).render("error", { err: err.message, status: 400 });
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        dbgr(`Error during genSalt: ${err.message}`);
        return res.status(500).render("error", {
          err: "Error in password encryption.",
          status: 500,
        });
      }

      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          dbgr(`Error during password hashing: ${err.message}`);
          return res.status(500).render("error", {
            err: "Error in password hashing.",
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
          res.redirect("/profile");
        } catch (err) {
          dbgr(`Error during user creation: ${err.message}`);
          return res
            .status(500)
            .render("error", { err: "Failed to create user.", status: 500 });
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
        err: "Invalid email or password.",
        status: 401,
      });
    }
    try {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return err.message;
        if (result) {
          const token = generateToken(user);
          res.cookie("token", token, {
            httpOnly: true,
          });
          res.redirect("/profile");
        } else {
          res.status(401).render("error", {
            err: "Invalid email or password.",
            status: 401,
          });
        }
      });
    } catch (err) {
      dbgr(`Error during bcrypt-compare: ${err.message}`);
      return res
        .status(500)
        .render("error", { err: "Internal server error.", status: 500 });
    }
  } catch (err) {
    dbgr(`Error during login: ${err.message}`);
    return res
      .status(500)
      .render("error", { err: "Internal server error.", status: 500 });
  }
};

const logoutController = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
};

const profileController = async (req, res) => {
  res.render("profile");
};

module.exports = {
  getLoginController,
  getRegisterController,
  postRegisterController,
  postLoginController,
  logoutController,
  profileController,
};
