const Booking = require("../../models/booking/booking");
const User = require("../../models/user/user");
const Room = require("../../models/room/room");
const AccessGroupRoom = require("../../models/accessgrouproom/accessgrouproom");

const resolver = {
  Query: {
    bookings: () => Booking.find({}),
    booking: () => (_, args) => Booking.findById({ id_: args.id }),
    bookingsByRoom: (_, args) => Booking.find({ roomId: args.id }),
    bookingsByDate: (_, args) => Booking.find({ date: args.date })
  },
  Mutation: {
    addBooking: async (parent, booking, { user }) => {
      const newBooking = new Booking(booking);
      if (!user) {
        throw new Error("Not Authenticated");
      }
      //1. ta ut accessgroup för usern
      let userBooking = await User.findById({ _id: user.id });
      //2 kolla om accessgroupen har rätt till rummet
      let roomaccesslist = await AccessGroupRoom.find({
        accessGroupId: userBooking.accessGroupId
      });
      console.log(roomaccesslist, booking);
      //3 boka om det är ok
      if (
        roomaccesslist.filter(item => item.roomId === booking.roomId).length ===
        0
      ) {
        throw new Error("No access to the room!");
      } else {
        return newBooking.save();
      }
    },
    removeBooking: (parent, booking, { pubsub }) => {
      return Booking.findByIdAndRemove({ _id: booking.id })
        .then(() => true)
        .catch(() => false);
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
