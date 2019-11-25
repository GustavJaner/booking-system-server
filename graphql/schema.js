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
  type Service {
    name: String
    id: ID
  }
  type Query {
    posts: [Post]
    post(id: ID!): Post
    rooms: [Room]
  }
  type Mutation {
    addPost(title: String!, content: String!): Post
    removePost(id: ID!): Boolean
    updatePost(id: ID!, title: String!, content: String!): Post
  }
  type UpdateResponse {
    success: Boolean!
    message: String
    Posts: [Post]
  }
`;
module.exports = typeDefs;
