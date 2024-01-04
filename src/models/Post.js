import { Schema, model } from "mongoose";
import paginator from "mongoose-paginate-v2";

const PostSchema = new Schema(
  {
    postImage: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

PostSchema.plugin(paginator);

const Post = model("posts", PostSchema);
export default Post;
