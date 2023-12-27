import { Router } from "express";
import { join } from "path";
import { User } from "../models/index.js";
import { RegisterValidators } from "../validators/index.js";
import Validator from "../middlewares/validatorMiddleware.js";
import { randomBytes } from "crypto";
import { DOMAIN, SENDER_EMAIL } from "../constants/index.js";
import sendMailToUser from "../functions/emailSender.js";

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
 * @description To create a new user accoutnt
 * @api /users/verify-now/:verificationCode
 * @access Public <Only via email>
 * @type GET
 */

router.get("/verify-now/:verificationCode", async (req, res) => {
  try {
    let { verificationCode } = req.params;
    let user = await User.findOne({ verificationCode });
    if (!user) {
      return res.status(404).json({ success: false, message: "Unauthorized" });
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

export default router;
