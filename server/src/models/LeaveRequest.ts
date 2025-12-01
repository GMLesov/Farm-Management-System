import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveRequest extends Document {
  worker: mongoose.Types.ObjectId;
  type: 'vacation' | 'sick' | 'personal';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema({
  worker: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['vacation', 'sick', 'personal'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
