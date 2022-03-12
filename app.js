var createError = require("http-errors");
var express = require("express");
const http = require("http");
const port = process.env.PORT || 5000;
var server = http.createServer(app);
var io = require("socket.io")(server);

var logger = require("morgan");

const cors = require("cors");
const mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");
var likesRouter = require("./routes/likes");
const e = require("express");

var app = express();

app.use(cors());

app.use(logger("dev"));

mongoose.connect(
  "mongodb+srv://clark:1Clark23456@cluster1.prw1f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/Shopping-API",
  {
    dbName: "Shopping-API",

    useNewUrlParser: true,
    autoIndex: false,
  },

  (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Connecting to db ......");
    }
  }
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/likes", likesRouter);
app.use(express.static("images"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    errorMessage: err.message,
  });
});

module.exports = app;
