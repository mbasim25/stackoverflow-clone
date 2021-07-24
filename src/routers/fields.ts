import { Router } from "express";
import passport from "passport";
import controller from "../controllers/fields";
import { isSuper, isAdmin } from "../middlewares/permissions";
import { safe } from "../middlewares/checksafty";

const router = Router();
// List
router.get("/", safe, controller.list);

// JWT
router.use(passport.authenticate("jwt", { session: false }));

//* Auth(superadmin)
router.use(isSuper);

// Create
router.post("/", controller.create);

// Update
router.patch("/:id", controller.update);

// // Delete
// router.delete("/:id", controller.destroy);

export default router;
