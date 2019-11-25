const { gql } = require("apollo-server");

const typeDefs = gql`
  # Your schema will go here
  type Organization {
    managers: [User]
    users: [User]
    accessGroups: [AccessGroup]
    rooms: [Room]
    bookings: [Booking]
    id: ID
    description: String
  }
  type User {
    id: ID
    name: String
    email: String
    token: String
    access: AccessGroup
  }
  type AccessGroup {
    id: ID
    description: String
    rooms: [Room]
  }
  type Room {
    information: RoomInformation
    bookings: [Booking]
    startTime: Moment
    endTime: Moment
    duration: Moment
    slots: Int
  }
  type Booking {
    date: Moment
    startTime: Moment
    endTime: Moment
    id: ID
    bookedBy: ID
  }
  type RoomInformation {
    name: String
    description: String
    adress: String
    id: ID
    imageURL: String
  }
`;

module.exports = typeDefs;
