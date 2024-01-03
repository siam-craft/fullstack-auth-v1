import { Schema, model } from "mongoose";
import paginator from "mongoose-paginate-v2";

const PostSchema = new Schema({}, { timestamps: true });

PostSchema.plugin(paginator);

const Post = model("Post", PostSchema);
export default Post;
