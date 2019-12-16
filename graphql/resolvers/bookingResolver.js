const Booking = require("../../models/booking/booking");
const User = require("../../models/user/user");
const Room = require("../../models/room/room");
const BOOKING_UPDATE = "BOOKING_UPDATE";

const resolver = {
  Query: {
    bookings: () => Booking.find({}),
    booking: () => (_, args) => Booking.findById({ id_: args.id }),
    bookingsByRoom: (_, args) => Booking.find({ roomId: args.id }),
    bookingsByUser: (_, args, { user }) => {
      if (!user) {
        throw new Error("not authorized");
      }
      return Booking.find({ userId: user.id });
    },
    bookingsByDate: (_, args) => Booking.find({ date: args.date })
  },
  Subscription: {
    bookingUpdate: {
      subscribe: (_, args, { pubsub }) => pubsub.asyncIterator([BOOKING_UPDATE])
    }
  },
  Mutation: {
    addBooking: async (parent, args, { user, pubsub }) => {
      if (!user) {
        throw new Error("not authorized");
      }
      const newBooking = await new Booking({ ...args, userId: user.id }).save();
      console.log();
      pubsub.publish(BOOKING_UPDATE, { bookingUpdate: { added: newBooking } });
      return newBooking;
    },
    removeBooking: (parent, booking, { pubsub }) => {
      pubsub.publish(BOOKING_UPDATE, { bookingUpdate: { removed: booking } });
      return Booking.findByIdAndRemove({ _id: booking.id });
    },
    updateBooking: (parent, booking, { pubsub }) => {
      pubsub.publish(BOOKING_UPDATE, { bookingUpdate: { updated: booking } });
      return Booking.findOneAndUpdate(
        { _id: booking.id },
        { ...booking },
        { upsert: false }
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
  }
};

module.exports = resolver;
