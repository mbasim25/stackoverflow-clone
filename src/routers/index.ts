import { Router } from "express";
import users from "./users";
import accounts from "./accounts";
import questions from "./questions";
import answers from "./answers";
import questionLike from "./questionLike";
import answerLike from "./answerLike";

const router = Router();

// Routers
router.use("/users", users);
router.use("/accounts", accounts);
router.use("/questions", questions);
router.use("/answers", answers);
router.use("/question/likes", questionLike);

export default router;
