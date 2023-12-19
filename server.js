const express = require("express");
const app = express();
require("dotenv").config();
const errorHandler = require("./src/middleware/errorHandlerMiddleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDb = require("./src/db/connect");
const port = process.env.PORT || 5500;
const userRoutes = require("./src/routes/userRoutes")
const noteRoutes = require("./src/routes/noteRoutes")


// MIDDLEWARES
// Receive and post json
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Define endpoinst
app.use("/api/v1", userRoutes)
app.use("/api/v1", noteRoutes)

const server = async () => {
  try {
    await connectDb();
    app.listen(port, console.log(`Server ruuning on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};
server();
