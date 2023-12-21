import { Router } from "express";
import { User } from "../models/index.js";
import {
  AuthenticateValidators,
  RegisterValidators,
} from "../validators/index.js";
import { validationResult } from "express-validator";
import Validator from "../middlewares/validatorMiddleware.js";

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
    const user = await User.findOne({ username });
  },
);

export default router;
