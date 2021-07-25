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

// * Auth(admin)
router.use(isAdmin);

// Activate field
router.post("/activate/:id", controller.activate);

// Deactivate field
router.post("/deactivate/:id", controller.deactivate);

//* Auth(superadmin)
router.use(isSuper);

// Create
router.post("/", controller.create);

// Update
router.patch("/:id", controller.update);

// Delete
router.delete("/:id", controller.destroy);

export default router;
