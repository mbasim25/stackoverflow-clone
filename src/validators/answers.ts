import Joi from "joi";
import { Answer, AnswerLike } from "../types";

// Answers Validation

export const createAnswer = Joi.object<Answer>({
  body: Joi.string().required(),
  userId: Joi.string(),
  questionId: Joi.string(),
});

export const updateAnswer = Joi.object<Answer>({
  body: Joi.string().required(),
  userId: Joi.string(),
});

export const answerLike = Joi.object<AnswerLike>({
  answerId: Joi.string().required(),
  type: Joi.string().required(),
});

export const answerLikeUpdate = Joi.object<AnswerLike>({
  type: Joi.string().required(),
});
