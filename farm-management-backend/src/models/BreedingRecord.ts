import mongoose, { Document, Schema } from 'mongoose';

export interface IBreedingRecord extends Document {
  farm: mongoose.Types.ObjectId;
  femaleAnimal: mongoose.Types.ObjectId;
  maleAnimal?: mongoose.Types.ObjectId; // Optional for AI breeding
  breedingType: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  breedingDate: Date;
  expectedBirthDate: Date;
  actualBirthDate?: Date;
  outcome: {
    status: 'pending' | 'successful' | 'failed' | 'aborted';
    offspring?: {
      animalId?: mongoose.Types.ObjectId;
      gender: 'male' | 'female' | 'unknown';
      weight?: number;
      healthStatus: 'healthy' | 'complications' | 'deceased';
      notes?: string;
    }[];
    complications?: string[];
  };
  veterinarian?: {
    name: string;
    clinic: string;
    phone: string;
  };
  cost: {
    serviceFee: number;
    medicationCost: number;
    additionalCharges: number;
    totalCost: number;
  };
  notes: string;
  documents: [{
    type: 'breeding_certificate' | 'ai_record' | 'ultrasound' | 'other';
    name: string;
    url: string;
    uploadDate: Date;
  }];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const breedingRecordSchema = new Schema<IBreedingRecord>({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  femaleAnimal: {
    type: Schema.Types.ObjectId,
    ref: 'Animal',
    required: true,
  },
  maleAnimal: {
    type: Schema.Types.ObjectId,
    ref: 'Animal',
  },
  breedingType: {
    type: String,
    enum: ['natural', 'artificial_insemination', 'embryo_transfer'],
    required: true,
  },
  breedingDate: {
    type: Date,
    required: true,
  },
  expectedBirthDate: {
    type: Date,
    required: true,
  },
  actualBirthDate: {
    type: Date,
  },
  outcome: {
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'aborted'],
      default: 'pending',
    },
    offspring: [{
      animalId: {
        type: Schema.Types.ObjectId,
        ref: 'Animal',
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'unknown'],
        required: true,
      },
      weight: {
        type: Number,
        min: 0,
      },
      healthStatus: {
        type: String,
        enum: ['healthy', 'complications', 'deceased'],
        required: true,
      },
      notes: {
        type: String,
      },
    }],
    complications: [{
      type: String,
    }],
  },
  veterinarian: {
    name: {
      type: String,
      trim: true,
    },
    clinic: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  cost: {
    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    medicationCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  notes: {
    type: String,
  },
  documents: [{
    type: {
      type: String,
      enum: ['breeding_certificate', 'ai_record', 'ultrasound', 'other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
breedingRecordSchema.index({ farm: 1 });
breedingRecordSchema.index({ femaleAnimal: 1 });
breedingRecordSchema.index({ maleAnimal: 1 });
breedingRecordSchema.index({ breedingDate: 1 });
breedingRecordSchema.index({ expectedBirthDate: 1 });
breedingRecordSchema.index({ 'outcome.status': 1 });

// Pre-save middleware to calculate total cost
breedingRecordSchema.pre('save', function(this: IBreedingRecord) {
  this.cost.totalCost = 
    this.cost.serviceFee + 
    this.cost.medicationCost + 
    this.cost.additionalCharges;
});

// Methods
breedingRecordSchema.methods.addOffspring = function(this: IBreedingRecord, offspring: any) {
  if (!this.outcome.offspring) {
    this.outcome.offspring = [];
  }
  this.outcome.offspring!.push(offspring);
  return this.save();
};

breedingRecordSchema.methods.completeBreeding = function(this: IBreedingRecord, outcome: any) {
  this.outcome = { ...this.outcome, ...outcome };
  this.actualBirthDate = outcome.actualBirthDate || new Date();
  return this.save();
};

export const BreedingRecord = mongoose.model<IBreedingRecord>('BreedingRecord', breedingRecordSchema);