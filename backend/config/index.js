require("dotenv").config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  SECRET: process.env.SECRET,
  PORT: process.env.PORT,
};
