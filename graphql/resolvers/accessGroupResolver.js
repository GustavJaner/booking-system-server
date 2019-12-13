const AccessGroup = require("../../models/accessgroup/accessgroup");
const Room = require("../../models/room/room");
const User = require("../../models/user/user");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const AccessGroupUser = require("../../models/accessGroupUser/accessGroupUser");


const resolver = {
  Query: {
    accessGroups: async (_, __, { user }) => {
      if (user.admin) {
        return AccessGroup.find({});
      }
      throw new Error("not authorized");
    },
    accessGroup: async (_, args, { user }) => {
      if (user.admin) {
        await AccessGroup.findById({ _id: args.id });
      }
      throw new Error("not authorized");
    }
  },

  Mutation: {
    addAccessGroup: async (_, args, { user }) => {
      if (user.admin) {
        return await new AccessGroup(args).save();
      }
      throw new Error("not authorized");
    },
    removeAccessGroup: async (_, args, { user }) => {
      if (user.admin) {
        await AccessGroupRoom.deleteMany({ accessGroupId: args.id });
        await AccessGroupUser.deleteMany({ accessGroupId: args.id });
        return await AccessGroup.findByIdAndDelete({ _id: args.id });
      }
      throw new Error("not authorized");
    },
    updateAccessGroup: async (_, args, { user }) => {
      if (user.admin) {
        return await AccessGroup.findOneAndUpdate(
          { _id: args.id },
          { ...args }
        );
      }
      throw new Error("not authorized");
    }
  },
  AccessGroup: {
    async rooms(parent) {
      let list = await AccessGroupRoom.find({ accessGroupId: parent._id });
      return Room.find({
        _id: { $in: list.map(item => item.roomId) }
      });
    },
    async users(parent) {
      let list = await AccessGroupUser.find({ accessGroupId: parent._id });
      return User.find({ _id: { $in: list.map(item => item.userId) } });
    }
  }
};

module.exports = resolver;
