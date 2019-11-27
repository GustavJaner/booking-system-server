const Service = require("../../models/service/service");


const resolver = {
  Query: {
    services: () => Service.find({}),
    service: (_, args) => Service.findById({ _id: args.id }),
  },
  Mutation: {
    addService: (parent, service, { pubsub }) => {
      const newService = new Service({ name: service.name });
      return newService.save();
    },
    removeService: (parent, service, { pubsub }) => {
      return Service.findByIdAndRemove({ _id: service.id })
        .then(() => true)
        .catch(() => false);
    },
    updateService: (parent, service, { pubsub }) => {
      return Service.findOneAndUpdate(
        { _id: service.id },
        { ...service },
        { upsert: false }
      );
    },
  },
};

module.exports = resolver;
