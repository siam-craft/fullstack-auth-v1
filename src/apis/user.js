import { Router } from "express";
import { join, dirname } from "path";
import { User } from "../models/index.js";
import {
  RegisterValidators,
  AuthenticateValidators,
  ResetPasswordValidators,
} from "../validators/index.js";
import Validator from "../middlewares/validatorMiddleware.js";
import { randomBytes } from "crypto";
import { DOMAIN, SENDER_EMAIL } from "../constants/index.js";
import sendMailToUser from "../functions/emailSender.js";
import { fileURLToPath } from "url";
import { userAuth } from "../middlewares/auth-guard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

/**
 * @description To create a new user accoutnt
 * @api /users/api/register
 * @access Public
 * @type POST
 */

router.post(
  "/api/register",
  RegisterValidators,
  Validator,
  async (req, res) => {
    try {
      const { username, email } = req.body;
      // check if the user name is taken or not
      let user = await User.findOne({ username });
      if (user) {
        return res
          .status(400)
          .json({ success: false, error: "Username is taken" });
      }

      // check if the user exists with that email
      user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ success: false, error: "Email is taken" });
      }

      user = new User({
        ...req.body,
        verificationCode: randomBytes(20).toString("hex"),
      });

      const result = await user.save();

      // send email to the user
      const mailingHtml = `<h1>Hello ${user.username},</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${DOMAIN}users/verify-now/${user.verificationCode}" target="_blank">Verify Email</a></p>`;

      sendMailToUser(
        SENDER_EMAIL,
        result.email,
        "Varification Code",
        mailingHtml,
      );

      return res.status(201).json({
        success: true,
        message:
          "Hurrah! Your account is created. Please verify your email address",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occured", error: error.message });
    }
  },
);

/**
 * @description To varify a new user accoutnt
 * @api /users/verify-now/:verificationCode
 * @access Public <Only via email>
 * @type GET
 */

router.get("/verify-now/:verificationCode", async (req, res) => {
  try {
    let { verificationCode } = req.params;
    console.log(verificationCode, "user");
    let user = await User.findOne({ verificationCode });
    console.log(user, "user");

    if (!user) {
      return res.status(404).json({ success: false, message: "Error Unknown" });
    }

    user.verified = true;
    user.verificationCode = undefined;

    await user.save();
    return res.sendFile(
      join(__dirname, "../templates/verification-success.html"),
    );
  } catch (error) {
    console.log(error);
    return res.sendFile(join(__dirname, "../templates/errors.html"));
  }
});

/**
 * @description To authenticate an user and get auth token
 * @api /users/api/authenticate
 * @access Public
 * @type POST
 */

router.post(
  "/api/authenticate",
  AuthenticateValidators,
  Validator,
  async (req, res) => {
    try {
      let { username, password } = req.body;
      let user = await User.findOne({ username });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (!(await user.comparePassword(password))) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect Password" });
      }

      const token = await user.generateJWT();
      return res.status(200).json({
        success: true,
        user: user.getUserInfo(),
        token: `Bearer ${token}`,
        message: "You are now loggged in",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occured", error: error.message });
    }
  },
);

/**
 * @description To get the authenticated user's profile
 * @api /users/api/authenticate
 * @access Private
 * @type GET
 */

router.get("/api/authenticate", userAuth, async (req, res) => {
  console.log("REQ", req);

  return res.status(200).json({ user: req.user });
});

/**
 * @description To initiate the password reset process
 * @api /users/api/reset-password
 * @access Public
 * @type POST
 */

router.put(
  "/api/reset-password",
  ResetPasswordValidators,
  Validator,
  async (req, res) => {
    try {
      let { email } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      user.generatePasswordReset();
      const result = await user.save();

      // sent password reset link
      const mailingHtml = `<h1>Hello ${user.username},</h1>
       <p>Please click the link below to reset your password:</p>
       <p>If this password reset request not created by you you can ignore this email</p>
       <p><a href="${DOMAIN}users/reset-password-now/${user.resetPasswordToken}" target="_blank">Reset Link</a></p>`;

      sendMailToUser(
        SENDER_EMAIL,
        result.email,
        "Reset Password Link",
        mailingHtml,
      );

      return res.status(200).json({
        success: true,
        message: "Password reset link is sent to your email",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occured",
        error: error.message,
      });
    }
  },
);

/**
 * @description To get the reset password form
 * @api /users/reset-password-now/:resetPasswordToken
 * @access Restricted via email
 * @type GET
 */

router.get("/reset-password-now/:resetPasswordToken", async (req, res) => {
  try {
    let { resetPasswordToken } = req.params;
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Password reset token is invalid" });
    }
    return res.sendFile(join(__dirname, "../templates/password-reset.html"));
  } catch (error) {
    return res.sendFile(join(__dirname, "../templates/errors.html"));
  }
});

/**
 * @description To get the reset password form
 * @api /users/reset-password-now
 * @access Restricted via email
 * @type POST
 */

router.post("/api/reset-password-now", async (req, res) => {
  try {
    let { resetPasswordToken, password } = req.body;
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Password reset token is invalid" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresIn = undefined;
    const result = await user.save();
    // send notification email
    const mailingHtml = `<h1>Hello ${user.username},</h1>
       <p>Your password has been changed</p>`;

    sendMailToUser(
      SENDER_EMAIL,
      result.email,
      "Successfully reset your password",
      mailingHtml,
    );

    return res
      .status(200)
      .json({ success: true, message: "Password reset is completed" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error.message,
    });
  }
});

export default router;
