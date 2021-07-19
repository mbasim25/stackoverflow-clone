import { Router } from "express";
import passport from "passport";
import controller from "../controllers/users";
import { uploads } from "../utils";
import { isSuper } from "../middlewares/permissions";

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use(isSuper);

// CRUD for the super admin

// View a list of all the users in the db
router.get("/", controller.list);

// Create a new user or an admin
router.post("/", uploads.userImage, controller.create);

// Update a user or an admin
router.patch("/:id", uploads.userImage, controller.update);

// Delete a user or an admin
router.delete("/:id", controller.destroy);

export default router;
