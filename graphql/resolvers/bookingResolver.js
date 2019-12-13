const Booking = require("../../models/booking/booking");
const User = require("../../models/user/user");
const Room = require("../../models/room/room");

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
  Mutation: {
    addBooking: (parent, booking, { user }) => {
      if (!user) {
        throw new Error("not authorized");
      }
      const newBooking = new Booking(...booking, { userId: user.id });
      return newBooking.save();
    },
    removeBooking: (parent, booking, { pubsub }) => {
      return Booking.findByIdAndRemove({ _id: booking.id });
    },
    updateBooking: (parent, booking, { pubsub }) => {
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
