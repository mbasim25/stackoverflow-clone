import { Router } from "express";
import controller from "../controllers/pass";
import passport from "passport";

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

router.patch("/p", controller.passwordchange);

export default router;
