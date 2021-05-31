import { Router } from "express";
import controller from "../controllers/accounts";
import passport from "passport";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = Router();

// CRUD

// Registeration
router.post("/register", upload.single("image"), controller.registration);

// Login
router.post("/login", controller.login);

// Super admin for development only
router.post("/super", controller.super);

// Update password when authenticated
router.patch(
  "/p",
  passport.authenticate("jwt", { session: false }),
  controller.passwordchange
);

// Update profile image
router.patch(
  "/account-update",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  controller.updateAccount
);

// Send email for password reset when non authenticated
router.post("/email-reset", controller.emailToken);

// Update password when non authenticated
router.patch("/password-reset", controller.passReset);

export default router;
