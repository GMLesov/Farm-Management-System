import mongoose, { Document, Schema } from 'mongoose';

export interface ICropTask extends Document {
  cropId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  taskType: 'planting' | 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'harvest' | 'inspection' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  completedDate?: Date;
  assignedTo?: mongoose.Types.ObjectId;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  cost?: number;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CropTaskSchema: Schema = new Schema(
  {
    cropId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      required: [true, 'Crop ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    taskType: {
      type: String,
      required: [true, 'Task type is required'],
      enum: ['planting', 'irrigation', 'fertilizer', 'pesticide', 'weeding', 'harvest', 'inspection', 'other']
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true
    },
    completedDate: {
      type: Date
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    estimatedDuration: {
      type: Number,
      min: 0
    },
    actualDuration: {
      type: Number,
      min: 0
    },
    cost: {
      type: Number,
      min: 0
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
CropTaskSchema.index({ cropId: 1, scheduledDate: 1 });
CropTaskSchema.index({ status: 1, priority: 1, scheduledDate: 1 });
CropTaskSchema.index({ assignedTo: 1, status: 1, scheduledDate: 1 });

// Virtual for overdue status
CropTaskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.scheduledDate < new Date();
});

// Auto-set completedDate when status changes to completed
CropTaskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

export default mongoose.model<ICropTask>('CropTask', CropTaskSchema);
