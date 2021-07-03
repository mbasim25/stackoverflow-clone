import { Router } from "express";
import passport from "passport";
import controller from "../controllers/questions";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

// Get a list of questions
router.get("", controller.list);

// get a question
router.get("/:id", controller.retrieve);

// create a question
router.post("/", controller.create);

// Update a question if owner or an admin
router.patch("/:id", controller.update);

// Delete a question if owner or an admin
router.delete("/:id", controller.destroy);

export default router;
