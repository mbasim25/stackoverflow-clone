import { Router } from "express";
import controller from "../controllers/accounts";
import passport from "passport";
import { uploads } from "../utils";

const router = Router();

// Registeration & Login
router.post("/register", uploads.userImage, controller.registration);
router.post("/login", controller.login);

// Refresh token
router.post("/tokens/refresh", controller.refreshToken);

// Password reset
router.post("/passwords/email", controller.resetEmail);
router.patch("/passwords/reset", controller.resetConfirm);

// Super admin for development only
router.post("/super", controller.super);

// JWT required for all the enpoints below
router.use(passport.authenticate("jwt", { session: false }));

// Get & Update Profile
router.get("/profile", controller.profile);
router.patch("/profile", uploads.userImage, controller.updateAccount);

// Update password when authenticated
router.patch("/passwords/change", controller.passwordChange);

export default router;
