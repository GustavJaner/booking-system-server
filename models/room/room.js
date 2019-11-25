const { Schema, model } = require("mongoose");

const RoomSchema = new Schema({
  bookingIds: [String],
  start: Date,
  end: Date,
  duration: Int,
  name: String,
  adress: String,
  description: String,
  serviceId: Int
});
RoomSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const Room = model("post", RoomSchema);

module.exports = Room;
