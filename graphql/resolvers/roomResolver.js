const Room = require("../../models/room/room");
const Service = require("../../models/service/service");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const Access = require("../../models/accessgroup/accessgroup");
const _ = require("lodash");
const {
  AccessGroupUser
} = require("../../models/accessGroupUser/accessgroupuser");

const resolver = {
  Query: {
    rooms: async (parent, booking, { user }) => {
      if (!user) {
        throw new Error("not authorized");
      }
      /*if (user.admin) {
        return Room.find({});
      }*/
      /*let accessgroupuser = await AccessGroupUser.find({ userId: user.id });
      console.log("accessgroupuser:", accessgroupuser);
      let accessgrouproom = await AccessGroupRoom.find({
        accessGroupId: { $in: accessgroupuser.map(item => item.accessGroupId) }
      });
      console.log("accessgrouproom", accessgrouproom);
*/
      let rooms = Room.find({
        _id: { $in: accessgrouproom.map(item => item.roomId) }
      });
      console.log("rooms", rooms);

      if (_.isEmpty(list)) {
        throw new Error("Missing access, talk with admin!");
      }
      const accessgroups = await AccessGroup.find({
        _id: { $in: list.map(item => item.accessGroupId) }
      });

      let list = await AccessGroupRoom.find({
        accessGroupId: { $in: access.map(item => item) }
      });
      return Room.find({
        _id: { $in: list.map(item => item.roomId) }
      });
    },
    room: async (_parent, args) => Room.findById({ _id: args.id }),
    roomByService: (_parent, args) => Room.find({ serviceId: args.id }),
    roomsWithAccessGroup: async (_parent, args) => {
      let list = await AccessGroupRoom.find({ accessGroupId: args.id });
      return Room.find({
        _id: { $in: list.map(item => item.roomId) }
      });
    }
  },
  Mutation: {
    addRoom: async (_parent, args) => {
      const newRoom = await new Room(args).save();

      // if Access Group IDs are given
      if (!_.isEmpty(args.accessGroupIds)) {
        await AccessGroupRoom.collection.insert(
          args.accessGroupIds.map(accessGroupId => ({
            roomId: newRoom.id,
            accessGroupId: accessGroupId
          }))
        );
      }

      return newRoom;
    },
    removeRoom: async (_parent, args) => {
      AccessGroupRoom.deleteMany({ roomId: args.id });

      return await Room.findByIdAndRemove({ _id: args.id });
    },
    updateRoom: async (_parent, args) => {
      console.log(args);
      // Check if the accessGroupIds argument is given:
      if (!_.isUndefined(args.accessGroupIds)) {
        console.log(args.accessGroupIds);
        await AccessGroupRoom.deleteMany({ roomId: args.id });

        // If given a non-empty list, insert new room accesses
        if (!_.isEmpty(args.accessGroupIds)) {
          await AccessGroupRoom.collection.insert(
            args.accessGroupIds.map(accessGroupId => ({
              roomId: args.id,
              accessGroupId: accessGroupId
            }))
          );
        }
      }

      return await Room.findOneAndUpdate({ _id: args.id }, { ...args });
    }
  },
  Room: {
    service(parent) {
      return Service.findById({ _id: parent.serviceId });
    },
    async accessGroups(parent) {
      let list = await AccessGroupRoom.find({ roomId: parent._id });
      return Access.find({
        _id: { $in: list.map(item => item.accessGroupId) }
      });
    }
  }
};

module.exports = resolver;
