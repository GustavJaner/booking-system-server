const Room = require("../../models/room/room");
const Service = require("../../models/service/service");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const Access = require("../../models/accessgroup/accessgroup");
const _ = require("lodash");
const AccessGroupUser = require("../../models/accessGroupUser/accessGroupUser");

const getAccessGroupRoom = async user => {
  accessGroupUser = await AccessGroupUser.find({ userId: user.id });
  if (!accessGroupUser) {
    throw new Error("talk with admin, no access");
  }

  let accessGroupRoom = await AccessGroupRoom.find({
    accessGroupId: { $in: accessGroupUser.map(item => item.accessGroupId) }
  });
  if (!accessGroupRoom) {
    throw new Error(
      "talk with admin, issue with your access & room connection"
    );
  }
  return accessGroupRoom;
};

const resolver = {
  Query: {
    rooms: async (parent, booking, { user }) => {
      if (!user) {
        throw new Error("not authorized");
      }

      if (user.admin) {
        return Room.find({});
      }
      
      let accessGroupRoom = await getAccessGroupRoom(user);

      return await Room.find({
        _id: { $in: accessGroupRoom.map(item => item.roomId) }
      });
    },
    room: async (_parent, args) => Room.findById({ _id: args.id }),
    roomByService: async (_parent, args, { user }) => {
      let accessGroupRoom = getAccessGroupRoom(user);
      return await Room.find({
        _id: { $in: accessGroupRoom.map(item => item.roomId) }
      }).filter(room => room.serviceId === args.id);
    }
  },
  Mutation: {
    addRoom: async (_parent, args, { user }) => {
      if (!user || !user.admin) {
        throw new Error("not authorized");
      }
      if (user.admin) {
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
      }
      throw new Error("not authorized");
    },
    removeRoom: async (_parent, args, { user }) => {
      if (!user || !user.admin) {
        throw new Error("not authorized");
      }
      if (user.admin) {
        AccessGroupRoom.deleteMany({ roomId: args.id });
        return await Room.findByIdAndRemove({ _id: args.id });
      }
    },
    updateRoom: async (_parent, args, { user }) => {
      if (!user || !user.admin) {
        throw new Error("not authorized");
      }
      if (user.admin) {
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
