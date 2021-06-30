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

// Send email for password reset when non authenticated
router.post("passwords/email", controller.resetEmail);

// Update password when non authenticated
router.patch("/passwords/reset", controller.resetConfirm);

// Super admin for development only
router.post("/super", controller.super);

// JWT required for all the enpoints below
router.use(passport.authenticate("jwt", { session: false }));

// Get Profile
router.get("/profile", controller.profile);

// Update password when authenticated
router.patch("/passwords/change", controller.passwordChange);

// Update profile
router.patch("/profile", uploads.userImage, controller.updateAccount);

export default router;
