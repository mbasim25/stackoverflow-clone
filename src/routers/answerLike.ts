import { Router } from "express";
import controller from "../controllers/answerLike";
import passport from "passport";

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

//CRUD

// create an answer like
router.post("/", controller.create);

// Update an answer like
router.patch("/:id", controller.update);

// Delete an answer like
router.delete("/:id", controller.destroy);

export default router;
