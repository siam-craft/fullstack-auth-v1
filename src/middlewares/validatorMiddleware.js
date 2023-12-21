import { validationResult } from "express-validator";

function validationMiddlewares(req, res, next) {
  let errors = validationResult(req);
  console.log();
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  next();
}

export default validationMiddlewares;
