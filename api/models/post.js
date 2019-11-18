const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  parent: mongoose.Schema.Types.ObjectId,
  link: { type: String, required: true },
  tags: { type: String, required: true },
  postImage: {
    file_id: mongoose.Schema.Types.ObjectId,
    url: { type: String, required: true }
  }
});

module.exports = mongoose.model("Post", postSchema);
