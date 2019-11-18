const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");

const app = express();

// pass corsOptions to cors:
app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const postRoutes = require("./api/routes/posts");

mongoose.connect(
  "mongodb+srv://" +
    process.env.MONGO_USER +
    ":" +
    process.env.MONGO_USER_PASSWORD +
    "@cluster0-n1cyt.gcp.mongodb.net/" +
    process.env.MONGO_DB +
    "?retryWrites=true",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

app.use(morgan("dev"));
app.use(express.json());

//routes which handles the requests

app.use("/api/v1/movie", postRoutes);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
