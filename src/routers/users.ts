import { Router } from "express";
import controller from "../controllers/users";
import passport from "passport";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

// Create the router object
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

//CRUD for the super admin

// View a list of all the users in the db
router.get("", controller.list);

// Create a new user or an admin
router.post("/", upload.single("image"), controller.create);

// Update a user or an admin
router.patch("/:id", controller.update);

// Delete a user or an admin
router.delete("/:id", controller.destroy);

export default router;
