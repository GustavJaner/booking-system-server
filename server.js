const express = require("express");
const { PubSub } = require("apollo-server");
const http = require("http");

const pubsub = new PubSub();
const { ApolloServer } = require("apollo-server-express");

const mongoose = require("mongoose");

const db = require("./config").mongoURI;
mongoose
  .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const typeDefs = require("./graphql/schema");

const resolvers = require("./graphql/resolvers");

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
