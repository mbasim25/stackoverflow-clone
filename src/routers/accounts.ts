import { Router } from "express";
import controller from "../controllers/accounts";

// Create the router object
const router = Router();

// LCUD or CRUD
router.post("/login", controller.login);
router.post("/register", controller.registration);
// router.patch("/:id", controller.update);
// router.delete("/:id", controller.destroy);

export default router;
