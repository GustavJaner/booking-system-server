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
    bookingsByRoom(id: ID!): [Booking]
  }
  type Mutation {
    addPost(title: String!, content: String!): Post
    removePost(id: ID!): Boolean
    updatePost(id: ID!, title: String, content: String): Post
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
  }
  type UpdateResponse {
    success: Boolean!
    message: String
    Posts: [Post]
  }
`;
module.exports = typeDefs;
