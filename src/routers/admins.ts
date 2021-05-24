import { Router } from "express";
import controller from "../controllers/users";
import passport from "passport";

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// LCUD or CRUD
// router.get("", controller.list);
// router.post("/", controller.create);
router.patch("/:id", controller.update);
// router.delete("/:id", controller.destroy);

export default router;
