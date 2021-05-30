import nodemailer from "nodemailer";
import { secrets } from "../utils";

// Sending an email in case of a reset password

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: secrets.email,
    pass: secrets.password,
  },
});
