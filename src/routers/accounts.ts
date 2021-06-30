import { Router } from "express";
import controller from "../controllers/accounts";
import passport from "passport";
import { uploads } from "../utils";

const router = Router();

// Registeration
router.post("/register", uploads.userImage, controller.registration);

// Login
router.post("/login", controller.login);

// Refresh token
router.post("/refresh-token", controller.refreshToken);

// Get Profile
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  controller.profile
);

// Super admin for development only
router.post("/super", controller.super);

// Update password when authenticated
router.patch(
  "/passwords/change",
  passport.authenticate("jwt", { session: false }),
  controller.passwordChange
);

// Update profile
router.patch(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  uploads.userImage,
  controller.updateAccount
);

// Send email for password reset when non authenticated
router.post("/email", controller.emailToken);

// Update password when non authenticated
router.patch("/passwords/reset", controller.passReset);

export default router;
