import { check } from "express-validator";

const name = check("name", "Name is required").not().isEmpty();
const username = check("username", "Username is required").not().isEmpty();
const email = check("email", "Email is required").isEmail();
const password = check(
  "password",
  "Password is required of minimum length of 6",
)
  .not()
  .isEmpty();

export const RegisterValidators = [name, username, email, password];
export const AuthenticateValidators = [username, password];
export const ResetPasswordValidators = [email];
