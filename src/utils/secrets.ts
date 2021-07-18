import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

// Fetching important data from .env file

const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "production";
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const email = process.env.email;
const password = process.env.password;

const SUPER_ADMIN = {
  USER: process.env.SUPER_ADMIN_USER,
  PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
  EMAIL: process.env.SUPER_ADMIN_EMAIL,
};

export {
  SECRET_KEY,
  PORT,
  NODE_ENV,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
  email,
  password,
  SUPER_ADMIN,
};
