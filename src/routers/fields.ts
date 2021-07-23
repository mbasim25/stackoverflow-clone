import { Router } from "express";
import passport from "passport";
import controller from "../controllers/fields";
import { isSuper, isAdmin } from "../middlewares/permissions";
import { safe } from "../middlewares/checksafty";

const router = Router();
// List
router.get("/", safe, controller.list);

export default router;
