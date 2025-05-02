import { model, Schema } from 'mongoose';

const doctorSchema = new Schema(
  {
    fullName: {
      type: String,
    },
    special: {
      type: String,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = model('Doctor', doctorSchema);
export default Doctor;
