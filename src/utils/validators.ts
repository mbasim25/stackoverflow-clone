import Joi from "joi";
import joi from "joi";
import { User, PChange, PR, ResetPass } from "../types";

// User Validation
// user = created by super admin
// account = a normal user

export const createUser = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  email: Joi.string().min(6).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).max(32).required(),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  score: Joi.number(),
});

export const updateUser = joi.object<User>({
  username: Joi.string().min(2).max(32),
  email: Joi.string().min(6),
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
  email: Joi.string().min(2).required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).required(),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
  isSuperAdmin: Joi.boolean(),
  score: Joi.number(),
});

export const register = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  email: Joi.string().required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  image: Joi.string().allow(null),
  password: Joi.string().min(6).required(),
});

export const login = joi.object<User>({
  username: Joi.string().min(2).max(32).required(),
  password: Joi.string().min(6).required(),
});

// Password update when authenticated and the old password is known
export const passChange = joi.object<PChange>({
  password: Joi.string().required(),
  newPassword: Joi.string().required(),
});

// Sending email in case of a password reset
export const emailToken = joi.object<PR>({
  email: Joi.string().required(),
});

// Password reset when the user in not authenticated and old password is forgotten
export const rPass = joi.object<ResetPass>({
  email: Joi.string().required(),
  userId: Joi.string(),
  uniqueKey: Joi.string().required().min(5).max(7),
  password: Joi.string().required(),
});
