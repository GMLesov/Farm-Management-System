import mongoose, { Document, Schema } from 'mongoose';

export interface IBreedingRecord extends Document {
  motherId: mongoose.Types.ObjectId;
  fatherId: mongoose.Types.ObjectId;
  breedingDate: Date;
  breedingMethod: 'natural' | 'artificial-insemination';
  expectedDueDate?: Date;
  actualBirthDate?: Date;
  status: 'pending' | 'pregnant' | 'birthed' | 'failed';
  offspring: Array<{
    animalId?: mongoose.Types.ObjectId;
    gender?: 'male' | 'female';
    weight?: number;
    healthStatus?: 'healthy' | 'sick' | 'deceased';
    tagNumber?: string;
  }>;
  complications?: string;
  veterinarianNotes?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BreedingRecordSchema: Schema = new Schema(
  {
    motherId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Mother ID is required'],
      index: true
    },
    fatherId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Father ID is required'],
      index: true
    },
    breedingDate: {
      type: Date,
      required: [true, 'Breeding date is required'],
      index: true
    },
    breedingMethod: {
      type: String,
      required: [true, 'Breeding method is required'],
      enum: ['natural', 'artificial-insemination']
    },
    expectedDueDate: {
      type: Date
    },
    actualBirthDate: {
      type: Date
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'pregnant', 'birthed', 'failed'],
      default: 'pending',
      index: true
    },
    offspring: [
      {
        animalId: {
          type: Schema.Types.ObjectId,
          ref: 'Animal'
        },
        gender: {
          type: String,
          enum: ['male', 'female']
        },
        weight: {
          type: Number,
          min: 0
        },
        healthStatus: {
          type: String,
          enum: ['healthy', 'sick', 'deceased']
        },
        tagNumber: {
          type: String
        }
      }
    ],
    complications: {
      type: String,
      trim: true
    },
    veterinarianNotes: {
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
BreedingRecordSchema.index({ motherId: 1, breedingDate: -1 });
BreedingRecordSchema.index({ fatherId: 1, breedingDate: -1 });
BreedingRecordSchema.index({ status: 1, expectedDueDate: 1 });

// Validation to prevent same parent breeding
BreedingRecordSchema.pre('save', function(next) {
  if ((this.motherId as any).equals(this.fatherId)) {
    next(new Error('Mother and father cannot be the same animal'));
  } else {
    next();
  }
});

// Virtual for gestation period in days
BreedingRecordSchema.virtual('gestationDays').get(function() {
  if (this.actualBirthDate) {
    const diff = (this.actualBirthDate as Date).getTime() - (this.breedingDate as Date).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } else if (this.expectedDueDate) {
    const diff = (this.expectedDueDate as Date).getTime() - (this.breedingDate as Date).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return null;
});

export default mongoose.model<IBreedingRecord>('BreedingRecord', BreedingRecordSchema);
