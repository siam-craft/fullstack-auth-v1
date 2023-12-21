import cors from "cors";
import express, { json } from "express";
import mongoose from "mongoose";
import consola from "consola";
import userApis from "./apis/user.js";
import { DB, PORT } from "./constants/index.js";

// initialize express app
const app = express();

// apply apllications middlewares
app.use(cors());
app.use(json());

// inject sub router and apis
app.use("/users", userApis);

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
