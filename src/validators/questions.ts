import { Request } from "express";
import Joi from "joi";
import { Question, QuestionFilter, QuestionLike } from "../types";
import { pagination } from "./pagination";

const base = { body: Joi.string() };

// Question create
export const create = async (req: Request): Promise<Question> => {
  const schema = Joi.object<Question>(base);

  return await schema.validateAsync(req.body);
};

// Question update
export const update = async (req: Request): Promise<Question> => {
  const schema = Joi.object(base);

  return await schema.validateAsync(req.body);
};

// Filters
export const query = async (req: Request): Promise<QuestionFilter> => {
  const schema = Joi.object({
    ...pagination,
    id: Joi.string().allow(""),
    userId: Joi.string().allow(""),
    minVotes: Joi.number().allow(""),
    maxVotes: Joi.number().allow(""),
    body: Joi.string().allow(""),
  });

  return await schema.validateAsync(req.query);
};

export const questionLike = Joi.object<QuestionLike>({
  questionId: Joi.string().required(),
  type: Joi.string().required(),
});

export const questionLikeUpdate = Joi.object<QuestionLike>({
  type: Joi.string().required(),
});
