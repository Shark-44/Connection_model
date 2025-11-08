import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),

  password: passwordComplexity({
    min: 8,
    max: 50,
    numeric: 1,
    symbol: 1,
    lowerCase: 1,
    upperCase: 1,
  }).required(),

  roles: Joi.array().items(Joi.string()).optional(),
});

export const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});
  