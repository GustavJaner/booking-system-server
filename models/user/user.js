const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  name: String,
  email: String,
  token: String,
});

UserSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const User = model("User", UserSchema);

module.exports = User;

// module.exports = model("User", UserSchema);
