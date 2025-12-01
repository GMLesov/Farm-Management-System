import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
  farmId: mongoose.Types.ObjectId;
  name: string;
  variety: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'herbs' | 'legumes' | 'flowers';
  fieldLocation: string;
  area: number; // in hectares
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  stage: {
    current: 'planning' | 'preparation' | 'planting' | 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturation' | 'harvest' | 'post_harvest';
    progress: number;
    expectedDuration: number;
    actualDuration?: number;
  };
  healthStatus: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    plantVigor: number;
    diseasePresence: Array<any>;
    pestPresence: Array<any>;
    nutritionalDeficiency: Array<any>;
    stressFactors: Array<any>;
    treatmentHistory: Array<any>;
    lastAssessment: string;
    nextAssessmentDue: string;
  };
  notes: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema = new Schema<ICrop>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: [100, 'Crop name cannot exceed 100 characters'],
    },
    variety: {
      type: String,
      required: [true, 'Variety is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['vegetables', 'fruits', 'grains', 'herbs', 'legumes', 'flowers'],
        message: '{VALUE} is not a valid category',
      },
    },
    fieldLocation: {
      type: String,
      required: [true, 'Field location is required'],
      trim: true,
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0.01, 'Area must be greater than 0'],
      validate: {
        validator: function(value: number) {
          return value > 0;
        },
        message: 'Area must be a positive number',
      },
    },
    plantingDate: {
      type: Date,
      required: [true, 'Planting date is required'],
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Expected harvest date is required'],
      validate: {
        validator: function(this: ICrop, value: Date) {
          return value > this.plantingDate;
        },
        message: 'Expected harvest date must be after planting date',
      },
    },
    actualHarvestDate: {
      type: Date,
    },
    stage: {
      current: {
        type: String,
        enum: ['planning', 'preparation', 'planting', 'germination', 'vegetative', 'flowering', 'fruiting', 'maturation', 'harvest', 'post_harvest'],
        default: 'planning',
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      expectedDuration: {
        type: Number,
        default: 90,
      },
      actualDuration: {
        type: Number,
      },
    },
    healthStatus: {
      overall: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
        default: 'good',
      },
      plantVigor: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      diseasePresence: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      pestPresence: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      nutritionalDeficiency: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      stressFactors: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      treatmentHistory: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      lastAssessment: {
        type: String,
        default: () => new Date().toISOString(),
      },
      nextAssessmentDue: {
        type: String,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    notes: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
CropSchema.index({ farmId: 1, category: 1 });
CropSchema.index({ farmId: 1, plantingDate: -1 });
CropSchema.index({ farmId: 1, 'stage.current': 1 });
CropSchema.index({ createdAt: -1 });

// Virtual for days until harvest
CropSchema.virtual('daysUntilHarvest').get(function(this: ICrop) {
  if (this.actualHarvestDate) return 0;
  const now = new Date();
  const harvest = new Date(this.expectedHarvestDate);
  const diff = harvest.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for crop age
CropSchema.virtual('ageInDays').get(function(this: ICrop) {
  const now = new Date();
  const planting = new Date(this.plantingDate);
  const diff = now.getTime() - planting.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

export const Crop = mongoose.model<ICrop>('Crop', CropSchema);
export default Crop;
