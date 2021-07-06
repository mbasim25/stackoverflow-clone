import { Router } from "express";
import users from "./users";
import accounts from "./accounts";
import questions from "./questions";
import answers from "./answers";
import questionVotes from "./questionvotes";
import answerVotes from "./answervotes";

const router = Router();

// Routers
router.use("/users", users);
router.use("/accounts", accounts);
router.use("/questions", questions);
router.use("/answers", answers);
router.use("/question/votes", questionVotes);
router.use("/answer/votes", answerVotes);

export default router;
