const Post = require("../../models/post/post");
const POST_UPDATED = "";
const resolver = {
  Query: {
    posts: () => Post.find({}),
    post: async (_, args) => {
      try {
        return await Post.findById({ _id: args.id });
      } catch {
        throw new Error("Query Post failed");
      }
    }
  },
  Mutation: {
    addPost: async (parent, post, { pubsub }) => {
      const { title, content } = post;
      const newPost = new Post({ title, content });

      const createdPost = await newPost.save();
      pubsub.publish(POST_UPDATED, { postUpdated: { added: createdPost } });

      return createdPost;
    },
    removePost: async (parent, post, { pubsub }) => {
      const { id } = post;
      pubsub.publish(POST_UPDATED, {
        postUpdated: { removed: { id: post.id } }
      });
      try {
        let result = await Post.findByIdAndRemove({ _id: id });
        console.log("result", result);
        if (result) {
          return true;
        }
        throw new Error("Post does not exist in DB");
      } catch {
        throw new Error("Remove post failed");
      }
    },
    updatePost: (parent, post, { pubsub }) => {
      pubsub.publish(POST_UPDATED, { postUpdated: { updated: post } });
      return Post.findOneAndUpdate(
        { _id: post.id },
        { ...post },
        { upsert: false }
      );
    }
  }
};

module.exports = resolver;
