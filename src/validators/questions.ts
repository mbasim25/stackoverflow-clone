import { Request } from "express";
import Joi from "joi";
import { Question, QuestionFilter, QuestionVote } from "../types";
import { pagination } from "./pagination";

const base = { tags: Joi.array().items(Joi.string()) };

// Question create
export const create = async (req: Request): Promise<Question> => {
  const schema = Joi.object<Question>({
    ...base,
    title: Joi.string().required(),
    body: Joi.string().required(),
    fieldId: Joi.string().required(),
  });

  return await schema.validateAsync(req.body);
};

// Question update
export const update = async (req: Request): Promise<Question> => {
  const schema = Joi.object<Question>({
    ...base,
    title: Joi.string(),
    body: Joi.string(),
    fieldId: Joi.string(),
  });

  return await schema.validateAsync(req.body);
};

// Filters
export const query = async (req: Request): Promise<QuestionFilter> => {
  const schema = Joi.object<QuestionFilter>({
    ...pagination,
    id: Joi.string().allow(""),
    userId: Joi.string().allow(""),
    minVotes: Joi.number().allow(""),
    maxVotes: Joi.number().allow(""),
    minViews: Joi.number().allow(""),
    maxViews: Joi.number().allow(""),
    title: Joi.string().allow(""),
    body: Joi.string().allow(""),
    fieldId: Joi.string().allow(""),
    tags: Joi.array().items(Joi.string().allow("")),
  });

  return await schema.validateAsync(req.query);
};

// Question votes validators

const baseVotes = {
  type: Joi.string().valid("UPVOTE", "DOWNVOTE").required(),
};

// Create validator
export const voteCreate = async (req: Request): Promise<QuestionVote> => {
  const schema = Joi.object<QuestionVote>({
    ...baseVotes,
    questionId: Joi.string().required(),
  });

  return await schema.validateAsync(req.body);
};

// Update validator
export const voteUpdate = async (req: Request): Promise<QuestionVote> => {
  const schema = Joi.object<QuestionVote>(baseVotes);

  return await schema.validateAsync(req.body);
};
