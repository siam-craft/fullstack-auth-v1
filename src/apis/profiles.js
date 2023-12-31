import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard.js";
import uploader from "../middlewares/uploader.js";
import { DOMAIN } from "../constants/index.js";
import { Profile } from "../models/index.js";

const router = Router();

/**
 * @description To create profile of the authenticated user
 * @api /profiles/api/create-profile
 * @access Private
 * @type POST <multipart form request>
 */

router.post(
  "/api/create-profile",
  userAuth,
  uploader.single("avatar"),
  async (req, res) => {
    try {
      let { body, file, user } = req;
      let path = DOMAIN + file.path.split("uploads/")[1];
      let profile = new Profile({
        social: body,
        account: user._id,
        avatar: path,
      });
      await profile.save();
      return res.status(200).json({
        success: true,
        message: "Profile created successfully",
      });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to create profile" });
    }
  },
);

/**
 * @description To get the authenticated user profile
 * @api /profiles/api/my-profile
 * @access Private
 * @type GET <multipart form request>
 */

router.get("/api/my-profile", userAuth, async (req, res) => {
  console.log(req.user._id);
  try {
    let profile = await Profile.findOne({ account: req.user._id }).populate(
      "account",
      "name email username",
    );
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Unable to get the profile" });
  }
});

/**
 * @description To update the authenticated user profile
 * @api /profiles/api/update-profile
 * @access Private
 * @type GET <multipart form request>
 */

export default router;
