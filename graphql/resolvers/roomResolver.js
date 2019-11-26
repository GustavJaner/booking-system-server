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
      const newList = await accessGroupIds.map(
        accessGroupId =>
          new AccessGroupRoom({
            roomId: createdRoom._id,
            accessGroupId
          })
      );
      newList.forEach(item => item.save());
      return createdRoom;
    },
    removeRoom: (parent, room, { pubsub }) => {
      AccessGroupRoom.remove({
        roomId: room.id
      });
      return Room.findByIdAndRemove({ _id: room.id })
        .then(() => true)
        .catch(() => false);
    },
    updateRoom: async (parent, room, { pubsub }) => {
      if (_.isEmpty(room.accessGroupIds)) {
        return Room.findOneAndUpdate(
          { _id: room.id },
          { ...room },
          { upsert: false }
        );
      } else {
        AccessGroupRoom.remove({
          roomId: room.id
        });
        let list = await accessGroupIds.map(
          id =>
            new AccessGroupRoom({
              roomId: room.id,
              accessGroupId: id
            })
        );
        list.map(item => item.save());
        delete room.accessGroupIds;
        return Room.findOneAndUpdate(
          { _id: room.id },
          { ...room },
          { upsert: false }
        );
      }
    },
  },
  Room: {
    service(parent) {
      return Service.findById({ _id: parent.serviceId });
    },
    async accessGroups(parent) {
      let list = await AccessGroupRoom.find({ roomId: parent._id });
      return await list.map(item =>
        Access.findById({ _id: item.accessGroupId })
      );
    },
  },
};

module.exports = resolver;
