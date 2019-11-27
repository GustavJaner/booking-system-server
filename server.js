const express = require("express");
const { PubSub } = require("apollo-server");
const http = require("http");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const credentials = require('./credentials');


mongoose
  .connect(credentials.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ pubsub })
});

const app = express();

server.applyMiddleware({ app });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
  );
});
