const { Schema, model } = require("mongoose");

const OrganizationUserSchema = new Schema({
  organization: String,
  user: String,
});
accessGroupRoom.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const AccessGroupRoom = model("OrganizationUser", OrganizationUserSchema);

module.exports = AccessGroupRoom;
