import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard.js";
import uploader from "../middlewares/uploader.js";
import { DOMAIN } from "../constants/index.js";
import { Profile, User } from "../models/index.js";

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

router.put(
  "/api/update-profile",
  userAuth,
  uploader.single("avatar"),
  async (req, res) => {
    try {
      let { body, file, user } = req;
      let path = DOMAIN + file.path.split("uploads/")[1];
      let profile = await Profile.findOneAndUpdate(
        { account: user._id },
        { social: body, avatar: path },
        {
          new: true,
        },
      );
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Unable to update profile",
      });
    }
  },
);

/**
 * @description To get public profile info
 * @api /api/profile-user/:username
 * @access Public
 * @type GET
 */

router.get("/api/profile-user/:username", async (req, res) => {
  try {
    let { username } = req.params;
    let user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    let profile = await Profile.findOne({ account: user._id });
    return res.status(200).json({
      success: true,
      profile: {
        ...profile.toObject(),
        account: user.getUserInfo(),
      },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Unable to get the profile" });
  }
});

export default router;
