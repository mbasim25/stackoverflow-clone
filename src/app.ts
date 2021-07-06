import express, { Application } from "express";
import errorHandler from "errorhandler";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import router from "./routers";
import { secrets } from "./utils";
import { JWTStrategy } from "./utils/passport";

// Initialize the application
const app: Application = express();

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

// Authentication
app.use(passport.initialize());
passport.use("jwt", JWTStrategy);

app.use(router);

// Error handler
if (secrets.NODE_ENV === "development") {
  app.use(errorHandler());
}

export default app;
