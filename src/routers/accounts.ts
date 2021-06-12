import { Router } from "express";
import controller from "../controllers/accounts";
import passport from "passport";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = Router();

// Registeration
router.post("/register", upload.single("image"), controller.registration);

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
  controller.passwordchange
);

// Update profile
router.patch(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  controller.updateAccount
);

// Send email for password reset when non authenticated
router.post("/email", controller.emailToken);

// Update password when non authenticated
router.patch("/passwords/reset", controller.passReset);

export default router;
