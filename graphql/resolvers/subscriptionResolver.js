const POST_UPDATED = "POST_UPDATED";

const resolver = {
  Subscription: {
    postUpdated: {
      subscribe: (_, args, { pubsub }) => pubsub.asyncIterator([POST_UPDATED])
    },
  },
};

module.exports = resolver;
