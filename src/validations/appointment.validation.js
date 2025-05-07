import Joi from 'joi';

export const appointmentValidator = (data) => {
  const appointment = Joi.object({
    status: Joi.string().valid('pending', 'completed', 'rejected').required(),
    complaint: Joi.string().required(),
    patientId: Joi.string().required(),
    graphId: Joi.string().required(),
  });
  return appointment.validate(data);
};
