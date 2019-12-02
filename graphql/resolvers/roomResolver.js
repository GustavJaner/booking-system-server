const Room = require("../../models/room/room");
const Service = require("../../models/service/service");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");
const Access = require("../../models/accessgroup/accessgroup");
const _ = require("lodash");


const resolver = {
  Query: {
    rooms: () => Room.find({}),
    room: async (_, args) => Room.findById({ _id: args.id }),
    roomByService: (_, args) => Room.find({ serviceId: args.id }),
    roomsWithAccessGroup: async (_, args, { user }) => {
      let list = await AccessGroupRoom.find({ accessGroupId: args.id });
      return Room.find({
        _id: { $in: list.map(item => item.roomId) }
      });
    }
  },
  Mutation: {
    addRoom: async (parent, room, { pubsub }) => {
      const {
        start,
        end,
        duration,
        name,
        adress,
        description,
        serviceId,
        accessGroupIds
      } = room;
      const newRoom = new Room({
        start,
        end,
        duration,
        name,
        adress,
        description,
        serviceId
      });
      const createdRoom = await newRoom.save();

      AccessGroupRoom.collection.insert(
        accessGroupIds.map(accessGroupId => ({
          roomId: createdRoom.id,
          accessGroupId: accessGroupId
        }))
      );

      return createdRoom;
    },
    removeRoom: async (parent, room, { pubsub }) => {
      await AccessGroupRoom.deleteMany({
        roomId: room.id
      });
      return Room.findByIdAndRemove({ _id: room.id })
        .then(() => true)
        .catch(() => false);
    },
    updateRoom: async (parent, room, { pubsub }) => {
      const list = await AccessGroupRoom.find({ roomId: room.id });
      if (!_.isEmpty(list)) {
        let test = await AccessGroupRoom.deleteMany({
          roomId: room.id
        });
      }
      if (!_.isEmpty(room.accessGroupIds)) {
        AccessGroupRoom.collection.insert(
          room.accessGroupIds.map(accessGroupId => {
            return { roomId: room.id, accessGroupId: accessGroupId };
          })
        );
      }
      delete room.accessGroupIds;
      return Room.findOneAndUpdate(
        { _id: room.id },
        { ...room },
        { upsert: false }
      );
    }
  },
  Room: {
    service(parent) {
      return Service.findById({ _id: parent.serviceId });
    },
    async accessGroups(parent) {
      let list = await AccessGroupRoom.find({ roomId: parent._id });
      return await Access.find({
        _id: { $in: list.map(item => item.accessGroupId) }
      });
    },
  },
};

module.exports = resolver;
