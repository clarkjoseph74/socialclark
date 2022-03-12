var express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");

var router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/posts/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

const Post = require("../models/post");
const User = require("../models/user");
const { route } = require("./users");

router.get("/allposts", (req, res, next) => {
  Post.find()
    .populate("authorID", "name photo")
    .populate("likes", "name photo")
    .then((posts) => {
      let sortedPosts = posts.sort((a, b) => b.dateTime - a.dateTime);
      console.log(sortedPosts[0].likes.length);
      res.status(200).json({ message: "all Posts", result: sortedPosts });
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});

router.delete("/deleteall", (req, res, next) => {
  Post.deleteMany()
    .then((posts) => {
      res.status(200).json({ message: "all Posts Deleted" });
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});

router.post("/createpost", upload.single("imgContent"), (req, res, next) => {
  console.log(req.file);
  let image = "";
  if (typeof req.file == "undefined") {
    image = "";
  } else {
    image = req.file.filename;
  }
  const newPost = new Post({
    authorID: req.body.authorID,
    title: req.body.title,
    textContent: req.body.textContent,
    imgContent: image,
    likesCount: 0,
  });

  newPost
    .save()
    .then((result) => {
      res.status(200).json({
        message: "Post Created",
        result: result,
      });
    })
    .catch((postCreatingError) => {
      res.status(404).json({ message: postCreatingError.message });
    });
});

router.delete("/deletepost/:postid", (req, res, next) => {
  Post.findByIdAndDelete(req.params.postid)
    .then((result) => {
      res.status(200).json({ message: "post deleted" });
    })
    .catch((err) => {
      print(err);
      res.status(404).json({ message: err.message });
    });
});

router.get("/likesAndcomments/:postID", (req, res, next) => {
  Post.findById(req.params.postID)
    .populate("likes", "name photo")
    .populate("comments", "name photo")
    .then((result) => {
      res.status(200).json({
        message: "got",
        result: result,
      });
    })
    .catch((err) => {
      res.status(404).json({
        message: err.message,
      });
    });
});

router.get("/followingposts/:userID", (req, res, next) => {
  User.findById(req.params.userID)
    .then((user) => {
      let userFollowing = user.following;

      Post.find({ authorID: userFollowing })
        .populate("authorID", "name  photo")
        .populate("comments.user", "name photo")
        .populate("likes", "name photo")
        .then((result) => {
          let sortedPosts = result.sort((a, b) => b.dateTime - a.dateTime);
          console.log(sortedPosts[0].likes.length);
          res
            .status(200)
            .json({ message: "Following Posts", result: sortedPosts });
        })
        .catch((err) => {
          res.status(202).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(202).json({ message: err.message });
    });
});
router.get("/userposts/:userID", (req, res, next) => {
  Post.find({ authorID: req.params.userID })
    .populate("authorID", "name  photo")
    .populate("comments.user", "name photo")
    .populate("likes", "name photo")
    .then((result) => {
      let sortedPosts = result.sort((a, b) => b.dateTime - a.dateTime);
      res.status(200).json({ message: "UserPosts", result: sortedPosts });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(404).json({ message: err.message });
    });
});

router.patch("/addLike/:userID/:postID", (req, res, next) => {
  Post.findByIdAndUpdate(req.params.postID)
    .then((post) => {
      if (post.likes.includes(req.params.userID)) {
        const index = post.likes.indexOf(req.params.userID);
        if (index > -1) {
          post.likes.splice(index, 1);
          post.isLiked = false;
          post.likesCount -= 1;
        }
        post
          .save()
          .then((result) => {
            res.status(200).json({ message: "Unliked", result: result });
          })
          .catch((err) => {
            res.status(404).json({ message: err.message });
          });
      } else {
        post.likes.push(req.params.userID);
        post.isLiked = true;
        post.likesCount += 1;
        post
          .save()
          .then((result) => {
            res.status(200).json({ message: "Liked", result: result });
          })
          .catch((err) => {
            res.status(404).json({ message: err.message });
          });
      }
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});

router.patch("/addComment/:postID", (req, res, next) => {
  Post.findByIdAndUpdate(req.params.postID)
    .then((result) => {
      result.comments.push({
        user: req.body.userID,
        content: req.body.content,
      });
      result.commentsCount += 1;
      result
        .save()
        .then((result) => {
          res.status(200).json({ message: "Comment Added", result: result });
        })
        .catch((err) => {
          res.status(404).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});
router.delete("/deleteComment/:postID/:commentID", (req, res, next) => {
  Post.findById(req.params.postID)
    .then((result) => {
      for (let comment in result.comments) {
        console.log(result.comments[comment].id);
        if (result.comments[comment].id == req.params.commentID) {
          result.comments.splice(comment, 1);

          result
            .save()
            .then((result) => {
              res
                .status(200)
                .json({ message: "Comment Deleted", result: result });
            })
            .catch((err) => {
              res.status(404).json({ message: err.message });
            });
        } else {
          console.log("ElsE");
        }
      }
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});
router.get("/getpostcomments/:postID", (req, res, next) => {
  Post.findById(req.params.postID)
    .populate("comments.user", "name photo")
    .then((result) => {
      res.status(200).json({ message: "Comments ", result: result.comments });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(404).json({ message: err.message });
    });
});
module.exports = router;
