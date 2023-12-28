import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { SECRET } from "../constants/index.js";
import { randomBytes } from "crypto";
import lodash from "lodash";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiresIn: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  let user = this;
  if (!user.isModified("password")) {
    return next();
  }
  user.password = await bcryptjs.hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

UserSchema.methods.generateJWT = async function () {
  let payload = {
    name: this.name,
    username: this.username,
    email: this.email,
    id: this._id,
  };

  return await jsonwebtoken.sign(payload, SECRET, { expiresIn: "1 day" });
};

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordExpiresIn = Date.now() + 36000000;
  this.resetPasswordToken = randomBytes(20).toString("hex");
};

UserSchema.methods.getUserInfo = function () {
  return lodash.pick(this, ["_id", "name", "username", "email", "verified"]);
};

const User = model("User", UserSchema);
export default User;
