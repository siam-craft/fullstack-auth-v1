import nodemailer from "nodemailer";
import { SENDER_EMAIL, SENDER_EMAIL_PASS } from "../constants/index.js";

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_EMAIL_PASS,
  },
});

const sendMailToUser = (from, to, subject = "Varification Code", html) => {
  // mailing details
  const details = {
    from,
    to,
    subject,
    html,
  };

  mailTransporter.sendMail(details, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("email sent successfully");
    }
  });
};

export default sendMailToUser;
