import { Router } from "express";
import controller from "../controllers/accounts";
import passport from "passport";
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Create the router object
const router = Router();

// LCUD or CRUD
router.post("/login", controller.login);
router.post("/register", upload.single("image"), controller.registration);
router.post("/super", controller.super);
router.patch(
  "/p",
  passport.authenticate("jwt", { session: false }),
  controller.passwordchange
);
router.patch(
  "/imageupdate",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  controller.imageUpdate
);

export default router;
