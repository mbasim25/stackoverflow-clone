import { Router } from "express";
import controller from "../controllers/examples";

// Create the router object
const router = Router();

// LCUD or CRUD
router.get("", controller.list);
router.post("", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.destroy);

export default router;
