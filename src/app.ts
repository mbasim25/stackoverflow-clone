import express, { Application } from "express";
import errorHandler from "errorhandler";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import routers from "./routers";
import { secrets } from "./utils";
import { JWTStrategy } from "./utils/passport";
import serverless from "serverless-http";
// Initialize the application
const app: Application = express();

// Security headers
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

const router = express.Router();
// Routers
router.use("/users", routers.users);
router.use("/accounts", routers.accounts);
router.use("/questions", routers.questions);
router.use("/answers", routers.answers);
router.use("/question/likes", routers.questionLike);

app.use("./netlify/functions/api", router);

exports.handler = serverless(app);
// Error handler
if (secrets.NODE_ENV === "development") {
  app.use(errorHandler());
}

export default app;
