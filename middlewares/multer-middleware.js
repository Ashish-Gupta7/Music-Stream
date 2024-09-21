const multer = require("multer");
const upload = require("../config/multer-config");
const dbgr = require("debug")("development:multerMiddleware");

function multerMiddleware(req, res, next) {
  upload(req, res, function (err) {
    // console.log(req.files.length);
    if (err instanceof multer.MulterError === "Unexpected field") {
      dbgr(`Error during multerMiddleware: ${err.message}`);
      return res.status(400).render("error", { err: err.message, status: 400 });
    }
    next();
  });
}

module.exports = multerMiddleware;
