const { Schema, model } = require("mongoose");

const accessGroupRoom = new Schema({
  roomId: String,
  accessGroupId: String
});
accessGroupRoom.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const AccessGroupRoom = model("accessgrouproom", accessGroupRoom);

module.exports = AccessGroupRoom;
