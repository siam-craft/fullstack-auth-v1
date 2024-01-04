import { Router } from "express";
import { Post, User } from "../models/index.js";
import { DOMAIN } from "../constants/index.js";
import { userAuth } from "../middlewares/auth-guard.js";
// import uploader from "../middlewares/uploader.js";
import { PostValidator } from "../validators/index.js";
import validator from "../middlewares/validatorMiddleware.js";
import { uploadPostImage as uploader } from "../middlewares/uploader.js";

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
      console.log(file, "file");
      let path = DOMAIN + file.path.split("uploads/")[1];
      return res
        .status(200)
        .json({ success: true, message: "Image upload successfully" });
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
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Unable to create post", success: false });
    }
  },
);

export default router;
