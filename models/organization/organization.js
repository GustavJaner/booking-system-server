const { Schema, model } = require("mongoose");

const OrganizationSchema = new Schema({
  name: String,
  description: String,
});

OrganizationSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
const Organization = model("Organization", OrganizationSchema);

module.exports = Organization;
