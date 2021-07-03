import Joi from "joi";

const pagination = {
  skip: Joi.number().default(0),
  take: Joi.number().default(20),
};

export { pagination };
