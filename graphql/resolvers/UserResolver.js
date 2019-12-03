const _ = require("lodash");
const User = require("../../models/user/user");
const AccessGroup = require("../../models/accessgroup/accessgroup");
const AccessGroupUser = require("../../models/accessgroupuser/accessGroupUser");


const resolver = {
  Query: {
    users: async () => await User.find({}),
    user: async (_parent, args) => await User.findById({ _id: args.id }),
  },
  Mutation: {
    addUser: async (_parent, args) => {
      const newUser = await (new User(args)).save();

      // if Access Group IDs are given
      if (!_.isEmpty(args.accessGroupIds)) {
        await AccessGroupUser.collection.insert(
          args.accessGroupIds.map(accessGroupId => ({
            userId: newUser.id,
            accessGroupId: accessGroupId,
          })),
        );
      }

      return newUser;
    },
    removeUser: async (_parent, args) => {
      AccessGroupUser.deleteMany({ userId: args.id });

      return await User.findByIdAndDelete({ _id: args.id });
    },
    updateUser: async (_parent, args) => {
      // Check if the accessGroupIds argument is given:
      if (!_.isUndefined(args.accessGroupIds)) {
        await AccessGroupUser.deleteMany({ userId: args.id });
        
        // If given a non-empty list, insert new user accesses
        if (!_.isEmpty(args.accessGroupIds)) {
          await AccessGroupUser.collection.insert(
            args.accessGroupIds.map(accessGroupId => ({
              userId: args.id,
              accessGroupId: accessGroupId,
            })),
          );
        }
      };

      return await User.findOneAndUpdate(
        { _id: args.id },
        { ...args },
      );
    },
  },
  User: {
    async accessGroups(parent) {
      let list = await AccessGroupUser.find({ userId: parent._id });

      return await AccessGroup.find({
        _id: { $in: list.map(item => item.accessGroupId) },
      });
    },
  },
};

module.exports = resolver;
