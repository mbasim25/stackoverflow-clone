import { Router } from "express";
import controller from "../controllers/answers";
import passport from "passport";

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

//CRUD

// Get a list of answers
router.get("", controller.list);

// create an answer
router.post("/", controller.create);

// Update an answer if owner or an admin
router.patch("/:id", controller.update);

// Delete an answer if owner or an admin
router.delete("/:id", controller.destroy);

export default router;
