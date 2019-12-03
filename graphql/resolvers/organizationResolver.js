const Organization = require("../../models/organization/organization");
const User = require("../../models/user/user");
const AccessGroup = require("../../models/accessgroup/accessgroup");


const resolver = {
  Query: {
    organizations: () => Organization.find({}),
    organization: (_, args) => Organization.findById({ _id: args.id }),
  },
  Mutation: {
    addOrganization: async (_, args) => {
      const newOrganization = await (new Organization(args)).save();
      const adminAccessGroup = await (new AccessGroup({ description: `Admin${args.name}` })).save();
      const adminUser = await User.findById({ _id: args.adminId });

      var accessList = adminUser.accessGroupIds;
      accessList.push(adminAccessGroup.id);

      await User.findOneAndUpdate(
        { _id: args.adminId },
        { accessGroupIds: accessList },
        { upsert: false }
      );

      return newOrganization;
    },
  },
  Organization: {
    async admins(parent) {
      let list = await User.find({ _id: parent.id });
    }
  },
};

module.exports = resolver;
