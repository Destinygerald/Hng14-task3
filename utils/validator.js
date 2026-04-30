import Joi from "joi";

export function validateProfileCreate(data) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(data);
}
