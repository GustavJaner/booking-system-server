const User = require("../../models/user/user");
const Access = require("../../models/accessgroup/accessgroup");


const resolver = {
  Query: {
    users: () => User.find({}),
  },
  Mutation: {
    addUser: async (_, args) => {
      const newUser = new User(args);
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
  },
  User: {
    accessGroup(parent) {
      return Access.findById({ _id: parent.accessGroupId });
    }
  },
};

module.exports = resolver;
