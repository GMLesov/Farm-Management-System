import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  farm: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  type: 'animals' | 'crops' | 'maintenance' | 'general';
  location: string;
  deadline: Date;
  completedAt?: Date;
  notes?: string;
  photos?: string[];
  gpsLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['animals', 'crops', 'maintenance', 'general'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  photos: [{
    type: String
  }],
  gpsLocation: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

export default mongoose.model<ITask>('Task', TaskSchema);
