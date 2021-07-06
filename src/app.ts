import express, { Application } from "express";
import errorHandler from "errorhandler";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import router from "./routers/index";
import { secrets } from "./utils";
import { JWTStrategy } from "./utils/passport";

// Initialize the application
const app: Application = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

// Security headers
app.use(cors());
app.use(helmet());

// Compress requests
app.use(compression());

// Parse incoming requests with JSON payload
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static("public"));

// Logging
const logger = morgan("tiny");
app.use(logger);

// Parse incoming requests cookies
app.use(cookieParser(secrets.SECRET_KEY));

// Authentication
app.use(passport.initialize());
passport.use("jwt", JWTStrategy);

app.use(router);

// Error handler
if (secrets.NODE_ENV === "development") {
  app.use(errorHandler());
}

export default app;
