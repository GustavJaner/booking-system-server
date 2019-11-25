const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  title: String,
  content: String
});
postSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const Post = model("post", postSchema);

module.exports = Post;
