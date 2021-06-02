import Joi from "joi";
import joi from "joi";
import { Question, QuestionLikes } from "../types";

// Questions Validation

export const createQuestion = joi.object<Question>({
  body: Joi.string().required(),
  userId: Joi.string(),
});

export const updateQuestion = joi.object<Question>({
  body: Joi.string().required(),
  userId: Joi.string(),
});

export const questionLike = joi.object<QuestionLikes>({
  questionId: Joi.string().required(),
  type: Joi.string().required(),
});

export const questionLikeUpdate = joi.object<QuestionLikes>({
  type: Joi.string().required(),
});
