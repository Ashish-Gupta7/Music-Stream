const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "track") {
      cb(null, "./public/music");
    } else if (file.fieldname === "image") {
      cb(null, "./public/images/picture");
    }
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, buf) => {
      if (err) {
        return cb(err);
      }
      const fn = buf.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "track", maxCount: 5 },
  { name: "image", maxCount: 1 },
]);

module.exports = upload;
