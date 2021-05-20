import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({
  path: ".env",
});

const SECRET_KEY =
  process.env.SECRET_KEY || crypto.randomBytes(16).toString("hex");
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "production";

export { SECRET_KEY, PORT, NODE_ENV };
