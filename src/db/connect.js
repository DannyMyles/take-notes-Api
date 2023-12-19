require("dotenv").config();
const mongoose = require("mongoose");
const logger = require('../utils/winston')
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await logger.info("MongoDB Connected");
    console.log("DB Connected Successfully!!")
  } catch (error) {
    logger.error(`ERROR :: MongoDB Connection :: ${error}`);
    console.error("Error connecting to DB:", error);
  }
};

module.exports = connectDb