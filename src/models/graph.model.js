import { model, Schema } from 'mongoose';

const graphSchema = new Schema(
  {
    date: { type: Date },
    time: { type: String },
    status: { type: String, enum: ['busy', 'free'] },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  },
  { timestamps: true }
);

const Graph = model('Graph', graphSchema);
export default Graph;
