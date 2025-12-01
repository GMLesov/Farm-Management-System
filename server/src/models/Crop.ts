import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  farm: mongoose.Types.ObjectId;
  name: string;
  type: 'grain' | 'vegetable' | 'fruit' | 'herb' | 'other';
  variety?: string;
  fieldLocation: string;
  fieldSize?: number; // in acres or hectares
  plantingDate: Date;
  expectedHarvestDate?: Date;
  actualHarvestDate?: Date;
  status: 'planning' | 'planted' | 'growing' | 'harvested' | 'failed';
  yieldAmount?: number;
  yieldUnit?: string;
  qualityGrade?: string;
  notes?: string;
  activities: Array<{
    date: Date;
    type: 'planting' | 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'harvest' | 'other';
    description: string;
    cost?: number;
    performedBy?: mongoose.Types.ObjectId;
  }>;
  expenses: Array<{
    date: Date;
    category: string;
    amount: number;
    description: string;
  }>;
  photos?: string[];
}

const CropSchema: Schema = new Schema({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide crop name']
  },
  type: {
    type: String,
    required: [true, 'Please specify crop type'],
    enum: ['grain', 'vegetable', 'fruit', 'herb', 'other']
  },
  variety: {
    type: String
  },
  fieldLocation: {
    type: String,
    required: [true, 'Please specify field location']
  },
  fieldSize: {
    type: Number
  },
  plantingDate: {
    type: Date,
    required: [true, 'Please provide planting date']
  },
  expectedHarvestDate: {
    type: Date
  },
  actualHarvestDate: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['planning', 'planted', 'growing', 'harvested', 'failed'],
    default: 'planning'
  },
  yieldAmount: {
    type: Number
  },
  yieldUnit: {
    type: String
  },
  qualityGrade: {
    type: String
  },
  notes: {
    type: String
  },
  activities: [{
    date: { type: Date, required: true },
    type: {
      type: String,
      required: true,
      enum: ['planting', 'irrigation', 'fertilizer', 'pesticide', 'weeding', 'harvest', 'other']
    },
    description: { type: String, required: true },
    cost: { type: Number },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  expenses: [{
    date: { type: Date, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String }
  }],
  photos: [String]
}, {
  timestamps: true
});

export default mongoose.model<ICrop>('Crop', CropSchema);
