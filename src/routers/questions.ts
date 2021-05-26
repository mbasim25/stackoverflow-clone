import { Router } from "express";
import controller from "../controllers/questions";
import passport from "passport";
import { METHODS } from "http";

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// LCUD or CRUD
router.get("", controller.list);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.destroy);

export default router;
