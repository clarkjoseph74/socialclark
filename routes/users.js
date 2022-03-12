var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/user");
const { json } = require("express/lib/response");
const user = require("../models/user");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/users/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const upload = multer({ storage: storage });
const {
  findOneAndDelete,
  findByIdAndDelete,
  findByIdAndUpdate,
} = require("../models/user");
const e = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .then((result) => {
      if (result.length == 0) {
        //signup
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            res.status(404).json({
              message: err,
            });
          } else {
            const user = new User({
              email: req.body.email,
              password: hash,
              name: req.body.name,
              chatRooms: {},
            });
            user
              .save()
              .then((result) => {
                res.status(200).json({
                  message: "Creating Account Success",
                  result: result,
                  statusCode: 200,
                });
              })
              .catch((err) => {
                res.status(203).json({
                  message: err.message,
                });
              });
          }
        });
      } else {
        //cant use this email
        res.status(203).json({
          message: "This email is taken !",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/signin", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .populate("followers", "name photo")
    .populate("following", "name photo")
    .then((currentUser) => {
      bcrypt
        .compare(req.body.password, currentUser.password)
        .then((isAuthenticated) => {
          if (isAuthenticated) {
            res.status(200).json({
              message: "login success",
              result: currentUser,
              statusCode: 200,
            });
          } else {
            res
              .status(203)
              .json({ message: "Wrong password", statusCode: 203 });
          }
        })
        .catch((compareError) => {
          res.status(203).json({
            message: "login Faild : " + compareError.message,
            statusCode: 203,
          });
        });
    })
    .catch((findError) => {
      res.status(203).json({ message: "Email Not Found", statusCode: 203 });
    });
});

router.get("/getuser/:id", (req, res, next) => {
  User.findById(req.params.id)
    .populate("followers", "name photo")
    .populate("following", "name photo")
    .then((result) => {
      res.status(200).json({ result: result });
    })
    .catch((err) => {
      res.status(203).json({ message: err.message });
    });
});

router.patch("/updateuser/:id", upload.single("photo"), (req, res, next) => {
  let image = "";
  if (typeof req.file != "undefined") {
    image = req.file.filename;
  } else {
    image = req.body.photo;
  }
  const newData = {
    name: req.body.name,
    photo: image,
    firebaseToken: req.body.firebaseToken,
  };
  User.findByIdAndUpdate(req.params.id, newData)
    .then((userNow) => {
      console.log(userNow.name);
      res.status(200).json({ message: "Update Success", result: userNow });
    })
    .catch((errInUpdate) => {
      res.status(404).json({ message: "Update Faild" + errInUpdate });
    });
});

router.delete("/deleteuser/:id", (req, res, next) => {
  User.findById(req.params.id).then((userFound) => {
    if (userFound != null) {
      User.findByIdAndDelete(req.params.id)
        .then((deleteResult) => {
          res.status(200).json({
            message: " User Deleted",
          });
        })
        .catch((errInDelete) => {
          res.status(404).json({ message: "delete error  : " + errInDelete });
        });
    } else {
      res.status(200).json({
        message: "Account Not Found",
      });
    }
  });
});

router.delete("/deleteall", (req, res, next) => {
  User.deleteMany({})
    .then((result) => {
      res
        .status(200)
        .json({ message: "All users deleted" })
        .catch((err) => {
          res.status(404).json({ message: err.message });
        });
    })
    .catch();
});

router.get("/allusers", (req, res, next) => {
  User.find()
    .populate("followers", "name photo email")
    .populate("following", "name photo email")
    .then((result) => {
      res.status(200).json({
        result: result,
      });
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
});

router.patch("/followuser", function (req, res, next) {
  User.findOne({ _id: req.body.userToFollowID }, function (err, userToFollow) {
    if (err) {
      res.status(404).json({ message: error.message });
    } else {
      if (userToFollow.followers.includes(req.body.currentUser)) {
        res.status(202).json({ message: "Already Followed" });
      } else {
        userToFollow.followers.push(req.body.currentUser);
        userToFollow.save(function (err) {
          if (err) {
            res.status(404).json({ message: err.message });
          } else {
            // Secondly, find the user account for the logged in user

            User.findOne(
              { _id: req.body.currentUser },
              function (error, currentUser) {
                currentUser.following.push(req.body.userToFollowID);
                if (error) {
                  res.status(404).json({ message: error.message });
                } else {
                  currentUser.save(function (errorss) {
                    if (errorss) {
                      //Handle error
                      res.status(404).json({ message: errorss.message });
                    } else {
                      res.status(200).json({ message: "Followed" });
                    }
                  });
                }
              }
            );
          }
        });
      }
    }
  });
});

router.patch("/unfollowuser", function (req, res, next) {
  User.findOne({ _id: req.body.userToFollowID }, function (err, userToFollow) {
    if (err) {
      res.status(404).json({ message: error.message });
    } else {
      if (userToFollow.followers.includes(req.body.currentUser)) {
        const index = userToFollow.followers.indexOf(req.body.currentUser);
        if (index > -1) {
          userToFollow.followers.splice(index, 1);
        }
        userToFollow.save(function (err) {
          if (err) {
            res.status(404).json({ message: err.message });
          } else {
            // Secondly, find the user account for the logged in user

            User.findOne(
              { _id: req.body.currentUser },
              function (error, currentUser) {
                const index = currentUser.following.indexOf(
                  req.body.userToFollowID
                );
                if (index > -1) {
                  currentUser.following.splice(index, 1);
                }
                if (error) {
                  res.status(404).json({ message: error.message });
                } else {
                  currentUser.save(function (errorss) {
                    if (errorss) {
                      //Handle error
                      res.status(404).json({ message: errorss.message });
                    } else {
                      res.status(200).json({ message: "Unfollowed" });
                    }
                  });
                }
              }
            );
          }
        });
      } else {
        res.status(404).json({ message: "Not Followed" });
      }
    }
  });
});

router.get("/userFollowers/:userID", (req, res, next) => {
  User.findById(req.params.userID)
    .populate("followers", "name photo")
    .then((result) => {
      res.status(200).json({ result: result.followers });
    })
    .catch((err) => {
      res.status(404).json({ messege: err.message });
    });
});

module.exports = router;
