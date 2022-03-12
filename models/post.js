const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const postSchema = mongoose.Schema({
  authorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
  imgContent: {
    type: String,
    default: "",
  },
  dateTime: {
    type: Date,
    default: Date.now(),
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  likesCount: {
    type: Number,
    required: true,
  },
  commentsCount: {
    type: Number,
    required: true,
    default: 0,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Post", postSchema);
