const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default:
      "https://previews.123rf.com/images/pandavector/pandavector1607/pandavector160700062/60025051-businessman-icon-flat-single-avatar-people-icon-from-the-big-avatar-collection-stock-vector.jpg",
  },
  firebaseToken: {
    type: String,
    default: "",
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  chatRooms: {
    type: Map,
    of: { type: mongoose.Schema.ObjectId, ref: "Room" },
  },
});

module.exports = mongoose.model("User", userSchema);
