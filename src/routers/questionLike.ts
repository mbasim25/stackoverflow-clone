import { Router } from "express";
import passport from "passport";
import controller from "../controllers/questionLike";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Create
router.post("/", controller.create);

// Update
router.patch("/:id", controller.update);

// Delete a question if owner or an admin
router.delete("/:id", controller.destroy);

export default router;
