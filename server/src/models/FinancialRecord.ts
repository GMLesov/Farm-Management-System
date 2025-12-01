import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialRecord extends Document {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description?: string;
  paymentMethod?: 'cash' | 'bank' | 'mobile' | 'other';
  reference?: string;
  relatedTo?: {
    model: 'Animal' | 'Crop' | 'InventoryItem' | 'Task';
    id: mongoose.Types.ObjectId;
  };
  attachments?: string[];
  recordedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

const FinancialRecordSchema: Schema = new Schema({
  type: {
    type: String,
    required: [true, 'Please specify type (income or expense)'],
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: [true, 'Please specify category']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount']
  },
  date: {
    type: Date,
    required: [true, 'Please provide date'],
    default: Date.now
  },
  description: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'mobile', 'other']
  },
  reference: {
    type: String
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Animal', 'Crop', 'InventoryItem', 'Task']
    },
    id: {
      type: Schema.Types.ObjectId
    }
  },
  attachments: [String],
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster date range queries
FinancialRecordSchema.index({ date: -1 });
FinancialRecordSchema.index({ type: 1, date: -1 });

export default mongoose.model<IFinancialRecord>('FinancialRecord', FinancialRecordSchema);
