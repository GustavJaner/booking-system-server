const Service = require("../../models/service/service");

const resolver = {
  Query: {
    services: (_, __, { user }) => {
      if (!user) throw new Error("not authorized");
      if (user) {
        return Service.find({});
      }
      throw new Error("not authorized");
    },
    service: (_, args) => Service.findById({ _id: args.id })
  },
  Mutation: {
    addService: (parent, service, { user }) => {
      if (!user) throw new Error("not authorized");
      if (user.admin) {
        return new Service({ name: service.name }).save();
      }
      throw new Error("not authorized");
    },
    removeService: (parent, service, { user }) => {
      if (!user) throw new Error("not authorized");
      if (user.admin) {
        return Service.findByIdAndRemove({ _id: service.id });
      }
      throw new Error("not authorized");
    },
    updateService: (parent, service, { pubsub }) => {
      if (!user) throw new Error("not authorized");
      if (user.admin) {
        return Service.findOneAndUpdate(
          { _id: service.id },
          { ...service },
          { upsert: false }
        );
      }
      throw new Error("not authorized");
    }
  }
};

module.exports = resolver;
