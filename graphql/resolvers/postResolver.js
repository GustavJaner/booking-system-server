const Post = require("../../models/post/post");
const POST_UPDATED = "POST_UPDATED";
const resolver = {
  Query: {
    posts: async () => {
      try {
        let result = await Post.find({});
        if (result) {
          return result;
        }
        throw new Error();
      } catch {
        throw new Error("Query Posts failed");
      }
    },
    post: async (_, args) => {
      try {
        let result = await Post.findById({ _id: args.id });
        if (result) {
          return result;
        }
        throw new Error();
      } catch {
        throw new Error("Query Post failed");
      }
    }
  },
  Mutation: {
    addPost: async (parent, post, { pubsub }) => {
      const { title, content } = post;
      const newPost = new Post({ title, content });
      try {
        const createdPost = await newPost.save();
        if (createdPost) {
          pubsub.publish(POST_UPDATED, { postUpdated: { added: createdPost } });
          return createdPost;
        }
        throw new Error();
      } catch {
        throw new Error("Add Post failed");
      }
    },
    removePost: async (parent, post, { pubsub }) => {
      const { id } = post;
      pubsub.publish(POST_UPDATED, {
        postUpdated: { removed: { id: post.id } }
      });
      try {
        let result = await Post.findByIdAndRemove({ _id: id });
        if (result) {
          return result;
        }
        throw new Error();
      } catch {
        throw new Error("Remove post failed");
      }
    },
    updatePost: async (parent, post, { pubsub }) => {
      try {
        let result = await Post.findOneAndUpdate(
          { _id: post.id },
          { ...post },
          { upsert: false }
        );
        if (result) {
          pubsub.publish(POST_UPDATED, { postUpdated: { updated: post } });
          return result;
        }
        throw new Error();
      } catch {
        throw new Error("Remove post failed");
      }
    }
  }
};

module.exports = resolver;
