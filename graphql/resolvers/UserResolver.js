const _ = require("lodash");
const User = require("../../models/user/user");
const AccessGroup = require("../../models/accessgroup/accessgroup");
const AccessGroupUser = require("../../models/accessGroupUser/accessgroupuser");
const verifypass = require("../../models/user/VerifyPass");
const jwt = require("jsonwebtoken");
const { JWTSecret } = require("../../index");
const bcrypt = require("bcrypt");

const resolver = {
  Query: {
    users: async (_, __, { user }) => {
      if (!user) throw new Error("not authorized");
      if (user.admin) {
        await User.find({});
      }
      throw new Error("not authorized");
    },
    user: async (_parent, args) => await User.findById({ _id: args.id })
  },
  Mutation: {
    login: async (parent, { username, password }) => {
      const user = await User.findOne({ username: username });
      if (_.isEmpty(user)) {
        throw new Error("Invalid Login");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new Error("no password match");
      }

      const token = jwt.sign(
        {
          id: user._id,
          username: username,
          admin: user.role.includes("admin")
        },
        JWTSecret,
        {
          expiresIn: "1d" // token will expire in 1day
        }
      );
      return { user, token };
    },
    addUser: async (_parent, args) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const newUser = new User({ ...args, password: hashedPassword });
      const createdUser = await newUser.save();
      // if Access Group IDs are given
      if (!_.isEmpty(args.accessGroupIds)) {
        await AccessGroupUser.collection.insert(
          args.accessGroupIds.map(accessGroupId => ({
            userId: newUser.id,
            accessGroupId: accessGroupId
          }))
        );
      }
      return createdUser;
    },
    removeUser: async (_parent, args, { user }) => {
      if (!user) throw new Error("not authorized");
      if (user.admin) {
        AccessGroupUser.deleteMany({ userId: args.id });

        return await User.findByIdAndDelete({ _id: args.id });
      }
      throw new Error("not authorized");
    },
    updateUser: async (_parent, args) => {
      console.log("args", args);
      // Check if the accessGroupIds argument is given:
      if (!_.isUndefined(args.accessGroupIds)) {
        await AccessGroupUser.deleteMany({ userId: args.id });

        // If given a non-empty list, insert new user accesses
        if (!_.isEmpty(args.accessGroupIds)) {
          await AccessGroupUser.collection.insert(
            args.accessGroupIds.map(accessGroupId => ({
              userId: args.id,
              accessGroupId: accessGroupId
            }))
          );
        }
      }

      return await User.findOneAndUpdate({ _id: args.id }, { ...args });
    }
  },
  User: {
    async accessGroups(parent) {
      let list = await AccessGroupUser.find({ userId: parent._id });
      console.log(parent);
      if (_.isEmpty(list)) {
        return [];
      }
      return await AccessGroup.find({
        _id: { $in: list.map(item => item.accessGroupId) }
      });
    }
  }
};

module.exports = resolver;
