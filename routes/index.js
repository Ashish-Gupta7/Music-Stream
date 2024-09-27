const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/index-controller");

const {
  isLoggedIn,
  redirectIfLoggedIn,
} = require("../middlewares/login-middleware");

router.get("/", isLoggedIn, homeController);

router.get("/login", redirectIfLoggedIn, getLoginController);

router.get("/register", redirectIfLoggedIn, getRegisterController);

router.post("/register", postRegisterController);

router.post("/login", postLoginController);

router.get("/logout", isLoggedIn, logoutController);

router.post("/uploader", isLoggedIn, uploaderHomeUpdate);

router.get("/home", isLoggedIn, showHomePageController);

router.get("/home/search", isLoggedIn, showHomeAfterSearch);

router.post("/home/favourite", isLoggedIn, addFavouriteSong);

module.exports = router;
