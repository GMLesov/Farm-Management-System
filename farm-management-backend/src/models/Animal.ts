import mongoose, { Document, Schema } from 'mongoose';

export interface IAnimal extends Document {
  farm: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  identificationNumber: string; // Ear tag, RFID, etc.
  name?: string;
  species: 'cattle' | 'sheep' | 'goat' | 'pig' | 'horse' | 'chicken' | 'duck' | 'turkey' | 'other';
  breed: string;
  gender: 'male' | 'female' | 'castrated';
  dateOfBirth?: Date;
  weight?: number; // in kg
  color?: string;
  markings?: string;
  status: 'active' | 'sold' | 'deceased' | 'transferred';
  location: {
    pasture?: string;
    barn?: string;
    pen?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  parentage: {
    mother?: mongoose.Types.ObjectId;
    father?: mongoose.Types.ObjectId;
  };
  healthRecords: [{
    date: Date;
    type: 'vaccination' | 'treatment' | 'checkup' | 'injury' | 'illness' | 'surgery';
    description: string;
    veterinarian?: string;
    medications?: string[];
    dosage?: string;
    nextDue?: Date;
    cost?: number;
    notes?: string;
  }];
  breedingRecords: [{
    date: Date;
    type: 'mating' | 'pregnancy_check' | 'birth' | 'weaning';
    partner?: mongoose.Types.ObjectId;
    offspring?: mongoose.Types.ObjectId[];
    expectedDueDate?: Date;
    actualBirthDate?: Date;
    complications?: string;
    notes?: string;
  }];
  feedingSchedule: {
    feedType: string;
    quantity: number; // per day in kg
    frequency: number; // times per day
    specialRequirements?: string;
  };
  productionRecords: [{
    date: Date;
    type: 'milk' | 'eggs' | 'wool' | 'honey';
    quantity: number;
    unit: string;
    quality?: string;
    notes?: string;
  }];
  purchaseInfo: {
    purchaseDate?: Date;
    purchasePrice?: number;
    vendor?: string;
    purchaseWeight?: number;
  };
  saleInfo: {
    saleDate?: Date;
    salePrice?: number;
    buyer?: string;
    saleWeight?: number;
    reason?: string;
  };
  images: string[];
  tags: string[];
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  addHealthRecord(record: any): Promise<IAnimal>;
  addBreedingRecord(record: any): Promise<IAnimal>;
  addProductionRecord(record: any): Promise<IAnimal>;
  updateLocation(location: any): Promise<IAnimal>;
  markAsSold(saleInfo: any): Promise<IAnimal>;
  markAsDeceased(date: Date, reason?: string): Promise<IAnimal>;
}

const animalSchema = new Schema<IAnimal>({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  identificationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  species: {
    type: String,
    enum: ['cattle', 'sheep', 'goat', 'pig', 'horse', 'chicken', 'duck', 'turkey', 'other'],
    required: true,
  },
  breed: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'castrated'],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return !value || value <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  weight: {
    type: Number,
    min: 0,
  },
  color: {
    type: String,
    trim: true,
  },
  markings: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'deceased', 'transferred'],
    default: 'active',
  },
  location: {
    pasture: {
      type: String,
      trim: true,
    },
    barn: {
      type: String,
      trim: true,
    },
    pen: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  parentage: {
    mother: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
    },
    father: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
    },
  },
  healthRecords: [{
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['vaccination', 'treatment', 'checkup', 'injury', 'illness', 'surgery'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    veterinarian: {
      type: String,
    },
    medications: [{
      type: String,
    }],
    dosage: {
      type: String,
    },
    nextDue: {
      type: Date,
    },
    cost: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
  }],
  breedingRecords: [{
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['mating', 'pregnancy_check', 'birth', 'weaning'],
      required: true,
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
    },
    offspring: [{
      type: Schema.Types.ObjectId,
      ref: 'Animal',
    }],
    expectedDueDate: {
      type: Date,
    },
    actualBirthDate: {
      type: Date,
    },
    complications: {
      type: String,
    },
    notes: {
      type: String,
    },
  }],
  feedingSchedule: {
    feedType: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: Number,
      required: true,
      min: 1,
    },
    specialRequirements: {
      type: String,
    },
  },
  productionRecords: [{
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['milk', 'eggs', 'wool', 'honey'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    quality: {
      type: String,
    },
    notes: {
      type: String,
    },
  }],
  purchaseInfo: {
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    vendor: {
      type: String,
    },
    purchaseWeight: {
      type: Number,
      min: 0,
    },
  },
  saleInfo: {
    saleDate: {
      type: Date,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    buyer: {
      type: String,
    },
    saleWeight: {
      type: Number,
      min: 0,
    },
    reason: {
      type: String,
    },
  },
  images: [{
    type: String,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      (ret as any).id = (ret as any)._id;
      delete (ret as any)._id;
      if ((ret as any).__v !== undefined) delete (ret as any).__v;
      return ret;
    },
  },
});

// Indexes
animalSchema.index({ farm: 1 });
animalSchema.index({ owner: 1 });
animalSchema.index({ species: 1 });
animalSchema.index({ status: 1 });
animalSchema.index({ 'location.pasture': 1 });
animalSchema.index({ createdAt: -1 });

// Virtual for age calculation
animalSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const now = new Date();
  const birth = new Date(this.dateOfBirth);
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
});

// Methods
animalSchema.methods.addHealthRecord = function(this: IAnimal, record: any) {
  this.healthRecords.push(record);
  return this.save();
};

animalSchema.methods.addBreedingRecord = function(this: IAnimal, record: any) {
  this.breedingRecords.push(record);
  return this.save();
};

animalSchema.methods.addProductionRecord = function(this: IAnimal, record: any) {
  this.productionRecords.push(record);
  return this.save();
};

animalSchema.methods.updateLocation = function(this: IAnimal, location: any) {
  this.location = { ...this.location, ...location };
  return this.save();
};

animalSchema.methods.markAsSold = function(this: IAnimal, saleInfo: any) {
  this.status = 'sold';
  this.saleInfo = saleInfo;
  this.isActive = false;
  return this.save();
};

animalSchema.methods.markAsDeceased = function(this: IAnimal, date: Date, reason?: string) {
  this.status = 'deceased';
  this.isActive = false;
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nDeceased on ${date.toISOString()}: ${reason}` : `Deceased on ${date.toISOString()}: ${reason}`;
  }
  return this.save();
};

// Add missing methods for routes
animalSchema.methods.addHealthRecord = function(this: IAnimal, healthData: any) {
  this.healthRecords.push(healthData);
  return this.save();
};

animalSchema.methods.addBreedingRecord = function(this: IAnimal, breedingData: any) {
  this.breedingRecords.push(breedingData);
  return this.save();
};

animalSchema.methods.addProductionRecord = function(this: IAnimal, productionData: any) {
  this.productionRecords.push(productionData);
  return this.save();
};

export const Animal = mongoose.model<IAnimal>('Animal', animalSchema);