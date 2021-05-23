import Joi from "joi";
import joi from "joi";
import { Answer } from "../types";

export const createAnswer = joi.object<Answer>({
  body: Joi.string().required(),
  userId: Joi.string(),
  questionId: Joi.string(),
});

export const updateAnswer = joi.object<Answer>({
  body: Joi.string().required(),
  userId: Joi.string(),
});
