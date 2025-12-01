import mongoose, { Document, Schema } from 'mongoose';

export interface IAnimal extends Document {
  farm: mongoose.Types.ObjectId;
  type: 'cattle' | 'sheep' | 'goats' | 'chickens' | 'pigs' | 'other';
  name?: string;
  tagNumber: string;
  breed?: string;
  gender: 'male' | 'female';
  dateOfBirth?: Date;
  weight?: number;
  healthStatus: 'healthy' | 'sick' | 'quarantine' | 'deceased';
  location?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  notes?: string;
  vaccinations: Array<{
    name: string;
    date: Date;
    nextDue?: Date;
  }>;
  healthRecords: Array<{
    date: Date;
    type: string;
    description: string;
    treatment?: string;
    veterinarian?: string;
  }>;
  photos?: string[];
}

const AnimalSchema: Schema = new Schema({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Please specify animal type'],
    enum: ['cattle', 'sheep', 'goats', 'chickens', 'pigs', 'other']
  },
  name: {
    type: String
  },
  tagNumber: {
    type: String,
    required: [true, 'Please provide tag number'],
    unique: true
  },
  breed: {
    type: String
  },
  gender: {
    type: String,
    required: [true, 'Please specify gender'],
    enum: ['male', 'female']
  },
  dateOfBirth: {
    type: Date
  },
  weight: {
    type: Number
  },
  healthStatus: {
    type: String,
    required: true,
    enum: ['healthy', 'sick', 'quarantine', 'deceased'],
    default: 'healthy'
  },
  location: {
    type: String
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number
  },
  currentValue: {
    type: Number
  },
  notes: {
    type: String
  },
  vaccinations: [{
    name: { type: String, required: true },
    date: { type: Date, required: true },
    nextDue: { type: Date }
  }],
  healthRecords: [{
    date: { type: Date, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    treatment: { type: String },
    veterinarian: { type: String }
  }],
  photos: [String]
}, {
  timestamps: true
});

export default mongoose.model<IAnimal>('Animal', AnimalSchema);
