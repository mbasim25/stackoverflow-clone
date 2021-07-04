import { Router } from "express";
import passport from "passport";
import controller from "../controllers/questions";
import { isOwnerOrAdmin } from "../middlewares/permissions";

const router = Router();

// Get a list of questions
router.get("", controller.list);

router.use(passport.authenticate("jwt", { session: false }));

// create
router.post("/", controller.create);

// Only the owner or an admin can perform this action

// Update
router.patch("/:id", isOwnerOrAdmin, controller.update);

// Delete
router.delete("/:id", controller.destroy);

export default router;
