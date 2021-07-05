import { Router } from "express";
import passport from "passport";
import controller from "../controllers/questions";
import { isOwnerOrAdmin } from "../middlewares/permissions";

const router = Router();

// List
router.get("", controller.list);

// JWT AUTH
router.use(passport.authenticate("jwt", { session: false }));

// Create
router.post("/", controller.create);

// Update
router.patch("/:id", isOwnerOrAdmin, controller.update);

// Delete
router.delete("/:id", isOwnerOrAdmin, controller.destroy);

export default router;
