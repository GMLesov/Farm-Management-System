import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedingSchedule extends Document {
  animalId: mongoose.Types.ObjectId;
  feedType: string;
  amount: number;
  unit: 'kg' | 'lbs' | 'grams' | 'bags' | 'bales';
  frequency: 'daily' | 'twice-daily' | 'weekly' | 'as-needed';
  times: string[]; // Array of time strings like ["08:00", "18:00"]
  instructions?: string;
  active: boolean;
  startDate: Date;
  endDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FeedingScheduleSchema: Schema = new Schema(
  {
    animalId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal ID is required'],
      index: true
    },
    feedType: {
      type: String,
      required: [true, 'Feed type is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'lbs', 'grams', 'bags', 'bales']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: ['daily', 'twice-daily', 'weekly', 'as-needed']
    },
    times: {
      type: [String],
      required: [true, 'At least one feeding time is required'],
      validate: {
        validator: function(times: string[]) {
          return times.length > 0;
        },
        message: 'At least one feeding time must be specified'
      }
    },
    instructions: {
      type: String,
      trim: true
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date
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

// Indexes for common queries
FeedingScheduleSchema.index({ animalId: 1, active: 1 });
FeedingScheduleSchema.index({ createdAt: -1 });

// Virtual for schedule duration
FeedingScheduleSchema.virtual('durationDays').get(function() {
  if (this.endDate) {
    const diff = (this.endDate as Date).getTime() - (this.startDate as Date).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return null;
});

export default mongoose.model<IFeedingSchedule>('FeedingSchedule', FeedingScheduleSchema);
