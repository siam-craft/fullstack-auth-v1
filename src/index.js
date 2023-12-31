import cors from "cors";
import express, { json } from "express";
import mongoose from "mongoose";
import consola from "consola";
import passport from "passport";
import { DB, PORT } from "./constants/index.js";
import "./middlewares/passportMiddleware.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import profileApis from "./apis/profiles.js";
import userApis from "./apis/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// initialize express app
const app = express();

// apply apllications middlewares
app.use(cors());
app.use(json());
app.use(passport.initialize());
app.use(express.static(join(__dirname, "..", "uploads")));

// inject sub router and apis
app.use("/users", userApis);
app.use("/profiles", profileApis);

const main = async () => {
  try {
    // connect with database
    await mongoose.connect(DB);
    consola.success("connected with database");
    // start application server
    app.listen(PORT, () => {
      consola.success(`listening on port ${PORT}`);
    });
  } catch (error) {
    consola.error(`unable to connect with database`, error.message);
  }
};

main();
