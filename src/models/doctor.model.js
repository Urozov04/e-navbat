import { model, Schema } from 'mongoose';

const doctorSchema = new Schema(
  {
    fullName: { type: String },
    phoneNumber: { type: String, unique: true },
    special: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

doctorSchema.virtual('graph', {
  ref: 'Graph',
  localField: '_id',
  foreignField: 'doctorId',
});

const Doctor = model('Doctor', doctorSchema);
export default Doctor;
