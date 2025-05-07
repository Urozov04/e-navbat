import j from 'joi';

export const patientValidation = (data) => {
  const patient = j.object({
    fullName: j.string().min(2).required(),
    phoneNumber: Joi.string()
      .pattern(/^(\+998|998)(9[0-9]|3[3]|8[8])[0-9]{7}$/)
      .required(),
    password: j.string().min(4).max(20).required(),
    address: j.string().required(),
    age: j.number().required(),
    gender: j.string().valid('male', 'female').required(),
  });

  return patient.validate(data);
};
