import mongoose, { Document, Schema } from 'mongoose';

export interface IFeed extends Document {
  farm: mongoose.Types.ObjectId;
  name: string;
  type: 'hay' | 'grain' | 'pellets' | 'silage' | 'pasture' | 'supplement' | 'mineral' | 'other';
  brand?: string;
  supplier: string;
  nutritionFacts: {
    protein: number; // percentage
    fat: number; // percentage
    fiber: number; // percentage
    moisture: number; // percentage
    energy: number; // kcal/kg
    calcium?: number; // percentage
    phosphorus?: number; // percentage
  };
  inventory: {
    currentStock: number; // in kg
    unit: string;
    reorderLevel: number;
    lastRestocked: Date;
    costPerUnit: number;
    expiryDate?: Date;
  };
  usage: [{
    date: Date;
    animals: mongoose.Types.ObjectId[];
    quantity: number;
    notes?: string;
  }];
  suitableFor: string[]; // species this feed is suitable for
  instructions: string;
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  addUsage(usage: any): Promise<IFeed>;
  restock(quantity: number, costPerUnit?: number): Promise<IFeed>;
  updateStock(newStock: number): Promise<IFeed>;
}

const feedSchema = new Schema<IFeed>({
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['hay', 'grain', 'pellets', 'silage', 'pasture', 'supplement', 'mineral', 'other'],
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  supplier: {
    type: String,
    required: true,
    trim: true,
  },
  nutritionFacts: {
    protein: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    fiber: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    moisture: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    energy: {
      type: Number,
      required: true,
      min: 0,
    },
    calcium: {
      type: Number,
      min: 0,
      max: 100,
    },
    phosphorus: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  inventory: {
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: 'kg',
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    lastRestocked: {
      type: Date,
      required: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
    },
  },
  usage: [{
    date: {
      type: Date,
      required: true,
    },
    animals: [{
      type: Schema.Types.ObjectId,
      ref: 'Animal',
    }],
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
  }],
  suitableFor: [{
    type: String,
    enum: ['cattle', 'sheep', 'goat', 'pig', 'horse', 'chicken', 'duck', 'turkey', 'other'],
  }],
  instructions: {
    type: String,
  },
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
    transform: function(doc: any, ret: any) {
      (ret as any).id = (ret as any)._id;
      delete (ret as any)._id;
      if ((ret as any).__v !== undefined) delete (ret as any).__v;
      return ret;
    },
  },
});

// Indexes
feedSchema.index({ farm: 1 });
feedSchema.index({ type: 1 });
feedSchema.index({ 'inventory.currentStock': 1 });
feedSchema.index({ 'inventory.expiryDate': 1 });

// Virtual for low stock alert
feedSchema.virtual('isLowStock').get(function() {
  return this.inventory.currentStock <= this.inventory.reorderLevel;
});

// Virtual for expiring soon alert
feedSchema.virtual('isExpiringSoon').get(function() {
  if (!this.inventory.expiryDate) return false;
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this.inventory.expiryDate <= thirtyDaysFromNow;
});

// Methods
feedSchema.methods.addUsage = function(this: IFeed, usage: any) {
  this.usage.push(usage);
  this.inventory.currentStock -= usage.quantity;
  return this.save();
};

feedSchema.methods.restock = function(this: IFeed, quantity: number, costPerUnit?: number) {
  this.inventory.currentStock += quantity;
  this.inventory.lastRestocked = new Date();
  if (costPerUnit) {
    this.inventory.costPerUnit = costPerUnit;
  }
  return this.save();
};

feedSchema.methods.updateStock = function(this: IFeed, newStock: number) {
  this.inventory.currentStock = newStock;
  return this.save();
};

export const Feed = mongoose.model<IFeed>('Feed', feedSchema);