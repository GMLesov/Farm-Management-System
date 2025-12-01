import mongoose, { Document, Schema } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  description?: string;
  organization: mongoose.Types.ObjectId;
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  size?: {
    value: number;
    unit: 'acres' | 'hectares' | 'sqft' | 'sqm';
  };
  farmType: string[];
  manager: mongoose.Types.ObjectId;
  workers: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema<IFarm>(
  {
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    size: {
      value: Number,
      unit: {
        type: String,
        enum: ['acres', 'hectares', 'sqft', 'sqm']
      }
    },
    farmType: [{
      type: String,
      enum: ['crops', 'livestock', 'dairy', 'poultry', 'mixed', 'organic', 'other']
    }],
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
FarmSchema.index({ organization: 1 });
FarmSchema.index({ manager: 1 });
FarmSchema.index({ workers: 1 });
FarmSchema.index({ isActive: 1 });
FarmSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });

export const Farm = mongoose.model<IFarm>('Farm', FarmSchema);
export default Farm;
