const AccessGroup = require("../../models/accessgroup/accessgroup");
const Room = require("../../models/room/room");
const User = require("../../models/user/user");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const AccessGroupUser = require("../../models/accessgroupuser/accessGroupUser");


const resolver = {
  Query: {
    accessGroups: async () => await AccessGroup.find({}),
    accessGroup: async (_parent, args) => await AccessGroup.findById({ _id: args.id }),
  },
  Mutation: {
    addAccessGroup: async (_, args) => {
      const newAccessGroup = await (new AccessGroup(args)).save();

      return newAccessGroup;
    },
    removeAccessGroup: async (_, args) => {
      AccessGroupRoom.deleteMany({ accessGroupId: args.id });
      AccessGroupUser.deleteMany({ accessGroupId: args.id });

      // return await AccessGroup.findByIdAndDelete({ _id: args.id });
      return AccessGroup.findByIdAndDelete({ _id: args.id })
        .then(() => true)
        .catch(() => false);
    },
    updateAccessGroup: async (_, args) => {
      return await AccessGroup.findOneAndUpdate(
        { _id: args.id },
        { ...args },
      );
    },
  },
  AccessGroup: {
    async rooms(parent) {
      let list = await AccessGroupRoom.find({ accessGroupId: parent._id });
      return list.map(async (item) => await Room.findById({ _id: item.roomId }));
    },
    async users(parent) {
      let list = await AccessGroupUser.find({ accessGroupId: parent._id });
      return list.map(async (item) => await User.findById({ _id: item.userId }));
    },
  }
};

module.exports = resolver;
