const Post = require("../../models/post/post");


const resolver = {
  Query: {
    posts: () => Post.find({}),
    post: (_, args) => Post.findById({ _id: args.id }),
  },
  Mutation: {
    addPost: async (parent, post, { pubsub }) => {
      const { title, content } = post;
      const newPost = new Post({ title, content });

      const createdPost = await newPost.save();
      pubsub.publish(POST_UPDATED, { postUpdated: { added: createdPost } });

      return createdPost;
    },
    removePost: (parent, post, { pubsub }) => {
      const { id } = post;
      pubsub.publish(POST_UPDATED, {
        postUpdated: { removed: { id: post.id } }
      });
      return Post.findByIdAndRemove({ _id: id })
        .then(() => true)
        .catch(() => false);
    },
    updatePost: (parent, post, { pubsub }) => {
      pubsub.publish(POST_UPDATED, { postUpdated: { updated: post } });
      return Post.findOneAndUpdate(
        { _id: post.id },
        { ...post },
        { upsert: false }
      );
    },
  },
};

module.exports = resolver;
