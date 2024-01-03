import { config } from "dotenv";
config();

export const DOMAIN = process.env.APP_DOMAIN;
export const PORT = process.env.PORT || process.env.APP_PORT;
export const DB = process.env.APP_DB;
export const SECRET = process.env.APP_SECRET;
export const SENDER_EMAIL = process.env.APP_HOST_EMAIL;
export const SENDER_EMAIL_PASS = process.env.APP_HOST_EMAIL_PASS;
