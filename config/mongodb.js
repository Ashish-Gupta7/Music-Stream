const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoDB");

const dbURI = process.env.MONGO_DB_URI;
// const dbURI = process.env.mongoDbAtlas;

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    dbgr(
      `Connected to MongoDB - Host: ${result.connection.host}, Database: ${result.connection.name}`
    );
  })
  .catch((err) => {
    dbgr(`Failed to connect to MongoDB: ${err.message}`);
  });

module.exports = mongoose.connection;
