import { Router } from "express";
import { User } from "../models/index.js";
import {
  AuthenticateValidators,
  RegisterValidators,
} from "../validators/index.js";
import Validator from "../middlewares/validatorMiddleware.js";
import { randomBytes } from "crypto";

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
      return res.status(400).json({ success: false, error: "Email is taken" });
    }

    user = new User({
      ...req.body,
      verificationCode: randomBytes(20).toString("hex"),
    });
    const result = await user.save();

    return res.status(200).json({ success: true, data: result });

    // send the email to the user
  },
);

export default router;
