const Room = require("../../models/room/room");
const Service = require("../../models/service/service");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const Access = require("../../models/accessgroup/accessgroup");
const _ = require("lodash");


const resolver = {
  Query: {
    rooms: () => Room.find({}),
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
      const newRoom = await (new Room(args)).save();

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

      return await Room.findByIdAndRemove({ _id: args.id })
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
              accessGroupId: accessGroupId,
            })),
          );
        }
      };
      
      return await Room.findOneAndUpdate(
        { _id: args.id },
        { ...args },
      );
    },
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
    },
  },
};

module.exports = resolver;
