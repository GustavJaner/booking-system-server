const { Schema, model } = require("mongoose");

const AccessGroupSchema = new Schema({
  name: String
});

AccessGroupSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const AccessGroup = model("AccessGroup", AccessGroupSchema);

module.exports = AccessGroup;
