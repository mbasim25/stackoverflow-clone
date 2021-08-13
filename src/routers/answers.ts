import { Router } from "express";
import passport from "passport";
import controller from "../controllers/answers";
import { isOwnerOrAdmin, listMiddleWare } from "../middlewares";

const router = Router();

// List
router.get("/", listMiddleWare, controller.list);

// JWT Auth
router.use(passport.authenticate("jwt", { session: false }));

// Create
router.post("/", controller.create);

// Update
router.patch("/:id", isOwnerOrAdmin, controller.update);

// Delete
router.delete("/:id", isOwnerOrAdmin, controller.destroy);

export default router;
