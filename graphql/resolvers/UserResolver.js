const User = require("../../models/user/user");
const Access = require("../../models/accessgroup/accessgroup");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const resolver = {
  Query: {
    users: () => User.find({}),
    userWithAccess: (parent, args, { user }) => {
      // this if statement is our authentication check
      if (!user) {
        throw new Error("Not Authenticated");
      }
      return "works";
    }
  },
  Mutation: {
    addUser: async (_, args) => {
      console.log("add user", args);
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const newUser = new User({ ...args, password: hashedPassword });
      const createdUser = await newUser.save();
      return createdUser;
    },
    removeUser: async (_, args) => {
      return User.findByIdAndDelete({ _id: args.id })
        .then(() => true)
        .catch(() => false);
    },
    updateUser: async (_, args) => {
      return User.findOneAndUpdate(
        { _id: args.id },
        { ...args },
        { upsert: false }
      );
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email: email });

      if (_.isEmpty(user)) {
        throw new Error("Invalid Login");
      }
      console.log("bcrypt före", user);
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log("bcrypt efter", user);
      if (!passwordMatch) {
        throw new Error("Invalid Login");
      }
      const token = jwt.sign(
        {
          id: user._id,
          username: user.email,
          accessGroupId: user.accessGroupId
        },
        "my-secret-from-env-file-in-prod",
        {
          expiresIn: "30d" // token will expire in 30days
        }
      );
      console.log("token", token, "user", user);

      return {
        token: token,
        user: user
      };
    }
  },
  User: {
    accessGroup(parent) {
      if (parent.accessGroupId) {
        return Access.findById({ _id: parent.accessGroupId });
      } else {
        return [];
      }
    }
  }
};

module.exports = resolver;
