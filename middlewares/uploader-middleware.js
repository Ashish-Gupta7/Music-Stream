const dbgr = require("debug")("development:uploaderMiddleware");

const uploaderMiddleware = (req, res, next) => {
  try {
    let user = req.user;
    if (user.isUploader) {
      next();
    } else {
      dbgr(
        `Error during uploaderMiddleware: Access denied. Only artists are allowed to perform this action.`
      );
      return res.status(403).render("error", {
        err: "Access denied. Only artists are allowed to perform this action.",
        status: 403,
      });
    }
  } catch (err) {
    dbgr(`Error during uploaderMiddleware: ${err.message}`);
    return res
      .status(500)
      .render("error", { err: "Internal Server Error", status: 500 });
  }
};

module.exports = uploaderMiddleware;
