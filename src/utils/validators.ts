import Joi from "joi";
import joi from "joi";
import { User, Account, PChange } from "../types";

export const createUser = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).max(32).required(),
});

export const updateUser = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  score: Joi.number(),
});

export const superAdmin = joi.object<User>({
  id: Joi.string(),
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).required(),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  isSuperAdmin: Joi.boolean(),
  score: Joi.number(),
});

export const register = joi.object<Account>({
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).required(),
});

export const login = joi.object<Account>({
  id: Joi.string(),
  username: Joi.string().min(2).max(32).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).required(),
});

export const PassChange = joi.object<PChange>({
  password: Joi.string(),
  newPassword: Joi.string(),
});
