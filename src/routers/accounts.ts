import { Router } from "express";
import controller from "../controllers/accounts";
import passport from "passport";

// Create the router object
const router = Router();

// LCUD or CRUD
router.post("/login", controller.login);
router.post("/register", controller.registration);
router.post("/super", controller.super);
router.patch(
  "/p",
  passport.authenticate("jwt", { session: false }),
  controller.passwordchange
);

export default router;
