import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  date: Date;
  type: 'work' | 'off' | 'leave' | 'special';
  workers?: mongoose.Types.ObjectId[];
  description?: string;
  color: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['work', 'off', 'leave', 'special'],
    required: true
  },
  workers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String
  },
  color: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
