const Post = require("../models/post/post");
const Room = require("../models/room/room");
const Service = require("../models/service/service");
const Booking = require("../models/booking/booking");
const User = require("../models/user/user");
const Access = require("../models/accessgroup/accessgroup");
const AccessGroupRoom = require("../models/accessgrouproom/accessgrouproom");
const _ = require("lodash");
const POST_UPDATED = "POST_UPDATED";

const resolvers = {
  Query: {
    posts: () => Post.find({}),
    post: (_, args) => Post.findById({ _id: args.id }),
    rooms: () => Room.find({}),
    room: async (_, args) => Room.findById({ _id: args.id }),
    services: () => Service.find({}),
    service: (_, args) => Service.findById({ _id: args.id }),
    roomByService: (_, args) => Room.find({ serviceId: args.id }),
    booking: () => (_, args) => Booking.findById({ id_: args.id }),
    bookings: () => Booking.find({}),
    bookingsByRoom: (_, args) => Booking.find({ roomId: args.id }),
    users: () => User.find({}),
    accessGroups: () => Access.find({}),
    accessGroupRooms: () => AccessGroupRoom.find({})
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
    }
  },
  Booking: {
    user(parent) {
      return User.findById({ _id: parent.userId });
    },
    room(parent) {
      return Room.findById({ _id: parent.roomId });
    }
  },
  AccessGroup: {
    async rooms(parent) {
      let list = await AccessGroupRoom.find({ accessGroupId: parent._id });
      return await list.map(item => Room.findById({ _id: item.roomId }));
    }
  },
  User: {
    accessGroup(parent) {
      return Access.findById({ _id: parent.accessGroup });
    }
  },
  AccessGroupRoom: {
    room(parent) {
      return Room.findById({ _id: parent.roomId });
    },
    accessGroup(parent) {
      return Access.findById({ _id: parent.accessGroupId });
    }
  },
  Subscription: {
    postUpdated: {
      subscribe: (_, args, { pubsub }) => pubsub.asyncIterator([POST_UPDATED])
    }
  },
  Mutation: {
    addPost: async (parent, post, { pubsub }) => {
      const { title, content } = post;
      const newPost = new Post({ title, content });

      const createdPost = await newPost.save();
      pubsub.publish(POST_UPDATED, { postUpdated: { added: createdPost } });

      return createdPost;
    },
    removePost: (parent, post, { pubsub }) => {
      const { id } = post;
      pubsub.publish(POST_UPDATED, {
        postUpdated: { removed: { id: post.id } }
      });
      return Post.findByIdAndRemove({ _id: id })
        .then(() => true)
        .catch(() => false);
    },
    updatePost: (parent, post, { pubsub }) => {
      pubsub.publish(POST_UPDATED, { postUpdated: { updated: post } });
      return Post.findOneAndUpdate(
        { _id: post.id },
        { ...post },
        { upsert: false }
      );
    },
    addUser: async (_, args) => {
      const newUser = new User(args);
      const createdUser = await newUser.save();
      return createdUser;
    },
    removeUser: async (_, args) => {
      return User.findByIdAndDelete({ _id: args.id })
        .then(() => true)
        .catch(() => false);
    },
    updateUser: async (_, args) => {
      return User.findOneAndUpdate(
        { _id: args.id },
        { ...args },
        { upsert: false }
      );
    },
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
    removeRoom: (parent, room, { pubsub }) => {
      AccessGroupRoom.remove({
        roomId: room.id
      });
      return Room.findByIdAndRemove({ _id: room.id })
        .then(() => true)
        .catch(() => false);
    },
    addService: (parent, service, { pubsub }) => {
      const newService = new Service({ name: service.name });
      return newService.save();
    },
    updateService: (parent, service, { pubsub }) => {
      return Service.findOneAndUpdate(
        { _id: service.id },
        { ...service },
        { upsert: false }
      );
    },
    removeService: (parent, service, { pubsub }) => {
      return Service.findByIdAndRemove({ _id: service.id })
        .then(() => true)
        .catch(() => false);
    },
    addBooking: (parent, booking, { pubsub }) => {
      const newBooking = new Booking(booking);
      return newBooking.save();
    },

    updateBooking: (parent, booking, { pubsub }) => {
      return Booking.findOneAndUpdate(
        { _id: booking.id },
        { ...booking },
        { upsert: false }
      );
    },
    removeBooking: (parent, booking, { pubsub }) => {
      return Booking.findByIdAndRemove({ _id: booking.id })
        .then(() => true)
        .catch(() => false);
    },
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
    }
  }
};
module.exports = resolvers;
