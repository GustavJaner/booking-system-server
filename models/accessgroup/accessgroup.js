const { Schema, model } = require("mongoose");

const accessSchema = new Schema({
  name: String
});
accessSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const Access = model("access", accessSchema);

module.exports = Access;
