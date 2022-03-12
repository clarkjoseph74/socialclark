var express = require("express");
const res = require("express/lib/response");
const Like = require("../models/like");
var router = express.Router();

router.get("/getLike/:postID", (req, res, next) => {
  Like.find({ postID: req.params.postID })
    .then((result) => {
      res.status(200).json({ message: result });
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});

router.post("/addlike", (req, res, next) => {
  const newLike = new Like({
    user: req.body.user,
    postID: req.body.postID,
  });
  newLike
    .save()
    .then((result) => {
      res.status(200).json({ message: "liked" });
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});

module.exports = router;
