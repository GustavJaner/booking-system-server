const express = require("express");
const { PubSub } = require("apollo-server");
const http = require("http");
const { ApolloServer } = require("apollo-server-express");
const passport = require("passport");
const { GraphQLLocalStrategy, buildContext } = require("graphql-passport");
const User = require("./models/user/user");
const mongoose = require("mongoose");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const credentials = require("./credentials");

passport.use(
  new GraphQLLocalStrategy((username, password, done) => {
    let matchingUser = User.findOne({ username: username }, (err, user) => {
      if (err) {
        done("user missing ", null);
      }
      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          done("password is wrong", null);
        } else if (isMatch) {
          done(null, matchingUser);
        }
      });
    });
  })
);

mongoose
  .connect(credentials.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => buildContext({ req, res, pubsub })
});

const app = express();
app.use(passport.initialize());

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
