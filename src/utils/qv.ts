import Joi from "joi";
import joi from "joi";
import { Question } from "../types";

// Questions Validation

export const createQuestion = joi.object<Question>({
  body: Joi.string().required(),
  userId: Joi.string(),
});

export const updateQuestion = joi.object<Question>({
  body: Joi.string().required(),
  userId: Joi.string(),
});
