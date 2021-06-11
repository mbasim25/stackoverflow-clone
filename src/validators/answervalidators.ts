import Joi from "joi";
import joi from "joi";
import { Answer, AnswerLike } from "../types";

// Answers Validation

export const createAnswer = joi.object<Answer>({
  body: Joi.string().required(),
  userId: Joi.string(),
  questionId: Joi.string(),
});

export const updateAnswer = joi.object<Answer>({
  body: Joi.string().required(),
  userId: Joi.string(),
});

export const answerLike = joi.object<AnswerLike>({
  answerId: Joi.string().required(),
  type: Joi.string().required(),
});

export const answerLikeUpdate = joi.object<AnswerLike>({
  type: Joi.string().required(),
});
