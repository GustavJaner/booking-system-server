const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Subscription {
    postUpdated: PostUpdated
  }
  type PostUpdated {
    added: Post
    removed: Post
    updated: Post
  }
  type Post {
    id: ID
    title: String
    content: String
  }
  type Room {
    id: ID
    start: String
    end: String
    duration: Int
    name: String
    adress: String
    description: String
    service: Service
  }

  type Booking {
    id: ID
    startTime: String
    endTime: String
    date: String
    bookedBy: String
    room: Room
  }

  type User {
    id: ID
    name: String
    email: String
    token: String # Todo
    access: String # AccessGroup
  }

  type Service {
    name: String
    id: ID
  }
  type Query {
    posts: [Post]
    post(id: ID!): Post
    rooms: [Room]
    room(id: ID!): Room
    services: [Service]
    service(id: ID!): Service
    roomByService(id: ID!): [Room]
    bookings: [Booking]
    booking(id: ID!): Booking
    bookingsByRoom(id: ID!): [Booking]
    users: [User]
  }

  type Mutation {
    addPost(title: String!, content: String!): Post
    removePost(id: ID!): Boolean
    updatePost(id: ID!, title: String, content: String): Post
    addUser(
      name: String!,
      email: String!,
      token: String!,
      access: String!
    ): User
    addRoom(
      start: String!
      end: String!
      duration: Int!
      name: String!
      adress: String!
      description: String
      serviceId: ID!
    ): Room
    removeRoom(id: ID!): Boolean
    updateRoom(
      start: String
      end: String
      duration: Int
      name: String
      adress: String
      description: String
      serviceId: ID
      id: ID!
    ): Room
    addService(name: String!): Service
    removeService(id: ID!): Boolean
    updateService(id: ID!, name: String!): Service
    addBooking(
      startTime: String!
      endTime: String!
      date: String!
      bookedBy: String!
      roomId: String!
    ): Booking
    updateBooking(
      id: ID!
      startTime: String
      endTime: String
      date: String!
      bookedBy: String
      roomId: String
    ): Booking
    removeBooking(id: ID!): Boolean
  }
  type UpdateResponse {
    success: Boolean!
    message: String
    Posts: [Post]
  }
`;
module.exports = typeDefs;
