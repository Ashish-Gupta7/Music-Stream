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
  getProfileController,
  postUploaderController,
} = require("../controllers/index-controller");

const {
  isLoggedIn,
  redirectIfLoggedIn,
} = require("../middlewares/login-middleware");

router.post("/check", (req, res) => {
  console.log(req.body);
});

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

router.get("/profile", isLoggedIn, getProfileController);

router.post("/profile/uploader", isLoggedIn, postUploaderController);

module.exports = router;
