const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const Room = require("../../models/room/room");
const Access = require("../../models/accessgroup/accessgroup");

const resolver = {
  Query: {
    accessGroupRooms: async (_, args, { user }) => {
      if (user.admin) {
        AccessGroupRoom.find({});
      }
      throw new Error("not authorized");
    }
  },
  AccessGroupRoom: {
    room(parent) {
      return Room.findById({ _id: parent.roomId });
    },
    accessGroup(parent) {
      return Access.findById({ _id: parent.accessGroupId });
    }
  }
};

module.exports = resolver;
