import { Router } from "express";
import passport from "passport";
import controller from "../controllers/questionvotes";
import { voteOwner } from "../middlewares/votes";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Create
router.post("/", controller.create);

// Update
router.patch("/:id", voteOwner, controller.update);

// Delete
router.delete("/:id", voteOwner, controller.destroy);

export default router;
