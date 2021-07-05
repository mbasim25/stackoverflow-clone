import { Router } from "express";
import passport from "passport";
import controller from "../controllers/answerLike";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Create
router.post("/", controller.create);

// Update
router.patch("/:id", controller.update);

// Delete
router.delete("/:id", controller.destroy);

export default router;
