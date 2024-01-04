import { Router } from "express";
import { Post, User } from "../models/index.js";
import { DOMAIN } from "../constants/index.js";
import { userAuth } from "../middlewares/auth-guard.js";
import { PostValidator } from "../validators/index.js";
import validator from "../middlewares/validatorMiddleware.js";
import { uploadPostImage as uploader } from "../middlewares/uploader.js";
import slugGenerator from "../functions/slugGenerator.js";

const router = Router();

/**
 * @description To to upload post image
 * @api /posts/api/post-image-upload
 * @access Private
 * @type POST
 */

router.post(
  "/api/post-image-upload",
  userAuth,
  uploader.single("image"),
  async (req, res) => {
    try {
      let { file } = req;
      let filename = DOMAIN + file.path.split("uploads/")[1];
      return res.status(200).json({
        filename,
        success: true,
        message: "Image upload successfully",
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Unable to uplaod image", success: false });
    }
  },
);

/**
 * @description To create a new post by the authenticated user
 * @api /posts/api/create-post
 * @access Private
 * @type POST
 */

router.post(
  "/api/create-post",
  userAuth,
  PostValidator,
  validator,
  async (req, res) => {
    try {
      // Create a new post
      let { body } = req;
      let post = new Post({
        author: req.user._id,
        ...body,
        slug: slugGenerator(body.title),
      });
      await post.save();
      return res.status(201).json({
        post,
        message: "Post created successfully",
        success: true,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Unable to create post", success: false });
    }
  },
);

/**
 * @description To create a new post by the authenticated user
 * @api /posts/api/create-post
 * @access Private
 * @type POST
 */

router.put(
  "/api/update-post/:id",
  userAuth,
  PostValidator,
  validator,
  async (req, res) => {
    try {
      let { id } = req.params;
      let { body, user } = req;
      // check if the post with the id is in the database or not?
      let post = await Post.findById(id);
      if (post.author.toString() !== user._id.toString()) {
        return res
          .status(401)
          .json({ success: false, message: "Post doesn't belong to you" });
      }
      post = await Post.findByIdAndUpdate(
        { author: user._id, _id: id },
        { ...body, slug: slugGenerator(body.title) },
        { new: true },
      );

      return res
        .status(200)
        .json({ message: "Post updated successfully", post, success: true });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Unable to update post",
      });
    }
  },
);

export default router;
