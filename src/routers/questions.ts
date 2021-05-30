import { Router } from "express";
import controller from "../controllers/questions";
import passport from "passport";

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

//CRUD

// Get a list of questions
router.get("", controller.list);

// create a question
router.post("/", controller.create);

// Update a question if owner or an admin
router.patch("/:id", controller.update);

// Delete a question if owner or an admin
router.delete("/:id", controller.destroy);

export default router;
