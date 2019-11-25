const { Schema, model } = require("mongoose");

const RoomSchema = new Schema({
  start: String,
  end: String,
  duration: String,
  name: String,
  adress: String,
  description: String,
  serviceId: String
});
RoomSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const Room = model("room", RoomSchema);

module.exports = Room;
