const Post = require("../models/post/post");
const Room = require("../models/room/room");
const Service = require("../models/service/service");
const Booking = require("../models/booking/booking");

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
    bookings: () => Booking.find({}),
    bookingsByRoom: (_, args) => Booking.find({ roomId: args.id })
  },
  Room: {
    service(parent) {
      return Service.findById({ _id: parent.serviceId });
    }
  },
  Booking: {
    room(parent) {
      return Room.findById({ _id: parent.roomId });
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
    addRoom: async (parent, room, { pubsub }) => {
      console.log("rooom", room);
      const {
        start,
        end,
        duration,
        name,
        adress,
        description,
        serviceId
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
      return createdRoom;
    },
    updateRoom: (parent, room, { pubsub }) => {
      return Room.findOneAndUpdate(
        { _id: room.id },
        { ...room },
        { upsert: false }
      );
    },
    removeRoom: (parent, room, { pubsub }) => {
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
      const { date, startTime, endTime, id, bookedBy, roomId } = booking;
      const newBooking = new Booking(booking);
      return newBooking.save();
    }
  }
};
module.exports = resolvers;
