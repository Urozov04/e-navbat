import Joi from 'joi';

export const adminValidator = (data) => {
  const admin = Joi.object({
    username: Joi.string().min(4).max(20).required(),
    password: Joi.string().min(8).max(22).required(),
  });
  return admin.validate(data);
};
