const { Schema, model } = require("mongoose");

const AccessGroupUserSchema = new Schema({
  userId: String,
  accessGroupId: String
});

AccessGroupUserSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const AccessGroupUser = model("AccessGroupUser", AccessGroupUserSchema);

module.exports = AccessGroupUser;
