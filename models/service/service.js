const { Schema, model } = require("mongoose");

const serviceSchema = new Schema({
  name: String
});
serviceSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const Service = model("post", serviceSchema);

module.exports = Service;
