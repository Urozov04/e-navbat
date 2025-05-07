import { model, Schema } from 'mongoose';

const patientSchema = new Schema(
  {
    fullName: { type: String },
    phoneNumber: { type: String, unique: true },
    hashedPassword: { type: String },
    address: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'famale'] },
  },
  {
    timestamps: true,
  }
);

export const Patient = model('Patient', patientSchema);
