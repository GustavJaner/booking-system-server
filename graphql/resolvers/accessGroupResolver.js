const Access = require("../../models/accessgroup/accessgroup");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const Room = require("../../models/room/room");


const resolver = {
  Query: {
    accessGroups: () => Access.find({}),
  },
  Mutation: {
    addAccessGroup: (parent, access) => {
      const newAccess = new Access(access);
      return newAccess.save();
    },
    updateAccessGroup: (parent, access) => {
      return Access.findOneAndUpdate(
        { _id: access.id },
        { ...access },
        { upsert: false }
      );
    },
    removeAccessGroup: (parent, access) => {
      return Access.remove({ _id: access.id });
    },
  },
  AccessGroup: {
    async rooms(parent) {
      let list = await AccessGroupRoom.find({ accessGroupId: parent._id });
      return await list.map(item => Room.findById({ _id: item.roomId }));
    }
  },
};

module.exports = resolver;
