import { Router } from "express";
import controller from "../controllers/accounts";

// Create the router object
const router = Router();

// LCUD or CRUD
router.post("/login", controller.login);
router.post("/register", controller.registration);
// for development
router.post("/super", controller.super);

export default router;
