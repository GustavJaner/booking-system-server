const { Schema, model } = require("mongoose");

const bookingSchema = new Schema({
  date: String,
  startTime: String,
  endTime: String,
  userId: String,
  roomId: String
});
bookingSchema.index({ roomId: 1, date: 1, startTime: 1 }, { unique: true });

bookingSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const Booking = model("booking", bookingSchema);

module.exports = Booking;
