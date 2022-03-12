const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const roomSchema = mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  firstUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  secondUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  lastSeenFromBool: {
    type: Boolean,
  },
  messages: {
    type: Array,
  },
});

module.exports = mongoose.model("Room", roomSchema);
