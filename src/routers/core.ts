import { Router } from "express";
import controller from "../controllers/core";

const router = Router();

router.get("/", controller.home);

export default router;
