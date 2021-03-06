import { Router } from "express";
import passport from "passport";
import controller from "../controllers/accounts";
import { uploads } from "../utils";

const router = Router();

// Registration & Login
router.post("/register", uploads.userImage, controller.registration);
router.post("/login", controller.login);

// Refresh token
router.post("/tokens/refresh", controller.refreshToken);

// Password reset
router.post("/passwords/email", controller.resetEmail);
router.patch("/passwords/reset", controller.resetConfirm);

// Find a user by id
router.get("/user/:id", controller.retrieve);

// JWT required for all the endpoints below
router.use(passport.authenticate("jwt", { session: false }));

// Get & Update Profile
router.get("/profile", controller.profile);
router.patch("/profile", uploads.userImage, controller.updateAccount);

// Update password when authenticated
router.patch("/passwords/change", controller.passwordChange);

export default router;
